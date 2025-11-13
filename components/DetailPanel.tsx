'use client'

import { useState } from 'react'
import { X, Plus, Calendar, CheckSquare, FileText, Lightbulb } from 'lucide-react'
import { format } from 'date-fns'
import { useStore, Task } from '@/lib/store'

interface Project {
  id: string
  name: string
  description: string
  color: string
  icon: string
  tasks: Task[]
  notes: any[]
  ideas: any[]
}

interface DetailPanelProps {
  project: Project | null
  onClose: () => void
  onRefresh: () => void
}

export default function DetailPanel({ project, onClose, onRefresh }: DetailPanelProps) {
  const [activeTab, setActiveTab] = useState<'tasks' | 'notes' | 'ideas'>('tasks')
  const [isAddingTask, setIsAddingTask] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const { addTask, updateTask } = useStore()

  if (!project) return null

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return

    addTask({
      title: newTaskTitle,
      description: '',
      status: 'todo',
      priority: 'medium',
      dueDate: null,
      source: 'manual',
      externalId: null,
      url: null,
      projectId: project.id,
    })

    setNewTaskTitle('')
    setIsAddingTask(false)
    onRefresh()
  }

  const handleToggleTask = (task: Task) => {
    updateTask(task.id, {
      status: task.status === 'done' ? 'todo' : 'done',
    })
    onRefresh()
  }

  return (
    <div className="w-96 bg-gray-900 border-l border-gray-800 flex flex-col h-full">
      <div className="p-4 border-b border-gray-800 flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-3xl">{project.icon}</span>
            <h2 className="text-xl font-bold text-white">{project.name}</h2>
          </div>
          {project.description && (
            <p className="text-sm text-gray-400">{project.description}</p>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex border-b border-gray-800">
        <button
          onClick={() => setActiveTab('tasks')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
            activeTab === 'tasks'
              ? 'text-white border-b-2 border-indigo-500'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          Tasks ({project.tasks?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('notes')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
            activeTab === 'notes'
              ? 'text-white border-b-2 border-indigo-500'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" />
          Notes ({project.notes?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('ideas')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
            activeTab === 'ideas'
              ? 'text-white border-b-2 border-indigo-500'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Lightbulb className="w-4 h-4" />
          Ideas ({project.ideas?.length || 0})
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'tasks' && (
          <div className="space-y-2">
            {project.tasks?.map((task) => (
              <div
                key={task.id}
                className="p-3 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors"
              >
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    checked={task.status === 'done'}
                    onChange={() => handleToggleTask(task)}
                    className="mt-1 w-4 h-4 rounded border-gray-600 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div className="flex-1">
                    <p
                      className={`text-sm ${
                        task.status === 'done'
                          ? 'line-through text-gray-500'
                          : 'text-white'
                      }`}
                    >
                      {task.title}
                    </p>
                    {task.description && (
                      <p className="text-xs text-gray-500 mt-1">{task.description}</p>
                    )}
                    {task.dueDate && (
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(task.dueDate), 'MMM d, yyyy')}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {isAddingTask ? (
              <div className="p-3 bg-gray-800 rounded-lg">
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
                  placeholder="Task title..."
                  className="w-full bg-transparent text-white text-sm outline-none"
                  autoFocus
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={handleAddTask}
                    className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs rounded transition-colors"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => {
                      setIsAddingTask(false)
                      setNewTaskTitle('')
                    }}
                    className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsAddingTask(true)}
                className="w-full px-3 py-2 bg-gray-800 hover:bg-gray-750 text-gray-400 hover:text-white rounded-lg flex items-center justify-center gap-2 transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Task
              </button>
            )}
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="space-y-2">
            {project.notes?.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-8">No notes yet</p>
            )}
            {project.notes?.map((note) => (
              <div key={note.id} className="p-3 bg-gray-800 rounded-lg">
                <h4 className="text-sm font-medium text-white mb-1">{note.title}</h4>
                <p className="text-xs text-gray-400 line-clamp-3">{note.content}</p>
                <p className="text-xs text-gray-600 mt-2">
                  {format(new Date(note.createdAt), 'MMM d, yyyy')}
                </p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'ideas' && (
          <div className="space-y-2">
            {project.ideas?.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-8">No ideas yet</p>
            )}
            {project.ideas?.map((idea) => (
              <div key={idea.id} className="p-3 bg-gray-800 rounded-lg">
                <h4 className="text-sm font-medium text-white mb-1">{idea.title}</h4>
                <p className="text-xs text-gray-400 line-clamp-3">{idea.content}</p>
                <p className="text-xs text-gray-600 mt-2">
                  {format(new Date(idea.createdAt), 'MMM d, yyyy')}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
