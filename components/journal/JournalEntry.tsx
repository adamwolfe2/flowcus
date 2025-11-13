'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import {
  Edit2,
  Trash2,
  Heart,
  TrendingUp,
  TrendingDown,
  Lightbulb,
  Target,
  Calendar,
  Link2,
} from 'lucide-react'
import { JournalEntry as JournalEntryType, Rock } from '@/lib/store'

interface JournalEntryProps {
  entry: JournalEntryType
  rocks: Rock[]
  onEdit: () => void
  onDelete: () => void
}

export default function JournalEntry({ entry, rocks, onEdit, onDelete }: JournalEntryProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const linkedRocks = rocks.filter((rock) => entry.rockIds.includes(rock.id))

  const handleDelete = () => {
    onDelete()
    setShowDeleteConfirm(false)
  }

  const displayDate = format(new Date(entry.date), 'EEEE, MMMM d, yyyy')

  return (
    <div className="h-full flex flex-col bg-gray-900 rounded-lg border border-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-800">
        <div>
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
            <Calendar size={16} />
            <span>{displayDate}</span>
          </div>
          <h2 className="text-2xl font-bold text-white">Journal Entry</h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors group"
            aria-label="Edit entry"
          >
            <Edit2 size={20} className="text-gray-400 group-hover:text-blue-500" />
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors group"
            aria-label="Delete entry"
          >
            <Trash2 size={20} className="text-gray-400 group-hover:text-red-500" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Main Content */}
        {entry.content && (
          <div>
            <div className="prose prose-invert max-w-none">
              <p className="text-gray-300 text-base leading-relaxed whitespace-pre-wrap">
                {entry.content}
              </p>
            </div>
          </div>
        )}

        {/* Structured Fields */}
        <div className="space-y-4">
          {/* Gratitude */}
          {entry.gratitude && (
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <Heart size={18} className="text-pink-500" />
                <h3 className="text-sm font-semibold text-white">Gratitude</h3>
              </div>
              <p className="text-gray-300 text-sm">{entry.gratitude}</p>
            </div>
          )}

          {/* What Went Well */}
          {entry.wentWell.length > 0 && (
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={18} className="text-green-500" />
                <h3 className="text-sm font-semibold text-white">What Went Well</h3>
              </div>
              <ul className="space-y-2">
                {entry.wentWell.map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span className="text-gray-300 text-sm flex-1">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* What Could Improve */}
          {entry.couldImprove.length > 0 && (
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center gap-2 mb-3">
                <TrendingDown size={18} className="text-orange-500" />
                <h3 className="text-sm font-semibold text-white">What Could Improve</h3>
              </div>
              <ul className="space-y-2">
                {entry.couldImprove.map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-orange-500 mt-1">•</span>
                    <span className="text-gray-300 text-sm flex-1">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Key Insights */}
          {entry.keyInsights.length > 0 && (
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb size={18} className="text-yellow-500" />
                <h3 className="text-sm font-semibold text-white">Key Insights & Learnings</h3>
              </div>
              <ul className="space-y-2">
                {entry.keyInsights.map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-yellow-500 mt-1">•</span>
                    <span className="text-gray-300 text-sm flex-1">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Tomorrow's Intention */}
          {entry.tomorrowIntention && (
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <Target size={18} className="text-blue-500" />
                <h3 className="text-sm font-semibold text-white">Tomorrow's Intention</h3>
              </div>
              <p className="text-gray-300 text-sm">{entry.tomorrowIntention}</p>
            </div>
          )}

          {/* Linked Rocks */}
          {linkedRocks.length > 0 && (
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center gap-2 mb-3">
                <Link2 size={18} className="text-purple-500" />
                <h3 className="text-sm font-semibold text-white">Linked Rocks</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {linkedRocks.map((rock) => (
                  <div
                    key={rock.id}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm"
                    style={{ backgroundColor: `${rock.color}20`, color: rock.color }}
                  >
                    <span>{rock.icon}</span>
                    <span className="font-medium">{rock.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Metadata */}
        <div className="pt-4 border-t border-gray-800">
          <p className="text-xs text-gray-500">
            Created {format(new Date(entry.createdAt), 'MMM d, yyyy h:mm a')}
            {entry.updatedAt !== entry.createdAt && (
              <> • Updated {format(new Date(entry.updatedAt), 'MMM d, yyyy h:mm a')}</>
            )}
          </p>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 rounded-lg">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-white mb-2">Delete Entry?</h3>
            <p className="text-gray-400 text-sm mb-6">
              Are you sure you want to delete this journal entry? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2 px-4 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
