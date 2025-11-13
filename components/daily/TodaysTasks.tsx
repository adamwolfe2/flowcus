'use client'

import { useStore } from '@/lib/store'
import { useState } from 'react'
import { CheckCircle2, Circle, ChevronDown, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'

interface TodaysTasksProps {
  compact?: boolean
}

export default function TodaysTasks({ compact = false }: TodaysTasksProps) {
  const { rocks, getTasksDueToday, updateTask } = useStore()

  const tasksDueToday = getTasksDueToday()
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null)

  const handleToggleTask = (taskId: string, currentStatus: string) => {
    updateTask(taskId, {
      status: currentStatus === 'done' ? 'todo' : 'done',
    })
  }

  const getRockInfo = (rockId: string | null) => {
    if (!rockId) return null
    return rocks.find((r) => r.id === rockId)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500'
      case 'high':
        return 'bg-orange-500'
      case 'medium':
        return 'bg-yellow-500'
      case 'low':
        return 'bg-green-500'
      default:
        return 'bg-gray-500'
    }
  }

  const formatDueTime = (dueDate: string | null) => {
    if (!dueDate) return null
    try {
      const date = new Date(dueDate)
      return format(date, 'h:mm a')
    } catch {
      return null
    }
  }

  if (tasksDueToday.length === 0) {
    return (
      <div className={`${compact ? 'p-4' : 'bg-gray-800 rounded-lg p-6'}`}>
        <h2 className="text-lg font-bold mb-2">Today's Tasks</h2>
        <div className="text-center py-6 text-gray-400 text-sm">
          <p>No tasks due today.</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`${compact ? 'p-4' : 'bg-gray-800 rounded-lg p-6'}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className={`${compact ? 'text-lg' : 'text-xl'} font-bold`}>Today's Tasks</h2>
        <span className="text-sm text-gray-400">
          {tasksDueToday.filter((t) => t.status === 'done').length} / {tasksDueToday.length}
        </span>
      </div>

      <div className="space-y-2">
        {tasksDueToday.map((task, index) => {
          const rock = getRockInfo(task.rockId)
          const isExpanded = expandedTaskId === task.id
          const dueTime = formatDueTime(task.dueDate)

          return (
            <div
              key={task.id}
              className={`rounded-lg border transition-all ${
                task.status === 'done'
                  ? 'bg-gray-900/50 border-gray-700 opacity-60'
                  : 'bg-gray-900 border-gray-700 hover:border-gray-600'
              }`}
            >
              <div className="flex items-center gap-3 p-3">
                {/* Checkbox */}
                <button
                  onClick={() => handleToggleTask(task.id, task.status)}
                  className="flex-shrink-0 hover:scale-110 transition-transform"
                >
                  {task.status === 'done' ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-400" />
                  )}
                </button>

                {/* Task Content */}
                <button
                  onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
                  className="flex-1 text-left min-w-0"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p
                      className={`text-sm font-medium ${
                        task.status === 'done' ? 'line-through text-gray-500' : 'text-white'
                      }`}
                    >
                      {task.title}
                    </p>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* Priority indicator */}
                      <div
                        className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`}
                        title={`${task.priority} priority`}
                      />

                      {/* Rock badge (compact) */}
                      {rock && !compact && (
                        <span
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                          style={{
                            backgroundColor: `${rock.color}20`,
                            color: rock.color,
                          }}
                        >
                          {rock.icon}
                        </span>
                      )}

                      {/* Due time */}
                      {dueTime && (
                        <span className="text-xs text-gray-500">{dueTime}</span>
                      )}

                      {/* Expand indicator */}
                      {task.description && (
                        isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-gray-500" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-500" />
                        )
                      )}
                    </div>
                  </div>

                  {/* Rock badge (compact mode) */}
                  {rock && compact && (
                    <div className="mt-1">
                      <span
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                        style={{
                          backgroundColor: `${rock.color}20`,
                          color: rock.color,
                        }}
                      >
                        {rock.icon} {rock.name}
                      </span>
                    </div>
                  )}
                </button>
              </div>

              {/* Expanded details */}
              {isExpanded && task.description && (
                <div className="px-3 pb-3 pt-0 ml-8 border-t border-gray-800 mt-2 pt-2">
                  <p className="text-sm text-gray-400">{task.description}</p>

                  {/* Additional metadata */}
                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                    {task.timeEstimate && (
                      <span>Est: {task.timeEstimate}m</span>
                    )}
                    {task.tags.length > 0 && (
                      <div className="flex gap-1">
                        {task.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 bg-gray-800 rounded"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
