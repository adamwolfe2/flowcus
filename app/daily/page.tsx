'use client'

import { useStore } from '@/lib/store'
import { format } from 'date-fns'
import { Calendar, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react'
import DailyPlanner from '@/components/daily/DailyPlanner'
import QuickCapture from '@/components/daily/QuickCapture'
import { useState } from 'react'

export default function DailyWorkspace() {
  const {
    getTodaysFocus,
    getTasksDueToday,
    getTasksOverdue,
    eodReports,
    updateDailyFocus,
  } = useStore()

  const [showEODReminder, setShowEODReminder] = useState(false)

  const todaysFocus = getTodaysFocus()
  const tasksDueToday = getTasksDueToday()
  const tasksOverdue = getTasksOverdue()

  const today = format(new Date(), 'EEEE, MMMM d, yyyy')
  const currentHour = new Date().getHours()

  // Check if EOD report exists for today
  const todayString = new Date().toISOString().split('T')[0]
  const hasEODToday = eodReports.some(report => report.date === todayString)

  // Show EOD reminder if after 5pm and no EOD yet
  const shouldShowEODReminder = currentHour >= 17 && !hasEODToday && !showEODReminder

  const completedTasks = tasksDueToday.filter(t => t.status === 'done').length
  const totalTasks = tasksDueToday.length

  const handleFocusToggle = (priorityNum: 1 | 2 | 3) => {
    if (!todaysFocus) return

    const updateKey = `priority${priorityNum}Completed` as const
    updateDailyFocus(todaysFocus.id, {
      [updateKey]: !todaysFocus[updateKey],
    })
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Daily Workspace</h1>
          <div className="flex items-center gap-2 text-gray-400">
            <Calendar className="w-5 h-5" />
            <span>{today}</span>
          </div>
        </div>

        {/* Today's Focus Section */}
        {todaysFocus && (
          <div className="bg-gray-800 rounded-lg p-6 mb-6 border-l-4 border-indigo-500">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Today's Focus</h2>
              <span className="text-sm text-gray-400">
                {[
                  todaysFocus.priority1Completed,
                  todaysFocus.priority2Completed,
                  todaysFocus.priority3Completed,
                ].filter(Boolean).length}{' '}
                / 3 completed
              </span>
            </div>

            <div className="space-y-3">
              <FocusItem
                number={1}
                text={todaysFocus.priority1}
                completed={todaysFocus.priority1Completed}
                onToggle={() => handleFocusToggle(1)}
              />
              <FocusItem
                number={2}
                text={todaysFocus.priority2}
                completed={todaysFocus.priority2Completed}
                onToggle={() => handleFocusToggle(2)}
              />
              <FocusItem
                number={3}
                text={todaysFocus.priority3}
                completed={todaysFocus.priority3Completed}
                onToggle={() => handleFocusToggle(3)}
              />
            </div>
          </div>
        )}

        {/* Progress Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Tasks Due Today</span>
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-3xl font-bold">
              {completedTasks} / {totalTasks}
            </div>
            <div className="mt-2 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 transition-all duration-300"
                style={{ width: totalTasks > 0 ? `${(completedTasks / totalTasks) * 100}%` : '0%' }}
              />
            </div>
          </div>

          {tasksOverdue.length > 0 && (
            <div className="bg-red-900/20 border border-red-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-red-400 text-sm">Overdue Tasks</span>
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <div className="text-3xl font-bold text-red-500">{tasksOverdue.length}</div>
              <p className="text-xs text-red-400 mt-2">Needs immediate attention</p>
            </div>
          )}

          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Time</span>
              <Clock className="w-5 h-5 text-indigo-500" />
            </div>
            <div className="text-2xl font-bold">{format(new Date(), 'h:mm a')}</div>
            <p className="text-xs text-gray-400 mt-2">
              {currentHour < 12 ? 'Morning' : currentHour < 17 ? 'Afternoon' : 'Evening'} session
            </p>
          </div>
        </div>

        {/* EOD Reminder */}
        {shouldShowEODReminder && (
          <div className="bg-indigo-900/20 border border-indigo-800 rounded-lg p-6 mb-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-bold mb-2 text-indigo-300">Time for End of Day Report</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Reflect on your day and document your progress, blockers, and wins.
                </p>
                <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors text-sm">
                  Create EOD Report
                </button>
              </div>
              <button
                onClick={() => setShowEODReminder(true)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Main Content: Tasks organized by rock */}
        <DailyPlanner showOverdue={true} showCompleted={false} />

        {/* Quick Capture at the bottom */}
        <div className="mt-8">
          <QuickCapture />
        </div>
      </div>
    </div>
  )
}

interface FocusItemProps {
  number: number
  text: string
  completed: boolean
  onToggle: () => void
}

function FocusItem({ number, text, completed, onToggle }: FocusItemProps) {
  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
        completed
          ? 'bg-gray-900/50 border-gray-700 opacity-60'
          : 'bg-gray-900 border-gray-700 hover:border-gray-600'
      }`}
    >
      <button
        onClick={onToggle}
        className="flex-shrink-0 hover:scale-110 transition-transform"
      >
        {completed ? (
          <CheckCircle2 className="w-5 h-5 text-green-500" />
        ) : (
          <div className="w-5 h-5 rounded-full border-2 border-gray-400" />
        )}
      </button>

      <div className="flex-1">
        <span className="text-xs font-bold text-gray-500 mr-2">#{number}</span>
        <span className={completed ? 'line-through text-gray-500' : 'text-white'}>
          {text}
        </span>
      </div>
    </div>
  )
}
