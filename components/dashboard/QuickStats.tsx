'use client'

import { useStore } from '@/lib/store'
import { Target, CheckSquare, AlertTriangle, Flame } from 'lucide-react'

export default function QuickStats() {
  const {
    rocks,
    tasks,
    eodReports,
    getTasksDueToday,
    getRocksAtRisk,
  } = useStore()

  // Calculate rocks progress
  const onTrackRocks = rocks.filter((r) => r.status === 'on_track').length
  const totalRocks = rocks.length
  const rocksPercentage = totalRocks > 0 ? (onTrackRocks / totalRocks) * 100 : 0

  // Calculate today's tasks
  const todaysTasks = getTasksDueToday()
  const completedTodayTasks = todaysTasks.filter((t) => t.status === 'done').length
  const todaysTasksPercentage = todaysTasks.length > 0 ? (completedTodayTasks / todaysTasks.length) * 100 : 0

  // Calculate rocks at risk
  const rocksAtRisk = getRocksAtRisk()

  // Calculate streak (consecutive days with EOD reports)
  const calculateStreak = () => {
    if (eodReports.length === 0) return 0

    const sortedReports = [...eodReports]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    let streak = 0
    let currentDate = new Date(today)

    for (const report of sortedReports) {
      const reportDate = new Date(report.date)
      reportDate.setHours(0, 0, 0, 0)

      const daysDiff = Math.floor((currentDate.getTime() - reportDate.getTime()) / (1000 * 60 * 60 * 24))

      if (daysDiff === 0 || daysDiff === 1) {
        streak++
        currentDate = reportDate
      } else {
        break
      }
    }

    return streak
  }

  const streak = calculateStreak()

  // Determine rocks progress color
  const getRocksColor = () => {
    if (rocksPercentage >= 70) return 'green'
    if (rocksPercentage >= 40) return 'yellow'
    return 'red'
  }

  const rocksColor = getRocksColor()
  const rocksColorClasses = {
    green: 'bg-green-500/20 border-green-500 text-green-400',
    yellow: 'bg-yellow-500/20 border-yellow-500 text-yellow-400',
    red: 'bg-red-500/20 border-red-500 text-red-400',
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Rocks Progress */}
      <StatCard
        icon={<Target className="w-6 h-6" />}
        title="Rocks Progress"
        value={`${onTrackRocks} / ${totalRocks}`}
        subtitle="On Track"
        className={rocksColorClasses[rocksColor]}
      >
        <div className="mt-3">
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                rocksColor === 'green'
                  ? 'bg-green-500'
                  : rocksColor === 'yellow'
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              }`}
              style={{ width: `${rocksPercentage}%` }}
            />
          </div>
        </div>
      </StatCard>

      {/* Today's Tasks */}
      <StatCard
        icon={<CheckSquare className="w-6 h-6" />}
        title="Today's Tasks"
        value={`${completedTodayTasks} / ${todaysTasks.length}`}
        subtitle="Completed"
        className="bg-indigo-500/20 border-indigo-500 text-indigo-400"
      >
        <div className="mt-3">
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
              style={{ width: `${todaysTasksPercentage}%` }}
            />
          </div>
        </div>
      </StatCard>

      {/* Rocks At Risk */}
      <StatCard
        icon={<AlertTriangle className="w-6 h-6" />}
        title="Rocks At Risk"
        value={rocksAtRisk.length.toString()}
        subtitle={rocksAtRisk.length === 1 ? 'Rock' : 'Rocks'}
        className={
          rocksAtRisk.length === 0
            ? 'bg-gray-700/50 border-gray-600 text-gray-400'
            : 'bg-red-500/20 border-red-500 text-red-400'
        }
      >
        {rocksAtRisk.length > 0 && (
          <div className="mt-3">
            <button className="text-xs text-gray-400 hover:text-white transition-colors">
              View Details
            </button>
          </div>
        )}
      </StatCard>

      {/* Streak */}
      <StatCard
        icon={<Flame className="w-6 h-6" />}
        title="EOD Streak"
        value={streak > 0 ? `${streak} ${streak === 1 ? 'Day' : 'Days'}` : 'No Streak'}
        subtitle={streak > 0 ? 'Keep it up!' : 'Start today'}
        className={
          streak > 0
            ? 'bg-orange-500/20 border-orange-500 text-orange-400'
            : 'bg-gray-700/50 border-gray-600 text-gray-400'
        }
      >
        {streak >= 7 && (
          <div className="mt-2 text-2xl">
            {streak >= 30 ? '🏆' : streak >= 14 ? '💪' : '🔥'}
          </div>
        )}
      </StatCard>
    </div>
  )
}

interface StatCardProps {
  icon: React.ReactNode
  title: string
  value: string
  subtitle: string
  className?: string
  children?: React.ReactNode
}

function StatCard({ icon, title, value, subtitle, className = '', children }: StatCardProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-lg border-2 p-5 transition-all hover:scale-105 ${className}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="p-2 bg-gray-800/50 rounded-lg">{icon}</div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-400 mb-1">{title}</h3>
        <p className="text-2xl font-bold mb-1">{value}</p>
        <p className="text-xs text-gray-500">{subtitle}</p>
      </div>

      {children}

      {/* Decorative gradient */}
      <div className="absolute -bottom-6 -right-6 w-24 h-24 opacity-10 blur-2xl bg-current rounded-full" />
    </div>
  )
}
