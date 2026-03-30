import { useState, useEffect, useRef } from 'react'
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { 
  Plus, 
  Circle, 
  Clock, 
  CheckCircle2, 
  Trash2,
  GripVertical,
  Flame,
  ChevronDown,
  Check,
  Play,
  Pause,
  RotateCcw,
  Coffee,
  X,
  BarChart3,
  Calendar,
  Timer,
  Target,
  Sun,
  Moon
} from 'lucide-react'

const API_URL = 'https://taskflow-1-ji7r.onrender.com/api'

function TimerModal({ isOpen, onClose, onSave, initialDuration = 25 }) {
  const [minutes, setMinutes] = useState(initialDuration)
  const [timeLeft, setTimeLeft] = useState(initialDuration * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [mode, setMode] = useState('work')
  const intervalRef = useRef(null)
  
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      setIsRunning(false)
      onSave(mode, minutes)
      onClose()
    }
    return () => clearInterval(intervalRef.current)
  }, [isRunning, timeLeft])
  
  if (!isOpen) return null
  
  const currentMinutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  
  const handleSave = () => {
    onSave(mode, minutes)
    onClose()
  }
  
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-zinc-100">Timer</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300">
            <X size={20} />
          </button>
        </div>
        
        <div className="flex justify-center mb-6">
          <div className="text-6xl font-mono text-zinc-100">
            {String(currentMinutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
        </div>
        
        <div className="flex justify-center gap-3 mb-6">
          <button
            onClick={() => { setMode('work'); setMinutes(25); setTimeLeft(25 * 60); setIsRunning(false) }}
            className={`px-4 py-2 rounded-lg text-sm ${mode === 'work' ? 'bg-rose-500 text-white' : 'bg-zinc-800 text-zinc-400'}`}
          >
            <Sun size={16} className="inline mr-1" /> Work
          </button>
          <button
            onClick={() => { setMode('break'); setMinutes(5); setTimeLeft(5 * 60); setIsRunning(false) }}
            className={`px-4 py-2 rounded-lg text-sm ${mode === 'break' ? 'bg-emerald-500 text-white' : 'bg-zinc-800 text-zinc-400'}`}
          >
            <Coffee size={16} className="inline mr-1" /> Break
          </button>
          <button
            onClick={() => { setMode('longBreak'); setMinutes(15); setTimeLeft(15 * 60); setIsRunning(false) }}
            className={`px-4 py-2 rounded-lg text-sm ${mode === 'longBreak' ? 'bg-blue-500 text-white' : 'bg-zinc-800 text-zinc-400'}`}
          >
            <Moon size={16} className="inline mr-1" /> Long
          </button>
        </div>
        
        {!isRunning ? (
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-3">
              <label className="text-xs text-zinc-500">Minutes:</label>
              <input
                type="number"
                min="1"
                max="120"
                value={minutes}
                onChange={(e) => { 
                  const val = parseInt(e.target.value) || 1
                  setMinutes(Math.min(120, Math.max(1, val)))
                  setTimeLeft(Math.min(120, Math.max(1, val)) * 60)
                }}
                className="w-20 bg-zinc-800 border border-zinc-700 rounded px-3 py-1 text-zinc-100 text-center"
              />
            </div>
            <button
              onClick={() => setIsRunning(true)}
              className="w-full py-3 bg-rose-500 text-white rounded-lg font-medium hover:bg-rose-600 transition-colors flex items-center justify-center gap-2"
            >
              <Play size={18} /> Start
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <button
              onClick={() => setIsRunning(false)}
              className="w-full py-3 bg-zinc-800 text-zinc-300 rounded-lg font-medium hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2"
            >
              <Pause size={18} /> Pause
            </button>
            <button
              onClick={handleSave}
              className="w-full py-3 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 transition-colors"
            >
              Save & Stop
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function StatsModal({ isOpen, onClose, stats }) {
  if (!isOpen || !stats) return null
  
  const formatTime = (mins) => {
    const h = Math.floor(mins / 60)
    const m = mins % 60
    if (h > 0) return `${h}h ${m}m`
    return `${m}m`
  }
  
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
            <BarChart3 size={20} /> Statistics
          </h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300">
            <X size={20} />
          </button>
        </div>
        
        <div className="overflow-y-auto p-4 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-zinc-800/50 rounded-xl p-4">
              <p className="text-xs text-zinc-500 mb-1">Total Work</p>
              <p className="text-2xl font-bold text-rose-400">{formatTime(stats.total.workMinutes)}</p>
            </div>
            <div className="bg-zinc-800/50 rounded-xl p-4">
              <p className="text-xs text-zinc-500 mb-1">Breaks</p>
              <p className="text-2xl font-bold text-emerald-400">{formatTime(stats.total.breakMinutes + stats.total.longBreakMinutes)}</p>
            </div>
            <div className="bg-zinc-800/50 rounded-xl p-4">
              <p className="text-xs text-zinc-500 mb-1">Sessions</p>
              <p className="text-2xl font-bold text-zinc-100">{stats.total.sessions}</p>
            </div>
            <div className="bg-zinc-800/50 rounded-xl p-4">
              <p className="text-xs text-zinc-500 mb-1">Tasks Done</p>
              <p className="text-2xl font-bold text-blue-400">{stats.total.tasksCompleted}</p>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-zinc-300 mb-3">Today</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-zinc-800/50 rounded-lg p-3">
                <p className="text-xs text-zinc-500">Work</p>
                <p className="text-lg font-semibold text-rose-400">{formatTime(stats.today.workMinutes)}</p>
              </div>
              <div className="bg-zinc-800/50 rounded-lg p-3">
                <p className="text-xs text-zinc-500">Breaks</p>
                <p className="text-lg font-semibold text-emerald-400">{formatTime(stats.today.breakMinutes + stats.today.longBreakMinutes)}</p>
              </div>
              <div className="bg-zinc-800/50 rounded-lg p-3">
                <p className="text-xs text-zinc-500">Sessions</p>
                <p className="text-lg font-semibold text-zinc-100">{stats.today.sessions}</p>
              </div>
              <div className="bg-zinc-800/50 rounded-lg p-3">
                <p className="text-xs text-zinc-500">Tasks</p>
                <p className="text-lg font-semibold text-blue-400">{stats.today.tasksCompleted}</p>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-zinc-300 mb-3">Last 7 Days</h3>
            <div className="space-y-2">
              {stats.last7Days.map(day => (
                <div key={day.date} className="flex items-center gap-4 bg-zinc-800/50 rounded-lg p-3">
                  <div className="w-12 text-center">
                    <p className="text-xs text-zinc-500">{day.dayName}</p>
                    <p className="text-lg font-semibold text-zinc-200">{day.dayNum}</p>
                  </div>
                  <div className="flex-1 grid grid-cols-4 gap-2 text-center text-xs">
                    <div>
                      <p className="text-zinc-500">Work</p>
                      <p className="text-rose-400 font-medium">{formatTime(day.workMinutes)}</p>
                    </div>
                    <div>
                      <p className="text-zinc-500">Breaks</p>
                      <p className="text-emerald-400 font-medium">{formatTime(day.breakMinutes + day.longBreakMinutes)}</p>
                    </div>
                    <div>
                      <p className="text-zinc-500">Sessions</p>
                      <p className="text-zinc-200 font-medium">{day.sessions}</p>
                    </div>
                    <div>
                      <p className="text-zinc-500">Tasks</p>
                      <p className="text-blue-400 font-medium">{day.tasksCompleted}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {stats.taskTimeBreakdown && stats.taskTimeBreakdown.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-zinc-300 mb-3">Time per Task</h3>
              <div className="space-y-2">
                {stats.taskTimeBreakdown.map(task => (
                  <div key={task.id} className="flex items-center justify-between bg-zinc-800/50 rounded-lg p-3">
                    <span className="text-sm text-zinc-200 truncate flex-1">{task.title}</span>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-zinc-500">{task.sessions} sessions</span>
                      <span className="text-rose-400 font-medium">{formatTime(task.minutes)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function TaskCard({ task, onStatusChange, onDelete, onPriorityChange, onSelect, isSelected, isWorking }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task._id })
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }
  
  const [menuOpen, setMenuOpen] = useState(false)
  
  const statusIcons = {
    pending: <Circle size={18} className="text-zinc-600" fill="none" />,
    inProgress: <Clock size={18} className="text-blue-500" />,
    done: <CheckCircle2 size={18} className="text-emerald-500" />,
  }
  
  const priorityColors = {
    low: 'text-emerald-500',
    medium: 'text-amber-500',
    high: 'text-rose-500',
  }
  
  const nextStatus = {
    pending: 'inProgress',
    inProgress: 'done',
    done: 'pending'
  }
  
  return (
    <div 
      ref={setNodeRef}
      style={style}
      onClick={() => onSelect(task)}
      className={`
        flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 cursor-pointer
        ${isDragging ? 'opacity-50 scale-[0.98] shadow-xl' : ''}
        ${isSelected ? 'bg-zinc-800/50 border-zinc-700' : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700'}
        ${isWorking ? 'border-rose-500/50' : ''}
        ${task.status === 'done' ? 'opacity-60' : ''}
      `}
    >
      {isWorking && <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500 rounded-l"></div>}
      
      <button 
        {...attributes} 
        {...listeners}
        onClick={(e) => e.stopPropagation()}
        className="text-zinc-700 hover:text-zinc-500 cursor-grab active:cursor-grabbing"
      >
        <GripVertical size={16} />
      </button>
      
      <button 
        onClick={(e) => { e.stopPropagation(); onStatusChange(task._id, nextStatus[task.status]) }}
        className="hover:scale-110 transition-transform"
      >
        {statusIcons[task.status]}
      </button>
      
      <div className="flex-1 min-w-0">
        <p className={`text-sm truncate ${task.status === 'done' ? 'line-through text-zinc-500' : 'text-zinc-200'}`}>
          {task.title}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          {task.priority && (
            <span className={`text-xs ${priorityColors[task.priority]} flex items-center gap-1`}>
              <Flame size={12} />
            </span>
          )}
        </div>
      </div>
      
      <div className="relative">
        <button 
          onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen) }}
          className="p-1.5 text-zinc-600 hover:text-zinc-400 hover:bg-zinc-800 rounded transition-colors"
        >
          <ChevronDown size={16} />
        </button>
        
        {menuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-0 top-full mt-1 w-40 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl z-20 py-1">
              <p className="px-3 py-1.5 text-xs text-zinc-500">Priority</p>
              {['low', 'medium', 'high'].map(p => (
                <button
                  key={p}
                  onClick={(e) => { e.stopPropagation(); onPriorityChange(task._id, p); setMenuOpen(false) }}
                  className={`w-full px-3 py-1.5 text-sm text-left hover:bg-zinc-700 flex items-center justify-between ${task.priority === p ? 'text-white' : 'text-zinc-400'}`}
                >
                  <span className="capitalize">{p}</span>
                  {task.priority === p && <Check size={14} className={priorityColors[p]} />}
                </button>
              ))}
              <div className="border-t border-zinc-700 my-1"></div>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(task._id); setMenuOpen(false) }}
                className="w-full px-3 py-1.5 text-sm text-left text-rose-400 hover:bg-zinc-700"
              >
                Delete
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function AddTaskForm({ onAdd }) {
  const [title, setTitle] = useState('')
  
  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title.trim()) return
    
    onAdd({
      title: title.trim(),
      dueDate: null,
      priority: null,
      status: 'pending',
      order: Date.now(),
    })
    
    setTitle('')
  }
  
  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-3 p-3 rounded-lg bg-zinc-900/50 border border-zinc-800 mb-6">
      <Plus size={18} className="text-zinc-600" />
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Add a task..."
        className="flex-1 bg-transparent text-sm outline-none placeholder:text-zinc-600 text-zinc-200"
      />
      <button 
        type="submit"
        disabled={!title.trim()}
        className="px-3 py-1 bg-zinc-800 text-zinc-400 text-xs rounded hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Add
      </button>
    </form>
  )
}

function TaskList({ tasks, onStatusChange, onDelete, onPriorityChange, onSelect, selectedTask }) {
  const pendingTasks = tasks.filter(t => t.status === 'pending')
  const inProgressTasks = tasks.filter(t => t.status === 'inProgress')
  const doneTasks = tasks.filter(t => t.status === 'done')
  
  if (tasks.length === 0) {
    return (
      <div className="text-center py-16 text-zinc-600 text-sm">
        No tasks yet. Add one above.
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      {pendingTasks.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Circle size={14} className="text-zinc-600" />
            <span className="text-xs text-zinc-500 uppercase tracking-wider">To Do ({pendingTasks.length})</span>
          </div>
          <SortableContext items={pendingTasks.map(t => t._id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {pendingTasks.map(task => (
                <TaskCard 
                  key={task._id} 
                  task={task}
                  onStatusChange={onStatusChange}
                  onDelete={onDelete}
                  onPriorityChange={onPriorityChange}
                  onSelect={onSelect}
                  isSelected={selectedTask?._id === task._id}
                />
              ))}
            </div>
          </SortableContext>
        </div>
      )}
      
      {inProgressTasks.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Clock size={14} className="text-blue-500" />
            <span className="text-xs text-zinc-500 uppercase tracking-wider">In Progress ({inProgressTasks.length})</span>
          </div>
          <SortableContext items={inProgressTasks.map(t => t._id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {inProgressTasks.map(task => (
                <TaskCard 
                  key={task._id} 
                  task={task}
                  onStatusChange={onStatusChange}
                  onDelete={onDelete}
                  onPriorityChange={onPriorityChange}
                  onSelect={onSelect}
                  isSelected={selectedTask?._id === task._id}
                />
              ))}
            </div>
          </SortableContext>
        </div>
      )}
      
      {doneTasks.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 size={14} className="text-emerald-500" />
            <span className="text-xs text-zinc-500 uppercase tracking-wider">Done ({doneTasks.length})</span>
          </div>
          <SortableContext items={doneTasks.map(t => t._id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {doneTasks.map(task => (
                <TaskCard 
                  key={task._id} 
                  task={task}
                  onStatusChange={onStatusChange}
                  onDelete={onDelete}
                  onPriorityChange={onPriorityChange}
                  onSelect={onSelect}
                  isSelected={selectedTask?._id === task._id}
                />
              ))}
            </div>
          </SortableContext>
        </div>
      )}
    </div>
  )
}

function App() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedTask, setSelectedTask] = useState(null)
  const [showTimer, setShowTimer] = useState(false)
  const [showStats, setShowStats] = useState(false)
  const [stats, setStats] = useState(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )
  
  const fetchTasks = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API_URL}/tasks`)
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setTasks(data)
      setError(null)
    } catch (err) {
      setError('Cannot connect to server')
    } finally {
      setLoading(false)
    }
  }
  
  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_URL}/stats`)
      const data = await res.json()
      setStats(data)
    } catch (err) {
      console.error('Failed to fetch stats:', err)
    }
  }
  
  useEffect(() => {
    fetchTasks()
  }, [])
  
  useEffect(() => {
    if (showStats) {
      fetchStats()
    }
  }, [showStats])
  
  const addTask = async (taskData) => {
    try {
      const res = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
      })
      const newTask = await res.json()
      setTasks(prev => [...prev, newTask])
    } catch (err) {
      console.error(err)
    }
  }
  
  const updateTaskStatus = async (taskId, status) => {
    try {
      await fetch(`${API_URL}/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status } : t))
    } catch (err) {
      console.error(err)
    }
  }
  
  const updateTaskPriority = async (taskId, priority) => {
    try {
      await fetch(`${API_URL}/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priority }),
      })
      setTasks(prev => prev.map(t => t._id === taskId ? { ...t, priority } : t))
    } catch (err) {
      console.error(err)
    }
  }
  
  const deleteTask = async (taskId) => {
    try {
      await fetch(`${API_URL}/tasks/${taskId}`, { method: 'DELETE' })
      setTasks(prev => prev.filter(t => t._id !== taskId))
      if (selectedTask?._id === taskId) setSelectedTask(null)
    } catch (err) {
      console.error(err)
    }
  }
  
  const handleDragEnd = async (event) => {
    const { active, over } = event
    
    if (active.id !== over?.id) {
      setTasks((items) => {
        const oldIndex = items.findIndex(t => t._id === active.id)
        const newIndex = items.findIndex(t => t._id === over?.id)
        const newItems = arrayMove(items, oldIndex, newIndex)
        
        newItems.forEach((item, index) => {
          fetch(`${API_URL}/tasks/${item._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order: index }),
          })
        })
        
        return newItems
      })
    }
  }
  
  const saveSession = async (mode, duration) => {
    try {
      await fetch(`${API_URL}/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: mode,
          duration,
          taskId: selectedTask?._id || null,
          taskTitle: selectedTask?.title || null,
          startedAt: new Date().toISOString(),
          completedAt: new Date().toISOString()
        }),
      })
    } catch (err) {
      console.error(err)
    }
  }
  
  const pendingCount = tasks.filter(t => t.status === 'pending').length
  const doneCount = tasks.filter(t => t.status === 'done').length
  
  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-zinc-600">Loading...</div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-8">
        <p className="text-rose-500 mb-4">{error}</p>
        <button onClick={fetchTasks} className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded text-sm">
          Retry
        </button>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="max-w-lg mx-auto px-4 py-8">
        <header className="mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-semibold text-zinc-100">Tasks</h1>
              <p className="text-sm text-zinc-500 mt-1">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <button 
              onClick={() => setShowStats(true)}
              className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 transition-colors"
            >
              <BarChart3 size={20} />
            </button>
          </div>
        </header>
        
        <div className="flex gap-4 mb-6">
          <button 
            onClick={() => setShowTimer(true)}
            className={`flex-1 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
              selectedTask 
                ? 'bg-rose-500 text-white hover:bg-rose-600' 
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
            }`}
          >
            <Timer size={18} />
            {selectedTask ? 'Start Timer' : 'Select a task'}
          </button>
        </div>
        
        {selectedTask && (
          <div className="mb-4 p-3 bg-zinc-900/50 border border-zinc-800 rounded-lg flex items-center gap-3">
            <Target size={16} className="text-rose-400" />
            <span className="text-sm text-zinc-300 truncate flex-1">{selectedTask.title}</span>
            <button 
              onClick={() => setSelectedTask(null)}
              className="text-zinc-600 hover:text-zinc-400"
            >
              <X size={16} />
            </button>
          </div>
        )}
        
        <div className="flex gap-6 mb-4 text-sm">
          <span className="text-zinc-400">{pendingCount} pending</span>
          <span className="text-zinc-600">|</span>
          <span className="text-emerald-500">{doneCount} done</span>
        </div>
        
        <AddTaskForm onAdd={addTask} />
        
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <TaskList 
            tasks={tasks} 
            onStatusChange={updateTaskStatus}
            onDelete={deleteTask}
            onPriorityChange={updateTaskPriority}
            onSelect={setSelectedTask}
            selectedTask={selectedTask}
          />
        </DndContext>
      </div>
      
      <TimerModal 
        isOpen={showTimer} 
        onClose={() => setShowTimer(false)} 
        onSave={saveSession}
      />
      
      <StatsModal 
        isOpen={showStats} 
        onClose={() => setShowStats(false)} 
        stats={stats}
      />
    </div>
  )
}

export default App
