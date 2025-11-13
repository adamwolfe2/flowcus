'use client'

import { useState, useMemo } from 'react'
import { useStore, MeetingNote } from '@/lib/store'
import { Search, Calendar, Users, CheckSquare, ChevronRight, Filter } from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'

interface MeetingNoteListProps {
  rockId?: string // filter by rock
  limit?: number
  onSelectNote?: (note: MeetingNote) => void
}

export default function MeetingNoteList({ rockId, limit, onSelectNote }: MeetingNoteListProps) {
  const { meetingNotes, rocks } = useStore()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedNote, setSelectedNote] = useState<MeetingNote | null>(null)

  // Filter and search
  const filteredNotes = useMemo(() => {
    let filtered = meetingNotes

    // Filter by rock if specified
    if (rockId) {
      filtered = filtered.filter((note) => note.rockId === rockId)
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (note) =>
          note.title.toLowerCase().includes(query) ||
          note.content.toLowerCase().includes(query) ||
          note.attendees.some((attendee) => attendee.toLowerCase().includes(query))
      )
    }

    // Sort by date (most recent first)
    filtered = filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    // Apply limit if specified
    if (limit) {
      filtered = filtered.slice(0, limit)
    }

    return filtered
  }, [meetingNotes, rockId, searchQuery, limit])

  const getRockInfo = (rockId: string | null) => {
    if (!rockId) return null
    return rocks.find((r) => r.id === rockId)
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      const isRecent = Date.now() - date.getTime() < 7 * 24 * 60 * 60 * 1000 // Within 7 days
      return isRecent ? formatDistanceToNow(date, { addSuffix: true }) : format(date, 'MMM d, yyyy')
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

  const handleNoteClick = (note: MeetingNote) => {
    setSelectedNote(note)
    if (onSelectNote) {
      onSelectNote(note)
    }
  }

  if (filteredNotes.length === 0 && searchQuery.trim() === '') {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Meeting Notes</h2>
        <div className="text-center py-12 text-gray-400">
          <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="mb-2">No meeting notes yet.</p>
          <p className="text-sm">Create your first meeting note to get started.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold">Meeting Notes</h2>
          <p className="text-sm text-gray-400 mt-1">
            {filteredNotes.length} {filteredNotes.length === 1 ? 'meeting' : 'meetings'}
          </p>
        </div>
        {rockId && (
          <span className="text-sm text-indigo-400 flex items-center gap-1">
            <Filter className="w-4 h-4" />
            Filtered by rock
          </span>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search meetings by title, content, or attendees..."
          className="w-full pl-12 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500 text-white placeholder-gray-500"
        />
      </div>

      {/* Meeting List */}
      {filteredNotes.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No meetings found matching your search.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotes.map((note) => {
            const rock = getRockInfo(note.rockId)

            return (
              <button
                key={note.id}
                onClick={() => handleNoteClick(note)}
                className="w-full text-left bg-gray-900 hover:bg-gray-850 border border-gray-700 hover:border-gray-600 rounded-lg p-4 transition-all group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    {/* Title and Date */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-white group-hover:text-indigo-400 transition-colors truncate">
                        {note.title}
                      </h3>
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {formatDate(note.date)}
                      </span>
                    </div>

                    {/* Attendees */}
                    <div className="flex items-center gap-2 mb-3">
                      <Users className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      <div className="flex items-center gap-1 min-w-0">
                        {note.attendees.slice(0, 3).map((attendee, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-700 text-xs font-medium text-gray-300"
                            title={attendee}
                          >
                            {getInitials(attendee)}
                          </div>
                        ))}
                        {note.attendees.length > 3 && (
                          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-700 text-xs font-medium text-gray-400">
                            +{note.attendees.length - 3}
                          </div>
                        )}
                        <span className="text-xs text-gray-500 ml-1 truncate">
                          {note.attendees.slice(0, 2).join(', ')}
                          {note.attendees.length > 2 && '...'}
                        </span>
                      </div>
                    </div>

                    {/* Footer: Rock badge and Action items count */}
                    <div className="flex items-center gap-3 flex-wrap">
                      {rock && (
                        <span
                          className="inline-flex items-center px-2 py-1 rounded text-xs font-medium"
                          style={{
                            backgroundColor: `${rock.color}20`,
                            color: rock.color,
                          }}
                        >
                          {rock.icon} {rock.name}
                        </span>
                      )}

                      {note.actionItems.length > 0 && (
                        <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                          <CheckSquare className="w-3 h-3" />
                          {note.actionItems.length} action{note.actionItems.length !== 1 ? 's' : ''}
                        </span>
                      )}

                      {note.source === 'granola' && (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-purple-900/20 text-purple-400">
                          Granola
                        </span>
                      )}
                    </div>
                  </div>

                  <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-gray-400 flex-shrink-0 transition-colors" />
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
