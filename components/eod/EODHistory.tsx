'use client'

import { useState } from 'react'
import { useStore, EODReport } from '@/lib/store'
import { format, parseISO } from 'date-fns'
import { ChevronDown, ChevronRight, Calendar, CheckCircle2, Target, TrendingUp, Lightbulb, AlertCircle, Clock } from 'lucide-react'

interface EODHistoryProps {
  limit?: number
}

export default function EODHistory({ limit = 7 }: EODHistoryProps) {
  const { eodReports, rocks } = useStore()
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [showAll, setShowAll] = useState(false)

  // Sort reports by date (most recent first)
  const sortedReports = [...eodReports].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  const displayedReports = showAll ? sortedReports : sortedReports.slice(0, limit)

  const toggleExpand = (id: string) => {
    const newExpandedIds = new Set(expandedIds)
    if (newExpandedIds.has(id)) {
      newExpandedIds.delete(id)
    } else {
      newExpandedIds.add(id)
    }
    setExpandedIds(newExpandedIds)
  }

  const getRockName = (rockId: string) => {
    const rock = rocks.find((r) => r.id === rockId)
    return rock ? rock.name : 'Unknown Rock'
  }

  const getRockIcon = (rockId: string) => {
    const rock = rocks.find((r) => r.id === rockId)
    return rock ? rock.icon : '📦'
  }

  if (eodReports.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Recent Reports</h2>
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">No EOD reports yet.</p>
          <p className="text-gray-500 text-sm mt-1">Start by filling out today's report!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Recent Reports</h2>
        {sortedReports.length > limit && !showAll && (
          <button
            onClick={() => setShowAll(true)}
            className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            View All ({sortedReports.length})
          </button>
        )}
        {showAll && (
          <button
            onClick={() => setShowAll(false)}
            className="text-sm text-gray-400 hover:text-gray-300 transition-colors"
          >
            Show Less
          </button>
        )}
      </div>

      <div className="space-y-3">
        {displayedReports.map((report) => {
          const isExpanded = expandedIds.has(report.id)
          const formattedDate = format(parseISO(report.date), 'EEEE, MMMM d, yyyy')
          const relativeDate = format(parseISO(report.date), 'MMM d')

          return (
            <div
              key={report.id}
              className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden transition-all hover:border-gray-600"
            >
              {/* Header - Always visible */}
              <button
                onClick={() => toggleExpand(report.id)}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                  <div className="text-left">
                    <h3 className="font-semibold text-white">{formattedDate}</h3>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        {report.accomplished.length} accomplished
                      </span>
                      <span className="flex items-center gap-1">
                        <Target className="w-4 h-4" />
                        {report.tasksCompleted} tasks
                      </span>
                      <span className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" />
                        {report.rocksProgressed.length} rocks
                      </span>
                    </div>
                  </div>
                </div>
                <span className="text-xs text-gray-500">{relativeDate}</span>
              </button>

              {/* Expanded content */}
              {isExpanded && (
                <div className="px-4 pb-4 space-y-4 border-t border-gray-800 pt-4">
                  {/* Accomplished */}
                  {report.accomplished.length > 0 && (
                    <Section
                      icon={<CheckCircle2 className="w-5 h-5 text-green-400" />}
                      title="Accomplished"
                      items={report.accomplished}
                    />
                  )}

                  {/* Blockers */}
                  {report.blockers.length > 0 && (
                    <Section
                      icon={<AlertCircle className="w-5 h-5 text-red-400" />}
                      title="Blockers"
                      items={report.blockers}
                    />
                  )}

                  {/* Tomorrow's Priorities */}
                  {report.tomorrowPriorities.length > 0 && (
                    <Section
                      icon={<Target className="w-5 h-5 text-indigo-400" />}
                      title="Tomorrow's Priorities"
                      items={report.tomorrowPriorities}
                      numbered
                    />
                  )}

                  {/* Wins */}
                  {report.wins.length > 0 && (
                    <Section
                      icon={<TrendingUp className="w-5 h-5 text-purple-400" />}
                      title="Wins"
                      items={report.wins}
                    />
                  )}

                  {/* Learnings */}
                  {report.learnings.length > 0 && (
                    <Section
                      icon={<Lightbulb className="w-5 h-5 text-yellow-400" />}
                      title="Key Learnings"
                      items={report.learnings}
                    />
                  )}

                  {/* Rocks Progressed */}
                  {report.rocksProgressed.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-indigo-400" />
                        <h4 className="text-sm font-semibold text-gray-300">Rocks Progressed</h4>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {report.rocksProgressed.map((rockId) => (
                          <span
                            key={rockId}
                            className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-xs flex items-center gap-1"
                          >
                            <span>{getRockIcon(rockId)}</span>
                            <span>{getRockName(rockId)}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Hours worked */}
                  {report.hoursWorked && (
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Clock className="w-4 h-4" />
                      <span>{report.hoursWorked} hours worked</span>
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="pt-2 border-t border-gray-800 text-xs text-gray-500">
                    Created {format(parseISO(report.createdAt), 'h:mm a')}
                    {report.createdAt !== report.updatedAt && (
                      <> • Updated {format(parseISO(report.updatedAt), 'h:mm a')}</>
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

interface SectionProps {
  icon: React.ReactNode
  title: string
  items: string[]
  numbered?: boolean
}

function Section({ icon, title, items, numbered }: SectionProps) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <h4 className="text-sm font-semibold text-gray-300">{title}</h4>
      </div>
      <ul className="space-y-1.5 ml-7">
        {items.map((item, index) => (
          <li key={index} className="text-sm text-gray-400 flex items-start gap-2">
            {numbered ? (
              <span className="text-indigo-400 font-semibold">{index + 1}.</span>
            ) : (
              <span className="text-gray-600">•</span>
            )}
            <span className="flex-1">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
