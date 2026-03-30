import { useState, useEffect } from 'react'
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
  Calendar,
  Flame,
  ChevronDown,
  Check
} from 'lucide-react'

const API_URL = 'http://localhost:3001/api'

function TaskCard({ task, onStatusChange, onDelete, onPriorityChange }) {
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
  
  const isToday = task.dueDate && new Date(task.dueDate).toDateString() === new Date().toDateString()
  
  const nextStatus = {
    pending: 'inProgress',
    inProgress: 'done',
    done: 'pending'
  }
  
  return (
    <div 
      ref={setNodeRef}
      style={style}
      className={`
        flex items-center gap-3 p-3 rounded-lg bg-zinc-900/50 border border-zinc-800
        transition-all duration-200
        ${isDragging ? 'opacity-50 scale-[0.98] shadow-xl' : 'hover:border-zinc-700'}
        ${task.status === 'done' ? 'opacity-60' : ''}
      `}
    >
      <button 
        {...attributes} 
        {...listeners}
        className="text-zinc-700 hover:text-zinc-500 cursor-grab active:cursor-grabbing"
      >
        <GripVertical size={16} />
      </button>
      
      <button 
        onClick={() => onStatusChange(task._id, nextStatus[task.status])}
        className="hover:scale-110 transition-transform"
      >
        {statusIcons[task.status]}
      </button>
      
      <div className="flex-1 min-w-0">
        <p className={`text-sm truncate ${task.status === 'done' ? 'line-through text-zinc-500' : 'text-zinc-200'}`}>
          {task.title}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          {task.dueDate && (
            <span className={`text-xs ${isToday ? 'text-blue-400' : 'text-zinc-500'}`}>
              {isToday ? 'Today' : new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          )}
          {task.priority && (
            <span className={`text-xs ${priorityColors[task.priority]} flex items-center gap-1`}>
              <Flame size={12} />
            </span>
          )}
        </div>
      </div>
      
      <div className="relative">
        <button 
          onClick={() => setMenuOpen(!menuOpen)}
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
                  onClick={() => { onPriorityChange(task._id, p); setMenuOpen(false) }}
                  className={`w-full px-3 py-1.5 text-sm text-left hover:bg-zinc-700 flex items-center justify-between ${task.priority === p ? 'text-white' : 'text-zinc-400'}`}
                >
                  <span className="capitalize">{p}</span>
                  {task.priority === p && <Check size={14} className={priorityColors[p]} />}
                </button>
              ))}
              <div className="border-t border-zinc-700 my-1"></div>
              <button
                onClick={() => { onDelete(task._id); setMenuOpen(false) }}
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

function TaskList({ tasks, onStatusChange, onDelete, onPriorityChange, emptyMessage }) {
  const pendingTasks = tasks.filter(t => t.status === 'pending')
  const inProgressTasks = tasks.filter(t => t.status === 'inProgress')
  const doneTasks = tasks.filter(t => t.status === 'done')
  
  if (tasks.length === 0) {
    return (
      <div className="text-center py-16 text-zinc-600 text-sm">
        {emptyMessage}
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
  
  useEffect(() => {
    fetchTasks()
  }, [])
  
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
        <p className="text-zinc-600 text-sm mb-4">Run: cd server && npm start</p>
        <button onClick={fetchTasks} className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded text-sm">
          Retry
        </button>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="max-w-lg mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold text-zinc-100">Tasks</h1>
          <p className="text-sm text-zinc-500 mt-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </header>
        
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
            emptyMessage="No tasks yet. Add one above."
          />
        </DndContext>
      </div>
    </div>
  )
}

export default App
