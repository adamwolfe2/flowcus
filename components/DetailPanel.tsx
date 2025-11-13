'use client'

import { useState } from 'react'
import { X, Plus, Calendar, CheckSquare, FileText, Lightbulb, Target, TrendingUp } from 'lucide-react'
import { format } from 'date-fns'
import { useStore, Rock, SubRock, Task, Note, Idea, RockStatus } from '@/lib/store'
import StatusBadge from './rocks/StatusBadge'
import ProgressBar from './rocks/ProgressBar'
import SubRockList from './rocks/SubRockList'

interface RockWithDetails extends Rock {
  subRocks: SubRock[]
  tasks: Task[]
  notes: Note[]
  ideas: Idea[]
}

interface DetailPanelProps {
  rock: RockWithDetails | null
  onClose: () => void
  onRefresh: () => void
}

export default function DetailPanel({ rock, onClose, onRefresh }: DetailPanelProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'subrocks' | 'tasks' | 'notes' | 'ideas'>('overview')
  const [isAddingTask, setIsAddingTask] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const { addTask, updateTask, updateRock } = useStore()

  if (!rock) return null

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return

    addTask({
      title: newTaskTitle,
      description: '',
      rockId: rock.id,
      subRockId: null,
      status: 'todo',
      priority: 'medium',
      dueDate: null,
      completedDate: null,
      source: 'manual',
      externalId: null,
      url: null,
      tags: [],
      timeEstimate: null,
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
            <span className="text-3xl">{rock.icon}</span>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white">{rock.name}</h2>
              {rock.category && (
                <p className="text-xs text-gray-500">{rock.category}</p>
              )}
            </div>
          </div>
          {rock.description && (
            <p className="text-sm text-gray-400">{rock.description}</p>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex border-b border-gray-800 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 whitespace-nowrap ${
            activeTab === 'overview'
              ? 'text-white border-b-2 border-indigo-500'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Target className="w-4 h-4" />
          Overview
        </button>
        <button
          onClick={() => setActiveTab('subrocks')}
          className={`px-3 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 whitespace-nowrap ${
            activeTab === 'subrocks'
              ? 'text-white border-b-2 border-indigo-500'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Sub-Rocks ({rock.subRocks?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('tasks')}
          className={`px-3 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 whitespace-nowrap ${
            activeTab === 'tasks'
              ? 'text-white border-b-2 border-indigo-500'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          Tasks ({rock.tasks?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('notes')}
          className={`px-3 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 whitespace-nowrap ${
            activeTab === 'notes'
              ? 'text-white border-b-2 border-indigo-500'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" />
          Notes ({rock.notes?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('ideas')}
          className={`px-3 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 whitespace-nowrap ${
            activeTab === 'ideas'
              ? 'text-white border-b-2 border-indigo-500'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Lightbulb className="w-4 h-4" />
          Ideas ({rock.ideas?.length || 0})
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Status Section */}
            <div>
              <label className="text-xs font-medium text-gray-400 block mb-2">
                Status
              </label>
              <StatusBadge status={rock.status} size="lg" />
              <div className="mt-2 flex flex-wrap gap-1">
                {(['not_started', 'in_progress', 'on_track', 'at_risk', 'complete'] as RockStatus[]).map(
                  (status) => (
                    <button
                      key={status}
                      onClick={() => {
                        updateRock(rock.id, { status })
                        onRefresh()
                      }}
                      className={`px-2 py-1 text-xs rounded transition-colors ${
                        rock.status === status
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {status.replace('_', ' ')}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Progress Section */}
            <div>
              <label className="text-xs font-medium text-gray-400 block mb-2">
                Overall Progress
              </label>
              <ProgressBar progress={rock.progress} height={12} showLabel={true} />
              <div className="mt-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={rock.progress}
                  onChange={(e) => {
                    updateRock(rock.id, { progress: parseInt(e.target.value) })
                    onRefresh()
                  }}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>
            </div>

            {/* Target Section */}
            {rock.target && (
              <div>
                <label className="text-xs font-medium text-gray-400 block mb-1">
                  SMART Goal / Target
                </label>
                <p className="text-sm text-white bg-gray-800 p-3 rounded-lg">
                  {rock.target}
                </p>
              </div>
            )}

            {/* Target Date */}
            {rock.targetDate && (
              <div>
                <label className="text-xs font-medium text-gray-400 block mb-1">
                  Target Date
                </label>
                <div className="flex items-center gap-2 text-sm text-white">
                  <Calendar className="w-4 h-4" />
                  <span>{format(new Date(rock.targetDate), 'MMMM d, yyyy')}</span>
                </div>
              </div>
            )}

            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-gray-800 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-white">{rock.subRocks?.length || 0}</div>
                <div className="text-xs text-gray-400">Sub-Rocks</div>
              </div>
              <div className="bg-gray-800 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-white">{rock.tasks?.length || 0}</div>
                <div className="text-xs text-gray-400">Tasks</div>
              </div>
              <div className="bg-gray-800 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-white">{rock.notes?.length || 0}</div>
                <div className="text-xs text-gray-400">Notes</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'subrocks' && (
          <SubRockList rockId={rock.id} />
        )}

        {activeTab === 'tasks' && (
          <div className="space-y-2">
            {rock.tasks?.map((task) => (
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
            {rock.notes?.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-8">No notes yet</p>
            )}
            {rock.notes?.map((note) => (
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
            {rock.ideas?.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-8">No ideas yet</p>
            )}
            {rock.ideas?.map((idea) => (
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
