'use client'

import { useState } from 'react'
import { useStore, MeetingNote } from '@/lib/store'
import {
  Calendar,
  Users,
  Edit2,
  Trash2,
  CheckSquare,
  Lightbulb,
  ExternalLink,
  Plus,
  X,
} from 'lucide-react'
import { format } from 'date-fns'
import ReactMarkdown from 'react-markdown'

interface MeetingNoteDetailProps {
  note: MeetingNote
  onEdit: () => void
  onDelete: () => void
  onClose?: () => void
}

export default function MeetingNoteDetail({ note, onEdit, onDelete, onClose }: MeetingNoteDetailProps) {
  const { rocks, subRocks, addTask } = useStore()

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [convertingActionIndex, setConvertingActionIndex] = useState<number | null>(null)

  const rock = note.rockId ? rocks.find((r) => r.id === note.rockId) : null
  const subRock = note.subRockId ? subRocks.find((sr) => sr.id === note.subRockId) : null

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'EEEE, MMMM d, yyyy')
    } catch {
      return dateString
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const handleConvertToTask = (actionItem: string, index: number) => {
    setConvertingActionIndex(index)

    const today = new Date().toISOString().split('T')[0]

    addTask({
      title: actionItem,
      description: `From meeting: ${note.title}`,
      rockId: note.rockId,
      subRockId: note.subRockId,
      status: 'todo',
      priority: 'medium',
      dueDate: today,
      completedDate: null,
      source: 'manual',
      externalId: null,
      url: null,
      tags: ['meeting-action'],
      timeEstimate: null,
    })

    // Show success briefly
    setTimeout(() => {
      setConvertingActionIndex(null)
    }, 1500)
  }

  const handleDelete = () => {
    onDelete()
    setShowDeleteConfirm(false)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-gray-800 rounded-lg max-w-4xl w-full my-8 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-6 flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold mb-2">{note.title}</h2>
            <div className="flex items-center gap-4 text-sm text-gray-400 flex-wrap">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(note.date)}</span>
              </div>
              {note.source === 'granola' && (
                <span className="px-2 py-1 bg-purple-900/20 text-purple-400 rounded text-xs">
                  Granola
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={onEdit}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              title="Edit"
            >
              <Edit2 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 hover:bg-red-900/20 text-red-400 rounded-lg transition-colors"
              title="Delete"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Attendees */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-5 h-5 text-indigo-500" />
              <h3 className="font-semibold">Attendees ({note.attendees.length})</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {note.attendees.map((attendee, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-900 rounded-lg"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-700 text-sm font-medium">
                    {getInitials(attendee)}
                  </div>
                  <span className="text-sm">{attendee}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Linked Rocks */}
          {(rock || subRock) && (
            <div>
              <h3 className="font-semibold mb-3">Linked To</h3>
              <div className="flex flex-wrap gap-2">
                {rock && (
                  <span
                    className="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium"
                    style={{
                      backgroundColor: `${rock.color}20`,
                      color: rock.color,
                    }}
                  >
                    {rock.icon} {rock.name}
                  </span>
                )}
                {subRock && (
                  <span className="inline-flex items-center px-3 py-2 bg-gray-700 rounded-lg text-sm">
                    {subRock.name}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Meeting Content */}
          <div>
            <h3 className="font-semibold mb-3">Notes</h3>
            <div className="prose prose-invert prose-sm max-w-none bg-gray-900 rounded-lg p-4">
              <ReactMarkdown>{note.content}</ReactMarkdown>
            </div>
          </div>

          {/* Action Items */}
          {note.actionItems.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <CheckSquare className="w-5 h-5 text-green-500" />
                <h3 className="font-semibold">Action Items ({note.actionItems.length})</h3>
              </div>
              <div className="space-y-2">
                {note.actionItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 bg-gray-900 rounded-lg group hover:bg-gray-850 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="text-sm">{item}</p>
                    </div>
                    <button
                      onClick={() => handleConvertToTask(item, index)}
                      disabled={convertingActionIndex === index}
                      className={`flex items-center gap-1 px-3 py-1 rounded text-xs transition-all ${
                        convertingActionIndex === index
                          ? 'bg-green-900/20 text-green-400'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      {convertingActionIndex === index ? (
                        <>
                          <CheckSquare className="w-3 h-3" />
                          Created
                        </>
                      ) : (
                        <>
                          <Plus className="w-3 h-3" />
                          Create Task
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Key Decisions */}
          {note.keyDecisions.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-5 h-5 text-yellow-500" />
                <h3 className="font-semibold">Key Decisions ({note.keyDecisions.length})</h3>
              </div>
              <div className="space-y-2">
                {note.keyDecisions.map((decision, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-gray-900 rounded-lg">
                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-2 flex-shrink-0" />
                    <p className="text-sm flex-1">{decision}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* External Link */}
          {note.url && (
            <div>
              <a
                href={note.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-700 rounded-lg transition-colors text-sm"
              >
                <ExternalLink className="w-4 h-4" />
                View in {note.source === 'granola' ? 'Granola' : 'External Source'}
              </a>
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 rounded-lg">
            <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full border-2 border-red-800">
              <h3 className="text-xl font-bold mb-4 text-red-400">Delete Meeting Note?</h3>
              <p className="text-gray-300 mb-6">
                Are you sure you want to delete "{note.title}"? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleDelete}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
                >
                  Delete
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
