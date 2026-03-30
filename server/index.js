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

const Task = mongoose.model('Task', taskSchema)

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

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
