import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'

const app = express()
app.use(cors())
app.use(express.json())

const MONGO_URI = 'mongodb+srv://yakubovdev:Shodiyona@cluster0.zd8gpsb.mongodb.net/taskflow?retryWrites=true&w=majority'

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB error:', err))

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  dueDate: { type: String, default: null },
  priority: { type: String, default: null },
  status: { type: String, enum: ['pending', 'inProgress', 'done'], default: 'pending' },
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
})

const sessionSchema = new mongoose.Schema({
  type: { type: String, enum: ['work', 'break', 'longBreak'], required: true },
  duration: { type: Number, required: true },
  taskId: { type: String, default: null },
  taskTitle: { type: String, default: null },
  startedAt: { type: Date },
  completedAt: { type: Date, default: Date.now }
})

const Task = mongoose.model('Task', taskSchema)
const Session = mongoose.model('Session', sessionSchema)

app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await Task.find().sort({ order: 1 })
    res.json(tasks)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/tasks', async (req, res) => {
  try {
    const task = new Task(req.body)
    await task.save()
    res.json(task)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.put('/api/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true })
    res.json(task)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.delete('/api/tasks/:id', async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id)
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/sessions', async (req, res) => {
  try {
    const session = new Session(req.body)
    await session.save()
    res.json(session)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.get('/api/sessions', async (req, res) => {
  try {
    const sessions = await Session.find().sort({ completedAt: -1 })
    res.json(sessions)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.get('/api/stats', async (req, res) => {
  try {
    const sessions = await Session.find()
    const tasks = await Task.find()
    
    const getDateRange = (days) => {
      const dates = []
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        date.setHours(0, 0, 0, 0)
        dates.push(date)
      }
      return dates
    }
    
    const getDayStats = (date) => {
      const nextDate = new Date(date)
      nextDate.setDate(nextDate.getDate() + 1)
      
      const daySessions = sessions.filter(s => {
        const sessionDate = new Date(s.completedAt)
        return sessionDate >= date && sessionDate < nextDate
      })
      
      const dayTasks = tasks.filter(t => {
        const taskDate = new Date(t.createdAt)
        return t.status === 'done' && taskDate >= date && taskDate < nextDate
      })
      
      const workSessions = daySessions.filter(s => s.type === 'work')
      const breaks = daySessions.filter(s => s.type === 'break')
      const longBreaks = daySessions.filter(s => s.type === 'longBreak')
      
      const taskBreakdown = {}
      workSessions.forEach(s => {
        if (s.taskId) {
          if (!taskBreakdown[s.taskId]) {
            taskBreakdown[s.taskId] = { title: s.taskTitle, minutes: 0, sessions: 0 }
          }
          taskBreakdown[s.taskId].minutes += s.duration
          taskBreakdown[s.taskId].sessions += 1
        }
      })
      
      return {
        date: date.toISOString().split('T')[0],
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNum: date.getDate(),
        workMinutes: workSessions.reduce((sum, s) => sum + s.duration, 0),
        breakMinutes: breaks.reduce((sum, s) => sum + s.duration, 0),
        longBreakMinutes: longBreaks.reduce((sum, s) => sum + s.duration, 0),
        sessions: workSessions.length,
        tasksCompleted: dayTasks.length,
        taskBreakdown: Object.entries(taskBreakdown).map(([id, data]) => ({ id, ...data }))
      }
    }
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const allWorkSessions = sessions.filter(s => s.type === 'work')
    const allBreaks = sessions.filter(s => s.type === 'break')
    const allLongBreaks = sessions.filter(s => s.type === 'longBreak')
    const allTasks = tasks.filter(t => t.status === 'done')
    
    const totalTaskTime = {}
    allWorkSessions.forEach(s => {
      if (s.taskId) {
        if (!totalTaskTime[s.taskId]) {
          totalTaskTime[s.taskId] = { title: s.taskTitle, minutes: 0 }
        }
        totalTaskTime[s.taskId].minutes += s.duration
      }
    })
    
    res.json({
      total: {
        workMinutes: allWorkSessions.reduce((sum, s) => sum + s.duration, 0),
        breakMinutes: allBreaks.reduce((sum, s) => sum + s.duration, 0),
        longBreakMinutes: allLongBreaks.reduce((sum, s) => sum + s.duration, 0),
        sessions: allWorkSessions.length,
        shortBreaks: allBreaks.length,
        longBreaks: allLongBreaks.length,
        tasksCompleted: allTasks.length
      },
      today: getDayStats(today),
      last7Days: getDateRange(7).map(date => getDayStats(date)),
      last30Days: getDateRange(30).map(date => getDayStats(date)),
      taskTimeBreakdown: Object.entries(totalTaskTime).map(([id, data]) => ({ id, ...data }))
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
