'use client'

import { useStore } from '@/lib/store'
import { useState } from 'react'
import { CheckCircle2, Circle, ChevronRight, AlertTriangle, Calendar } from 'lucide-react'
import { format } from 'date-fns'

interface DailyPlannerProps {
  showOverdue?: boolean
  showCompleted?: boolean
}

export default function DailyPlanner({ showOverdue = true, showCompleted = false }: DailyPlannerProps) {
  const { tasks, rocks, getTasksDueToday, getTasksOverdue, updateTask } = useStore()

  const tasksDueToday = getTasksDueToday()
  const tasksOverdue = getTasksOverdue()

  // Group tasks by rock
  const groupTasksByRock = (taskList: typeof tasks) => {
    const grouped: Record<string, typeof tasks> = {}

    taskList.forEach((task) => {
      const rockId = task.rockId || 'unassigned'
      if (!grouped[rockId]) {
        grouped[rockId] = []
      }
      grouped[rockId].push(task)
    })

    return grouped
  }

  const groupedDueToday = groupTasksByRock(
    showCompleted ? tasksDueToday : tasksDueToday.filter((t) => t.status !== 'done')
  )
  const groupedOverdue = groupTasksByRock(tasksOverdue)

  const handleToggleTask = (taskId: string, currentStatus: string) => {
    updateTask(taskId, {
      status: currentStatus === 'done' ? 'todo' : 'done',
    })
  }

  const getRockInfo = (rockId: string) => {
    if (rockId === 'unassigned') {
      return { name: 'Unassigned Tasks', icon: '📌', color: '#6B7280' }
    }
    const rock = rocks.find((r) => r.id === rockId)
    return rock || { name: 'Unknown Rock', icon: '❓', color: '#6B7280' }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-500'
      case 'high':
        return 'text-orange-500'
      case 'medium':
        return 'text-yellow-500'
      case 'low':
        return 'text-green-500'
      default:
        return 'text-gray-500'
    }
  }

  return (
    <div className="space-y-6">
      {/* Overdue Tasks */}
      {showOverdue && tasksOverdue.length > 0 && (
        <div className="bg-red-900/20 border-2 border-red-800 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <h2 className="text-xl font-bold text-red-400">Overdue ({tasksOverdue.length})</h2>
          </div>

          <div className="space-y-4">
            {Object.entries(groupedOverdue).map(([rockId, rockTasks]) => {
              const rock = getRockInfo(rockId)
              return (
                <div key={rockId}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{rock.icon}</span>
                    <span className="font-semibold text-sm" style={{ color: rock.color }}>
                      {rock.name}
                    </span>
                    <span className="text-xs text-gray-500">({rockTasks.length})</span>
                  </div>

                  <div className="space-y-2 ml-7">
                    {rockTasks.map((task) => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        onToggle={handleToggleTask}
                        priorityColor={getPriorityColor(task.priority)}
                        isOverdue={true}
                      />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Due Today */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-500" />
            <h2 className="text-xl font-bold">Due Today ({tasksDueToday.length})</h2>
          </div>
          <div className="text-sm text-gray-400">
            {tasksDueToday.filter((t) => t.status === 'done').length} completed
          </div>
        </div>

        {tasksDueToday.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p>No tasks due today.</p>
            <p className="text-sm mt-2">Use Quick Capture below to add new tasks.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedDueToday).map(([rockId, rockTasks]) => {
              const rock = getRockInfo(rockId)

              // Calculate completion for this rock
              const completed = rockTasks.filter((t) => t.status === 'done').length
              const total = rockTasks.length

              return (
                <div key={rockId} className="bg-gray-900 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{rock.icon}</span>
                      <span className="font-semibold" style={{ color: rock.color }}>
                        {rock.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {completed} / {total}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                  </div>

                  {/* Progress bar for this rock */}
                  <div className="h-1 bg-gray-800 rounded-full overflow-hidden mb-3">
                    <div
                      className="h-full transition-all duration-300"
                      style={{
                        width: `${total > 0 ? (completed / total) * 100 : 0}%`,
                        backgroundColor: rock.color,
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    {rockTasks.map((task) => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        onToggle={handleToggleTask}
                        priorityColor={getPriorityColor(task.priority)}
                      />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

interface TaskItemProps {
  task: any
  onToggle: (taskId: string, currentStatus: string) => void
  priorityColor: string
  isOverdue?: boolean
}

function TaskItem({ task, onToggle, priorityColor, isOverdue = false }: TaskItemProps) {
  const [showDetails, setShowDetails] = useState(false)

  return (
    <div
      className={`group rounded-lg border transition-all ${
        task.status === 'done'
          ? 'bg-gray-800/50 border-gray-700 opacity-60'
          : isOverdue
          ? 'bg-red-950/30 border-red-900 hover:border-red-700'
          : 'bg-gray-800 border-gray-700 hover:border-gray-600'
      }`}
    >
      <div className="flex items-start gap-3 p-3">
        <button
          onClick={() => onToggle(task.id, task.status)}
          className="flex-shrink-0 mt-0.5 hover:scale-110 transition-transform"
        >
          {task.status === 'done' ? (
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          ) : (
            <Circle className="w-5 h-5 text-gray-400" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex-1 text-left"
            >
              <p
                className={`text-sm font-medium ${
                  task.status === 'done' ? 'line-through text-gray-500' : 'text-white'
                }`}
              >
                {task.title}
              </p>
            </button>

            <div className="flex items-center gap-2">
              {/* Priority indicator */}
              <div className={`w-2 h-2 rounded-full ${priorityColor.replace('text-', 'bg-')}`} />

              {/* Due time if available */}
              {task.dueDate && (
                <span className="text-xs text-gray-500">
                  {format(new Date(task.dueDate), 'MMM d')}
                </span>
              )}
            </div>
          </div>

          {/* Expanded details */}
          {showDetails && task.description && (
            <div className="mt-2 pt-2 border-t border-gray-700">
              <p className="text-sm text-gray-400">{task.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
