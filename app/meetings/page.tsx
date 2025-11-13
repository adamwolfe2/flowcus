'use client'

import { useState } from 'react'
import { Plus, Users, Calendar } from 'lucide-react'
import { useStore } from '@/lib/store'
import MeetingNoteList from '@/components/meetings/MeetingNoteList'
import MeetingNoteForm from '@/components/meetings/MeetingNoteForm'
import { format } from 'date-fns'

export default function MeetingsPage() {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const { meetingNotes, addMeetingNote } = useStore()

  const sortedMeetings = [...meetingNotes].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  const upcomingMeetings = sortedMeetings.filter(
    (m) => new Date(m.date) >= new Date()
  ).length

  const pastMeetings = sortedMeetings.filter(
    (m) => new Date(m.date) < new Date()
  ).length

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                <Users className="w-10 h-10 text-indigo-500" />
                Meetings
              </h1>
              <p className="text-gray-400">Track and organize your meeting notes</p>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2 transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              New Meeting Note
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Meetings</p>
                  <p className="text-3xl font-bold text-white mt-1">{meetingNotes.length}</p>
                </div>
                <Users className="w-8 h-8 text-indigo-500" />
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Upcoming</p>
                  <p className="text-3xl font-bold text-green-500 mt-1">{upcomingMeetings}</p>
                </div>
                <Calendar className="w-8 h-8 text-green-500" />
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Past Meetings</p>
                  <p className="text-3xl font-bold text-gray-500 mt-1">{pastMeetings}</p>
                </div>
                <Calendar className="w-8 h-8 text-gray-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Meeting Notes List */}
        {meetingNotes.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-12 text-center border border-gray-700">
            <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-400 mb-2">No meeting notes yet</h3>
            <p className="text-gray-500 mb-6">
              Create your first meeting note to start tracking discussions and action items
            </p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg inline-flex items-center gap-2 transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              Create Meeting Note
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Upcoming Meetings */}
            {upcomingMeetings > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-green-500" />
                  Upcoming
                </h2>
                <MeetingNoteList />
              </div>
            )}

            {/* Past Meetings */}
            {pastMeetings > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-gray-500" />
                  Past Meetings
                </h2>
                <MeetingNoteList />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Meeting Modal */}
      {showCreateForm && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setShowCreateForm(false)}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-lg shadow-2xl w-full max-w-4xl border border-gray-800 max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">New Meeting Note</h2>
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <span className="text-2xl">&times;</span>
                  </button>
                </div>
                <MeetingNoteForm
                  onSubmit={(note) => {
                    addMeetingNote(note)
                    setShowCreateForm(false)
                  }}
                  onCancel={() => setShowCreateForm(false)}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
