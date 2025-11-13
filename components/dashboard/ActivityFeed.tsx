'use client'

import { useStore } from '@/lib/store'
import { formatDistanceToNow } from 'date-fns'
import { CheckCircle2, FileText, BookOpen, Users, ChevronRight } from 'lucide-react'

export default function ActivityFeed() {
  const { rocks, getRecentActivity } = useStore()

  const activities = getRecentActivity()

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'task_completed':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />
      case 'eod_report':
        return <FileText className="w-5 h-5 text-indigo-500" />
      case 'journal_entry':
        return <BookOpen className="w-5 h-5 text-purple-500" />
      case 'meeting_note':
        return <Users className="w-5 h-5 text-blue-500" />
      default:
        return <FileText className="w-5 h-5 text-gray-500" />
    }
  }

  const getRockInfo = (rockId: string | null) => {
    if (!rockId) return null
    const rock = rocks.find((r) => r.id === rockId)
    return rock
  }

  const formatTimestamp = (timestamp: string | null) => {
    if (!timestamp) return 'Unknown time'
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true })
    } catch {
      return 'Unknown time'
    }
  }

  const getActivityTypeLabel = (type: string) => {
    switch (type) {
      case 'task_completed':
        return 'Completed'
      case 'eod_report':
        return 'EOD Report'
      case 'journal_entry':
        return 'Journal Entry'
      case 'meeting_note':
        return 'Meeting Note'
      default:
        return 'Activity'
    }
  }

  if (activities.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
        <div className="text-center py-8 text-gray-400">
          <p>No recent activity yet.</p>
          <p className="text-sm mt-2">Complete tasks, write journal entries, or submit EOD reports to see them here.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Recent Activity</h2>
        <span className="text-sm text-gray-400">{activities.length} recent items</span>
      </div>

      <div className="space-y-2">
        {activities.map((activity) => {
          const rock = getRockInfo(activity.rockId)

          return (
            <ActivityItem
              key={activity.id}
              icon={getActivityIcon(activity.type)}
              title={activity.title}
              type={getActivityTypeLabel(activity.type)}
              timestamp={formatTimestamp(activity.timestamp)}
              rock={rock}
            />
          )
        })}
      </div>

      <button className="w-full mt-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg flex items-center justify-center gap-2 transition-colors text-sm">
        View All Activity
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  )
}

interface ActivityItemProps {
  icon: React.ReactNode
  title: string
  type: string
  timestamp: string
  rock?: {
    id: string
    name: string
    color: string
    icon: string
  } | null
}

function ActivityItem({ icon, title, type, timestamp, rock }: ActivityItemProps) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-900 hover:bg-gray-850 transition-colors cursor-pointer group">
      <div className="flex-shrink-0 mt-0.5">{icon}</div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate group-hover:text-indigo-400 transition-colors">
              {title}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-500">{type}</span>
              <span className="text-xs text-gray-600">•</span>
              <span className="text-xs text-gray-500">{timestamp}</span>
            </div>
          </div>

          {rock && (
            <div
              className="flex-shrink-0 px-2 py-1 rounded text-xs font-medium whitespace-nowrap"
              style={{
                backgroundColor: `${rock.color}20`,
                color: rock.color,
              }}
            >
              {rock.icon} {rock.name}
            </div>
          )}
        </div>
      </div>

      <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400 flex-shrink-0 mt-1 transition-colors" />
    </div>
  )
}
