'use client'

import { useState, useMemo, use } from 'react'
import { useStore, RockStatus, TaskStatus, TaskPriority } from '@/lib/store'
import { ArrowLeft, Calendar, Target, TrendingUp, CheckSquare, FileText, MoreHorizontal, Edit, Plus, Trash2 } from 'lucide-react'
import { format, differenceInDays } from 'date-fns'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import StatusBadge from '@/components/rocks/StatusBadge'
import ProgressBar from '@/components/rocks/ProgressBar'
import SubRockList from '@/components/rocks/SubRockList'

type TabType = 'overview' | 'subrocks' | 'tasks' | 'more'

export default function RockDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const rockId = resolvedParams.id
  const router = useRouter()
  const { rocks, subRocks, tasks, notes, ideas, meetingNotes, journalEntries, updateRock, addTask, updateTask, deleteTask } = useStore()
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [isAddingTask, setIsAddingTask] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [taskGroupBy, setTaskGroupBy] = useState<'none' | 'subrock' | 'status' | 'priority'>('subrock')
  const [taskFilter, setTaskFilter] = useState<TaskStatus | 'all'>('all')

  const rock = rocks.find((r) => r.id === rockId)
  const rockSubRocks = useMemo(() => subRocks.filter((sr) => sr.rockId === rockId), [subRocks, rockId])
  const rockTasks = useMemo(() => tasks.filter((t) => t.rockId === rockId), [tasks, rockId])
  const rockNotes = useMemo(() => notes.filter((n) => n.rockId === rockId), [notes, rockId])
  const rockIdeas = useMemo(() => ideas.filter((i) => i.rockId === rockId), [ideas, rockId])
  const rockMeetings = useMemo(() => meetingNotes.filter((m) => m.rockId === rockId), [meetingNotes, rockId])
  const rockJournals = useMemo(() => journalEntries.filter((j) => j.rockIds.includes(rockId)), [journalEntries, rockId])

  if (!rock) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Rock not found</h1>
          <Link href="/rocks" className="text-indigo-400 hover:text-indigo-300">
            Back to all rocks
          </Link>
        </div>
      </div>
    )
  }

  const daysUntilTarget = differenceInDays(new Date(rock.targetDate), new Date())

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
  }

  const handleToggleTask = (taskId: string, currentStatus: TaskStatus) => {
    updateTask(taskId, {
      status: currentStatus === 'done' ? 'todo' : 'done',
    })
  }

  // Group tasks
  const groupedTasks = useMemo(() => {
    let filteredTasks = rockTasks
    if (taskFilter !== 'all') {
      filteredTasks = filteredTasks.filter((t) => t.status === taskFilter)
    }

    if (taskGroupBy === 'none') {
      return { 'All Tasks': filteredTasks }
    }

    if (taskGroupBy === 'subrock') {
      const groups: Record<string, typeof filteredTasks> = {
        'No Sub-Rock': filteredTasks.filter((t) => !t.subRockId),
      }
      rockSubRocks.forEach((sr) => {
        const subRockTasks = filteredTasks.filter((t) => t.subRockId === sr.id)
        if (subRockTasks.length > 0) {
          groups[sr.name] = subRockTasks
        }
      })
      return groups
    }

    if (taskGroupBy === 'status') {
      return {
        'To Do': filteredTasks.filter((t) => t.status === 'todo'),
        'In Progress': filteredTasks.filter((t) => t.status === 'in_progress'),
        'Done': filteredTasks.filter((t) => t.status === 'done'),
      }
    }

    if (taskGroupBy === 'priority') {
      return {
        'Urgent': filteredTasks.filter((t) => t.priority === 'urgent'),
        'High': filteredTasks.filter((t) => t.priority === 'high'),
        'Medium': filteredTasks.filter((t) => t.priority === 'medium'),
        'Low': filteredTasks.filter((t) => t.priority === 'low'),
      }
    }

    return {}
  }, [rockTasks, rockSubRocks, taskGroupBy, taskFilter])

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900">
        <div className="p-6 max-w-7xl mx-auto">
          {/* Back Button */}
          <Link
            href="/rocks"
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Rocks
          </Link>

          {/* Rock Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4 flex-1">
              <span className="text-5xl">{rock.icon}</span>
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">{rock.name}</h1>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-gray-400">{rock.category}</span>
                  <StatusBadge status={rock.status} size="md" />
                  <div className="flex-1 max-w-xs">
                    <ProgressBar progress={rock.progress} height={8} showLabel={true} />
                  </div>
                </div>
              </div>
            </div>
            <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center gap-2">
              <Edit className="w-4 h-4" />
              Edit
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-800 bg-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-4 text-sm font-medium transition-colors border-b-2 ${
                activeTab === 'overview'
                  ? 'text-white border-indigo-500'
                  : 'text-gray-400 hover:text-white border-transparent'
              }`}
            >
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                Overview
              </div>
            </button>
            <button
              onClick={() => setActiveTab('subrocks')}
              className={`px-4 py-4 text-sm font-medium transition-colors border-b-2 ${
                activeTab === 'subrocks'
                  ? 'text-white border-indigo-500'
                  : 'text-gray-400 hover:text-white border-transparent'
              }`}
            >
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Sub-Rocks ({rockSubRocks.length})
              </div>
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className={`px-4 py-4 text-sm font-medium transition-colors border-b-2 ${
                activeTab === 'tasks'
                  ? 'text-white border-indigo-500'
                  : 'text-gray-400 hover:text-white border-transparent'
              }`}
            >
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4" />
                Tasks ({rockTasks.length})
              </div>
            </button>
            <button
              onClick={() => setActiveTab('more')}
              className={`px-4 py-4 text-sm font-medium transition-colors border-b-2 ${
                activeTab === 'more'
                  ? 'text-white border-indigo-500'
                  : 'text-gray-400 hover:text-white border-transparent'
              }`}
            >
              <div className="flex items-center gap-2">
                <MoreHorizontal className="w-4 h-4" />
                More
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 max-w-7xl mx-auto">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Target */}
                {rock.target && (
                  <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                    <h3 className="text-sm font-medium text-gray-400 mb-3">SMART Goal / Target</h3>
                    <p className="text-white leading-relaxed">{rock.target}</p>
                  </div>
                )}

                {/* Target Date */}
                {rock.targetDate && (
                  <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                    <h3 className="text-sm font-medium text-gray-400 mb-3">Target Date</h3>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-indigo-400" />
                        <div>
                          <p className="text-white font-medium">{format(new Date(rock.targetDate), 'MMMM d, yyyy')}</p>
                          <p className="text-sm text-gray-400">
                            {daysUntilTarget > 0 ? `${daysUntilTarget} days remaining` : `${Math.abs(daysUntilTarget)} days overdue`}
                          </p>
                        </div>
                      </div>
                      <div className={`text-2xl font-bold ${daysUntilTarget < 0 ? 'text-red-400' : daysUntilTarget < 30 ? 'text-amber-400' : 'text-green-400'}`}>
                        {daysUntilTarget > 0 ? daysUntilTarget : 0}
                      </div>
                    </div>
                  </div>
                )}

                {/* Description */}
                {rock.description && (
                  <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                    <h3 className="text-sm font-medium text-gray-400 mb-3">Description</h3>
                    <p className="text-white leading-relaxed">{rock.description}</p>
                  </div>
                )}

                {/* Status Management */}
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                  <h3 className="text-sm font-medium text-gray-400 mb-3">Status</h3>
                  <div className="flex flex-wrap gap-2">
                    {(['not_started', 'in_progress', 'on_track', 'at_risk', 'complete'] as RockStatus[]).map((status) => (
                      <button
                        key={status}
                        onClick={() => updateRock(rock.id, { status })}
                        className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                          rock.status === status
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        }`}
                      >
                        {status.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Progress Management */}
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                  <h3 className="text-sm font-medium text-gray-400 mb-3">Overall Progress</h3>
                  <ProgressBar progress={rock.progress} height={16} showLabel={true} />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={rock.progress}
                    onChange={(e) => updateRock(rock.id, { progress: parseInt(e.target.value) })}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500 mt-4"
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Summary Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 text-center">
                    <div className="text-4xl font-bold text-white mb-2">{rockSubRocks.length}</div>
                    <div className="text-sm text-gray-400">Sub-Rocks</div>
                  </div>
                  <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 text-center">
                    <div className="text-4xl font-bold text-white mb-2">{rockTasks.length}</div>
                    <div className="text-sm text-gray-400">Tasks</div>
                  </div>
                  <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 text-center">
                    <div className="text-4xl font-bold text-white mb-2">{rockNotes.length}</div>
                    <div className="text-sm text-gray-400">Notes</div>
                  </div>
                  <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 text-center">
                    <div className="text-4xl font-bold text-white mb-2">{rockMeetings.length}</div>
                    <div className="text-sm text-gray-400">Meetings</div>
                  </div>
                </div>

                {/* Recent Activity Placeholder */}
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                  <h3 className="text-sm font-medium text-gray-400 mb-3">Recent Activity</h3>
                  <div className="space-y-3">
                    {rockTasks
                      .filter((t) => t.status === 'done' && t.completedDate)
                      .sort((a, b) => new Date(b.completedDate!).getTime() - new Date(a.completedDate!).getTime())
                      .slice(0, 5)
                      .map((task) => (
                        <div key={task.id} className="flex items-start gap-3 text-sm">
                          <CheckSquare className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-white truncate">{task.title}</p>
                            <p className="text-gray-500 text-xs">
                              {format(new Date(task.completedDate!), 'MMM d, yyyy')}
                            </p>
                          </div>
                        </div>
                      ))}
                    {rockTasks.filter((t) => t.status === 'done').length === 0 && (
                      <p className="text-gray-500 text-sm">No completed tasks yet</p>
                    )}
                  </div>
                </div>

                {/* Linked Rocks Placeholder */}
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                  <h3 className="text-sm font-medium text-gray-400 mb-3">Linked Rocks</h3>
                  <p className="text-gray-500 text-sm">Feature coming soon...</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'subrocks' && (
          <div>
            <SubRockList rockId={rock.id} />
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="space-y-4">
            {/* Task Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <label className="text-xs text-gray-400 mr-2">Group by:</label>
                  <select
                    value={taskGroupBy}
                    onChange={(e) => setTaskGroupBy(e.target.value as any)}
                    className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="none">None</option>
                    <option value="subrock">Sub-Rock</option>
                    <option value="status">Status</option>
                    <option value="priority">Priority</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mr-2">Filter:</label>
                  <select
                    value={taskFilter}
                    onChange={(e) => setTaskFilter(e.target.value as any)}
                    className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="all">All</option>
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>
              </div>
              <button
                onClick={() => setIsAddingTask(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center gap-2 text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Task
              </button>
            </div>

            {/* Add Task Form */}
            {isAddingTask && (
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
                  placeholder="Task title..."
                  className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  autoFocus
                />
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={handleAddTask}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-lg transition-colors"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => {
                      setIsAddingTask(false)
                      setNewTaskTitle('')
                    }}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Grouped Tasks */}
            <div className="space-y-6">
              {Object.entries(groupedTasks).map(([groupName, groupTasks]) => (
                groupTasks.length > 0 && (
                  <div key={groupName}>
                    <h3 className="text-sm font-medium text-gray-400 mb-3">{groupName} ({groupTasks.length})</h3>
                    <div className="space-y-2">
                      {groupTasks.map((task) => (
                        <div
                          key={task.id}
                          className="bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-gray-700 transition-colors group"
                        >
                          <div className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              checked={task.status === 'done'}
                              onChange={() => handleToggleTask(task.id, task.status)}
                              className="mt-1 w-4 h-4 rounded border-gray-600 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                            />
                            <div className="flex-1">
                              <p
                                className={`text-sm font-medium ${
                                  task.status === 'done' ? 'line-through text-gray-500' : 'text-white'
                                }`}
                              >
                                {task.title}
                              </p>
                              {task.description && (
                                <p className="text-xs text-gray-500 mt-1">{task.description}</p>
                              )}
                              <div className="flex items-center gap-3 mt-2">
                                {task.dueDate && (
                                  <span className="text-xs text-gray-500 flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {format(new Date(task.dueDate), 'MMM d')}
                                  </span>
                                )}
                                <span className={`text-xs px-2 py-0.5 rounded ${
                                  task.priority === 'urgent' ? 'bg-red-900/50 text-red-300' :
                                  task.priority === 'high' ? 'bg-orange-900/50 text-orange-300' :
                                  task.priority === 'medium' ? 'bg-blue-900/50 text-blue-300' :
                                  'bg-gray-800 text-gray-400'
                                }`}>
                                  {task.priority}
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={() => deleteTask(task.id)}
                              className="opacity-0 group-hover:opacity-100 p-2 hover:bg-gray-800 rounded transition-all"
                            >
                              <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-400" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              ))}
              {rockTasks.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <CheckSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No tasks yet. Add your first task to get started.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'more' && (
          <div className="space-y-6">
            {/* Notes */}
            <details className="bg-gray-900 border border-gray-800 rounded-lg" open>
              <summary className="p-4 cursor-pointer font-medium text-white hover:bg-gray-800/50 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Notes ({rockNotes.length})
                  </span>
                </div>
              </summary>
              <div className="p-4 pt-0 space-y-3">
                {rockNotes.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-8">No notes yet</p>
                ) : (
                  rockNotes.map((note) => (
                    <div key={note.id} className="bg-gray-800 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-white mb-2">{note.title}</h4>
                      <p className="text-sm text-gray-400 line-clamp-3">{note.content}</p>
                      <p className="text-xs text-gray-600 mt-2">
                        {format(new Date(note.createdAt), 'MMM d, yyyy')}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </details>

            {/* Ideas */}
            <details className="bg-gray-900 border border-gray-800 rounded-lg">
              <summary className="p-4 cursor-pointer font-medium text-white hover:bg-gray-800/50 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    Ideas ({rockIdeas.length})
                  </span>
                </div>
              </summary>
              <div className="p-4 pt-0 space-y-3">
                {rockIdeas.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-8">No ideas yet</p>
                ) : (
                  rockIdeas.map((idea) => (
                    <div key={idea.id} className="bg-gray-800 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-white mb-2">{idea.title}</h4>
                      <p className="text-sm text-gray-400 line-clamp-3">{idea.content}</p>
                      <p className="text-xs text-gray-600 mt-2">
                        {format(new Date(idea.createdAt), 'MMM d, yyyy')}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </details>

            {/* Meeting Notes */}
            <details className="bg-gray-900 border border-gray-800 rounded-lg">
              <summary className="p-4 cursor-pointer font-medium text-white hover:bg-gray-800/50 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    Meeting Notes ({rockMeetings.length})
                  </span>
                </div>
              </summary>
              <div className="p-4 pt-0 space-y-3">
                {rockMeetings.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-8">No meeting notes yet</p>
                ) : (
                  rockMeetings.map((meeting) => (
                    <div key={meeting.id} className="bg-gray-800 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-white mb-2">{meeting.title}</h4>
                      <p className="text-xs text-gray-500 mb-2">{format(new Date(meeting.date), 'MMMM d, yyyy')}</p>
                      <p className="text-sm text-gray-400 line-clamp-3">{meeting.content}</p>
                      {meeting.actionItems.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-500 mb-1">Action Items:</p>
                          <ul className="list-disc list-inside text-xs text-gray-400">
                            {meeting.actionItems.slice(0, 3).map((item, idx) => (
                              <li key={idx}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </details>

            {/* Journal Entries */}
            <details className="bg-gray-900 border border-gray-800 rounded-lg">
              <summary className="p-4 cursor-pointer font-medium text-white hover:bg-gray-800/50 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    Journal Entries ({rockJournals.length})
                  </span>
                </div>
              </summary>
              <div className="p-4 pt-0 space-y-3">
                {rockJournals.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-8">No journal entries yet</p>
                ) : (
                  rockJournals.map((journal) => (
                    <div key={journal.id} className="bg-gray-800 rounded-lg p-4">
                      <p className="text-xs text-gray-500 mb-2">{format(new Date(journal.date), 'MMMM d, yyyy')}</p>
                      <p className="text-sm text-gray-400 line-clamp-3">{journal.content}</p>
                    </div>
                  ))
                )}
              </div>
            </details>
          </div>
        )}
      </div>
    </div>
  )
}
