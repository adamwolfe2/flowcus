'use client'

import { useState, useEffect } from 'react'
import { useStore, EODReport } from '@/lib/store'
import { format } from 'date-fns'
import { Calendar, Edit2, CheckCircle2, ArrowLeft } from 'lucide-react'
import EODForm from '@/components/eod/EODForm'
import EODHistory from '@/components/eod/EODHistory'
import EODInsights from '@/components/eod/EODInsights'
import Link from 'next/link'

export default function EODPage() {
  const { eodReports, addEODReport, updateEODReport } = useStore()

  const [isEditing, setIsEditing] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  // Get today's date
  const today = new Date()
  const todayString = today.toISOString().split('T')[0]
  const formattedToday = format(today, 'EEEE, MMMM d, yyyy')

  // Check if today's EOD exists
  const todaysEOD = eodReports.find((report) => report.date === todayString)

  // Handle form submission
  const handleSubmit = (report: Omit<EODReport, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (todaysEOD && isEditing) {
      // Update existing report
      updateEODReport(todaysEOD.id, report)
    } else {
      // Create new report
      addEODReport(report)
    }

    setIsEditing(false)
    setShowSuccess(true)

    // Hide success message after 3 seconds
    setTimeout(() => {
      setShowSuccess(false)
    }, 3000)
  }

  // Handle cancel
  const handleCancel = () => {
    setIsEditing(false)
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">End of Day Report</h1>
              <div className="flex items-center gap-2 text-gray-400">
                <Calendar className="w-5 h-5" />
                <span>{formattedToday}</span>
              </div>
            </div>
            {todaysEOD && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <Edit2 className="w-4 h-4" />
                Edit Today's Report
              </button>
            )}
          </div>
        </div>

        {/* Success message */}
        {showSuccess && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/50 rounded-lg flex items-center gap-3 animate-fade-in">
            <CheckCircle2 className="w-5 h-5 text-green-400" />
            <div>
              <p className="font-semibold text-green-400">EOD Report Saved!</p>
              <p className="text-sm text-green-300">Your progress has been recorded.</p>
            </div>
          </div>
        )}

        {/* Main content */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left column - Form or Report */}
          <div className="xl:col-span-2 space-y-6">
            {/* Today's Report Section */}
            <div className="bg-gray-800 rounded-lg p-6">
              {todaysEOD && !isEditing ? (
                // Show existing report (read-only)
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">Today's Report</h2>
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-medium flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Completed
                    </span>
                  </div>
                  <ReadOnlyReport report={todaysEOD} />
                </div>
              ) : (
                // Show form
                <div>
                  <h2 className="text-2xl font-bold mb-6">
                    {isEditing ? 'Edit Today\'s Report' : 'Fill Out Today\'s Report'}
                  </h2>
                  <EODForm
                    date={todayString}
                    existingReport={isEditing ? todaysEOD : null}
                    onSubmit={handleSubmit}
                    onCancel={isEditing ? handleCancel : undefined}
                  />
                </div>
              )}
            </div>

            {/* History */}
            <EODHistory limit={7} />
          </div>

          {/* Right column - Insights */}
          <div className="space-y-6">
            <EODInsights reports={eodReports} />

            {/* Quick tips */}
            <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-lg p-6 border border-indigo-500/20">
              <h3 className="text-lg font-bold mb-3">Tips for Great EOD Reports</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-indigo-400">•</span>
                  <span>Be specific about what you accomplished</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-400">•</span>
                  <span>Identify blockers early to get help faster</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-400">•</span>
                  <span>Plan tomorrow while today is fresh in your mind</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-400">•</span>
                  <span>Celebrate wins, no matter how small</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-400">•</span>
                  <span>Document learnings for future reference</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Global styles for animations */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}

interface ReadOnlyReportProps {
  report: EODReport
}

function ReadOnlyReport({ report }: ReadOnlyReportProps) {
  const { rocks } = useStore()

  const getRockName = (rockId: string) => {
    const rock = rocks.find((r) => r.id === rockId)
    return rock ? rock.name : 'Unknown Rock'
  }

  const getRockIcon = (rockId: string) => {
    const rock = rocks.find((r) => r.id === rockId)
    return rock ? rock.icon : '📦'
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
          <p className="text-2xl font-bold text-indigo-400">{report.tasksCompleted}</p>
          <p className="text-xs text-gray-500">Tasks Completed</p>
        </div>
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
          <p className="text-2xl font-bold text-purple-400">{report.rocksProgressed.length}</p>
          <p className="text-xs text-gray-500">Rocks Progressed</p>
        </div>
      </div>

      {/* Accomplished */}
      {report.accomplished.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-400 mb-3">Accomplished</h3>
          <ul className="space-y-2">
            {report.accomplished.map((item, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-gray-300 p-3 bg-gray-900 rounded-lg"
              >
                <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Blockers */}
      {report.blockers.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-400 mb-3">Blockers</h3>
          <ul className="space-y-2">
            {report.blockers.map((item, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-gray-300 p-3 bg-red-500/5 border border-red-500/20 rounded-lg"
              >
                <span className="text-red-400">⚠️</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Tomorrow's Priorities */}
      {report.tomorrowPriorities.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-400 mb-3">Tomorrow's Priorities</h3>
          <div className="space-y-2">
            {report.tomorrowPriorities.map((item, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 bg-gray-900 rounded-lg border border-gray-700"
              >
                <span className="text-indigo-400 font-bold text-sm">#{index + 1}</span>
                <span className="text-gray-300">{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Wins */}
      {report.wins.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-400 mb-3">Wins</h3>
          <ul className="space-y-2">
            {report.wins.map((item, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-gray-300 p-3 bg-purple-500/5 border border-purple-500/20 rounded-lg"
              >
                <span>🎉</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Learnings */}
      {report.learnings.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-400 mb-3">Key Learnings</h3>
          <ul className="space-y-2">
            {report.learnings.map((item, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-gray-300 p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-lg"
              >
                <span>💡</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Rocks Progressed */}
      {report.rocksProgressed.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-400 mb-3">Rocks Progressed</h3>
          <div className="flex flex-wrap gap-2">
            {report.rocksProgressed.map((rockId) => (
              <span
                key={rockId}
                className="px-3 py-2 bg-gray-900 text-gray-300 rounded-lg text-sm flex items-center gap-2 border border-gray-700"
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
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
          <p className="text-lg font-semibold text-gray-300">
            {report.hoursWorked} hours worked
          </p>
        </div>
      )}
    </div>
  )
}
