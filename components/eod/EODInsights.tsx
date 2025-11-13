'use client'

import { useStore, EODReport } from '@/lib/store'
import { Flame, TrendingUp, AlertCircle, Target, Calendar, BarChart3 } from 'lucide-react'
import { parseISO, differenceInCalendarDays } from 'date-fns'

interface EODInsightsProps {
  reports: EODReport[]
}

export default function EODInsights({ reports }: EODInsightsProps) {
  const { rocks } = useStore()

  // Calculate streak (consecutive days with EOD reports)
  const calculateStreak = () => {
    if (reports.length === 0) return 0

    const sortedReports = [...reports].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    let streak = 0
    let currentDate = new Date(today)

    for (const report of sortedReports) {
      const reportDate = parseISO(report.date)
      reportDate.setHours(0, 0, 0, 0)

      const daysDiff = differenceInCalendarDays(currentDate, reportDate)

      if (daysDiff === 0 || daysDiff === 1) {
        streak++
        currentDate = reportDate
      } else {
        break
      }
    }

    return streak
  }

  // Get last 7 days of reports
  const last7DaysReports = reports
    .filter((r) => {
      const reportDate = parseISO(r.date)
      const daysAgo = differenceInCalendarDays(new Date(), reportDate)
      return daysAgo <= 7
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  // Average tasks completed per day (last 7 days)
  const avgTasksPerDay =
    last7DaysReports.length > 0
      ? (
          last7DaysReports.reduce((sum, r) => sum + r.tasksCompleted, 0) /
          last7DaysReports.length
        ).toFixed(1)
      : 0

  // Most common blockers (frequency analysis)
  const blockerFrequency: { [key: string]: number } = {}
  last7DaysReports.forEach((report) => {
    report.blockers.forEach((blocker) => {
      const lowerBlocker = blocker.toLowerCase()
      blockerFrequency[lowerBlocker] = (blockerFrequency[lowerBlocker] || 0) + 1
    })
  })

  const topBlockers = Object.entries(blockerFrequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([blocker, count]) => ({ blocker, count }))

  // Top rocks worked on (frequency from rocksProgressed)
  const rockFrequency: { [key: string]: number } = {}
  last7DaysReports.forEach((report) => {
    report.rocksProgressed.forEach((rockId) => {
      rockFrequency[rockId] = (rockFrequency[rockId] || 0) + 1
    })
  })

  const topRocks = Object.entries(rockFrequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([rockId, count]) => {
      const rock = rocks.find((r) => r.id === rockId)
      return {
        rockId,
        name: rock?.name || 'Unknown Rock',
        icon: rock?.icon || '📦',
        color: rock?.color || '#6366f1',
        count,
      }
    })

  // Weekly summary stats
  const totalAccomplished = last7DaysReports.reduce(
    (sum, r) => sum + r.accomplished.length,
    0
  )
  const totalWins = last7DaysReports.reduce((sum, r) => sum + r.wins.length, 0)
  const totalLearnings = last7DaysReports.reduce(
    (sum, r) => sum + r.learnings.length,
    0
  )
  const totalHours = last7DaysReports.reduce(
    (sum, r) => sum + (r.hoursWorked || 0),
    0
  )

  const streak = calculateStreak()

  const getStreakEmoji = () => {
    if (streak === 0) return ''
    if (streak >= 30) return '🏆'
    if (streak >= 14) return '💪'
    if (streak >= 7) return '🔥'
    return '✨'
  }

  const getStreakMessage = () => {
    if (streak === 0) return 'Start your streak today!'
    if (streak === 1) return 'Great start!'
    if (streak < 7) return 'Keep it going!'
    if (streak < 14) return 'You\'re on fire!'
    if (streak < 30) return 'Amazing consistency!'
    return 'Legendary streak!'
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-xl font-bold mb-6">Insights</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Streak */}
        <InsightCard
          icon={<Flame className="w-6 h-6 text-orange-400" />}
          title="EOD Streak"
          value={streak > 0 ? `${streak} ${streak === 1 ? 'day' : 'days'}` : 'No streak'}
          subtitle={getStreakMessage()}
          highlight={streak >= 7}
          emoji={getStreakEmoji()}
        />

        {/* Average tasks */}
        <InsightCard
          icon={<TrendingUp className="w-6 h-6 text-indigo-400" />}
          title="Avg Tasks/Day"
          value={avgTasksPerDay}
          subtitle="Last 7 days"
          highlight={parseFloat(avgTasksPerDay.toString()) >= 5}
        />

        {/* Total accomplished */}
        <InsightCard
          icon={<Target className="w-6 h-6 text-green-400" />}
          title="Accomplished"
          value={totalAccomplished}
          subtitle="Last 7 days"
        />

        {/* Total hours */}
        <InsightCard
          icon={<Calendar className="w-6 h-6 text-purple-400" />}
          title="Hours Logged"
          value={totalHours > 0 ? totalHours.toFixed(1) : '—'}
          subtitle="Last 7 days"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Rocks */}
        {topRocks.length > 0 && (
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="w-5 h-5 text-indigo-400" />
              <h3 className="text-sm font-semibold text-gray-300">Top Rocks Worked On</h3>
            </div>
            <div className="space-y-2">
              {topRocks.map((rock, index) => (
                <div
                  key={rock.rockId}
                  className="flex items-center justify-between p-2 bg-gray-800 rounded"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 text-xs font-bold">#{index + 1}</span>
                    <span>{rock.icon}</span>
                    <span className="text-sm text-gray-300">{rock.name}</span>
                  </div>
                  <span
                    className="text-xs font-semibold px-2 py-1 rounded"
                    style={{
                      backgroundColor: `${rock.color}20`,
                      color: rock.color,
                    }}
                  >
                    {rock.count} {rock.count === 1 ? 'day' : 'days'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Common Blockers */}
        {topBlockers.length > 0 && (
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <h3 className="text-sm font-semibold text-gray-300">Common Blockers</h3>
            </div>
            <div className="space-y-2">
              {topBlockers.map((blocker, index) => (
                <div
                  key={blocker.blocker}
                  className="flex items-center justify-between p-2 bg-gray-800 rounded"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 text-xs font-bold">#{index + 1}</span>
                    <span className="text-sm text-gray-300 truncate max-w-[200px]">
                      {blocker.blocker}
                    </span>
                  </div>
                  <span className="text-xs font-semibold px-2 py-1 rounded bg-red-500/20 text-red-400">
                    {blocker.count}x
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Weekly summary */}
      {last7DaysReports.length > 0 && (
        <div className="mt-4 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-lg p-4 border border-indigo-500/20">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">7-Day Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-indigo-400">{last7DaysReports.length}</p>
              <p className="text-xs text-gray-500">Reports</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-400">{totalWins}</p>
              <p className="text-xs text-gray-500">Wins</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-400">{totalLearnings}</p>
              <p className="text-xs text-gray-500">Learnings</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-400">
                {topRocks.length > 0 ? topRocks.length : '—'}
              </p>
              <p className="text-xs text-gray-500">Active Rocks</p>
            </div>
          </div>
        </div>
      )}

      {/* Future AI insights placeholder */}
      <div className="mt-4 p-4 bg-gray-900/50 rounded-lg border border-dashed border-gray-700">
        <p className="text-xs text-gray-500 text-center">
          🤖 AI-powered insights coming soon...
        </p>
      </div>
    </div>
  )
}

interface InsightCardProps {
  icon: React.ReactNode
  title: string
  value: string | number
  subtitle: string
  highlight?: boolean
  emoji?: string
}

function InsightCard({ icon, title, value, subtitle, highlight, emoji }: InsightCardProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-lg border-2 p-4 transition-all hover:scale-105 ${
        highlight
          ? 'bg-indigo-500/10 border-indigo-500'
          : 'bg-gray-900 border-gray-700'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="p-2 bg-gray-800/50 rounded-lg">{icon}</div>
        {emoji && <span className="text-2xl">{emoji}</span>}
      </div>

      <div>
        <h3 className="text-xs font-medium text-gray-400 mb-1">{title}</h3>
        <p className="text-2xl font-bold text-white mb-1">{value}</p>
        <p className="text-xs text-gray-500">{subtitle}</p>
      </div>

      {/* Decorative gradient */}
      <div className="absolute -bottom-6 -right-6 w-24 h-24 opacity-10 blur-2xl bg-current rounded-full" />
    </div>
  )
}
