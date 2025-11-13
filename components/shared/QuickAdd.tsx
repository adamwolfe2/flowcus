'use client'

import { useState, useEffect } from 'react'
import { Plus, X, Calendar, Target, Flag } from 'lucide-react'
import { useStore } from '@/lib/store'
import { TaskPriority } from '@/lib/store'

type TabType = 'task' | 'note' | 'idea' | 'meeting'

export default function QuickAdd() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>('task')
  const { rocks, subRocks, addTask, addNote, addIdea, addMeetingNote } = useStore()

  // Task form state
  const [taskTitle, setTaskTitle] = useState('')
  const [taskRockId, setTaskRockId] = useState<string | null>(null)
  const [taskSubRockId, setTaskSubRockId] = useState<string | null>(null)
  const [taskDueDate, setTaskDueDate] = useState('')
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('medium')

  // Note form state
  const [noteTitle, setNoteTitle] = useState('')
  const [noteContent, setNoteContent] = useState('')
  const [noteRockId, setNoteRockId] = useState<string | null>(null)

  // Idea form state
  const [ideaTitle, setIdeaTitle] = useState('')
  const [ideaContent, setIdeaContent] = useState('')
  const [ideaRockId, setIdeaRockId] = useState<string | null>(null)

  // Meeting form state
  const [meetingTitle, setMeetingTitle] = useState('')
  const [meetingDate, setMeetingDate] = useState('')
  const [meetingAttendees, setMeetingAttendees] = useState('')
  const [meetingContent, setMeetingContent] = useState('')

  // Filtered sub-rocks based on selected rock
  const filteredSubRocks = taskSubRockId ? subRocks.filter((sr) => sr.rockId === taskRockId) : []

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+N or Ctrl+N to open Quick Add
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault()
        setIsOpen(true)
      }
      // ESC to close
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  const resetForms = () => {
    setTaskTitle('')
    setTaskRockId(null)
    setTaskSubRockId(null)
    setTaskDueDate('')
    setTaskPriority('medium')

    setNoteTitle('')
    setNoteContent('')
    setNoteRockId(null)

    setIdeaTitle('')
    setIdeaContent('')
    setIdeaRockId(null)

    setMeetingTitle('')
    setMeetingDate('')
    setMeetingAttendees('')
    setMeetingContent('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    switch (activeTab) {
      case 'task':
        if (taskTitle.trim()) {
          addTask({
            title: taskTitle,
            description: '',
            rockId: taskRockId,
            subRockId: taskSubRockId,
            status: 'todo',
            priority: taskPriority,
            dueDate: taskDueDate || null,
            completedDate: null,
            source: 'manual',
            externalId: null,
            url: null,
            tags: [],
            timeEstimate: null,
          })
          resetForms()
          setIsOpen(false)
        }
        break

      case 'note':
        if (noteTitle.trim()) {
          addNote({
            title: noteTitle,
            content: noteContent,
            source: 'manual',
            externalId: null,
            url: null,
            rockId: noteRockId,
            subRockId: null,
          })
          resetForms()
          setIsOpen(false)
        }
        break

      case 'idea':
        if (ideaTitle.trim()) {
          addIdea({
            title: ideaTitle,
            content: ideaContent,
            rockId: ideaRockId,
            subRockId: null,
          })
          resetForms()
          setIsOpen(false)
        }
        break

      case 'meeting':
        if (meetingTitle.trim()) {
          addMeetingNote({
            title: meetingTitle,
            content: meetingContent,
            date: meetingDate || new Date().toISOString().split('T')[0],
            attendees: meetingAttendees.split(',').map((a) => a.trim()).filter(Boolean),
            rockId: null,
            subRockId: null,
            source: 'manual',
            externalId: null,
            url: null,
            actionItems: [],
            keyDecisions: [],
          })
          resetForms()
          setIsOpen(false)
        }
        break
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit(e)
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed right-20 bottom-20 w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 z-40"
        title="Quick Add (Cmd+N)"
      >
        <Plus className="w-6 h-6" />
      </button>
    )
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={() => setIsOpen(false)}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-900 rounded-lg shadow-2xl w-full max-w-2xl border border-gray-800">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-800">
            <h2 className="text-2xl font-bold text-white">Quick Add</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-800">
            {(['task', 'note', 'idea', 'meeting'] as TabType[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 px-6 py-4 text-sm font-medium capitalize transition-colors ${
                  activeTab === tab
                    ? 'text-white border-b-2 border-indigo-500 bg-gray-800'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} onKeyPress={handleKeyPress} className="p-6">
            {/* Task Tab */}
            {activeTab === 'task' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    placeholder="What needs to be done?"
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    autoFocus
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Rock
                    </label>
                    <select
                      value={taskRockId || ''}
                      onChange={(e) => {
                        setTaskRockId(e.target.value || null)
                        setTaskSubRockId(null)
                      }}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">No Rock</option>
                      {rocks.map((rock) => (
                        <option key={rock.id} value={rock.id}>
                          {rock.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Sub-Rock
                    </label>
                    <select
                      value={taskSubRockId || ''}
                      onChange={(e) => setTaskSubRockId(e.target.value || null)}
                      disabled={!taskRockId}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                      <option value="">No Sub-Rock</option>
                      {filteredSubRocks.map((subRock) => (
                        <option key={subRock.id} value={subRock.id}>
                          {subRock.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={taskDueDate}
                      onChange={(e) => setTaskDueDate(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Priority
                    </label>
                    <select
                      value={taskPriority}
                      onChange={(e) => setTaskPriority(e.target.value as TaskPriority)}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Note Tab */}
            {activeTab === 'note' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                    placeholder="Note title"
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Content
                  </label>
                  <textarea
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    placeholder="Write your note..."
                    rows={6}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Link to Rock
                  </label>
                  <select
                    value={noteRockId || ''}
                    onChange={(e) => setNoteRockId(e.target.value || null)}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">No Rock</option>
                    {rocks.map((rock) => (
                      <option key={rock.id} value={rock.id}>
                        {rock.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Idea Tab */}
            {activeTab === 'idea' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={ideaTitle}
                    onChange={(e) => setIdeaTitle(e.target.value)}
                    placeholder="Your idea..."
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Content
                  </label>
                  <textarea
                    value={ideaContent}
                    onChange={(e) => setIdeaContent(e.target.value)}
                    placeholder="Describe your idea..."
                    rows={6}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Link to Rock
                  </label>
                  <select
                    value={ideaRockId || ''}
                    onChange={(e) => setIdeaRockId(e.target.value || null)}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">No Rock</option>
                    {rocks.map((rock) => (
                      <option key={rock.id} value={rock.id}>
                        {rock.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Meeting Tab */}
            {activeTab === 'meeting' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={meetingTitle}
                    onChange={(e) => setMeetingTitle(e.target.value)}
                    placeholder="Meeting title"
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    autoFocus
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Date
                    </label>
                    <input
                      type="date"
                      value={meetingDate}
                      onChange={(e) => setMeetingDate(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Attendees
                    </label>
                    <input
                      type="text"
                      value={meetingAttendees}
                      onChange={(e) => setMeetingAttendees(e.target.value)}
                      placeholder="Comma separated"
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={meetingContent}
                    onChange={(e) => setMeetingContent(e.target.value)}
                    placeholder="Meeting notes..."
                    rows={6}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  />
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-800">
              <p className="text-sm text-gray-400">
                Press <kbd className="px-2 py-1 bg-gray-800 rounded text-xs">Cmd+Enter</kbd> to submit
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium"
                >
                  Add {activeTab}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
