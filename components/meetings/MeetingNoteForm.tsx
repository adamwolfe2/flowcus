'use client'

import { useState, useEffect } from 'react'
import { useStore, MeetingNote, MeetingSource } from '@/lib/store'
import { X, Plus, Trash2, Calendar, Users, FileText, Link as LinkIcon } from 'lucide-react'

interface MeetingNoteFormProps {
  onSubmit: (note: Omit<MeetingNote, 'id' | 'createdAt' | 'updatedAt'>) => void
  onCancel?: () => void
  initialData?: MeetingNote
}

export default function MeetingNoteForm({ onSubmit, onCancel, initialData }: MeetingNoteFormProps) {
  const { rocks, subRocks } = useStore()

  const [title, setTitle] = useState(initialData?.title || '')
  const [date, setDate] = useState(initialData?.date || new Date().toISOString().split('T')[0])
  const [attendees, setAttendees] = useState<string[]>(initialData?.attendees || [''])
  const [content, setContent] = useState(initialData?.content || '')
  const [rockId, setRockId] = useState<string | null>(initialData?.rockId || null)
  const [subRockId, setSubRockId] = useState<string | null>(initialData?.subRockId || null)
  const [actionItems, setActionItems] = useState<string[]>(initialData?.actionItems || [''])
  const [keyDecisions, setKeyDecisions] = useState<string[]>(initialData?.keyDecisions || [''])
  const [source, setSource] = useState<MeetingSource>(initialData?.source || 'manual')
  const [externalId, setExternalId] = useState(initialData?.externalId || '')
  const [url, setUrl] = useState(initialData?.url || '')

  // Filter sub-rocks based on selected rock
  const availableSubRocks = rockId ? subRocks.filter((sr) => sr.rockId === rockId) : []

  // Reset sub-rock when rock changes
  useEffect(() => {
    if (rockId !== initialData?.rockId) {
      setSubRockId(null)
    }
  }, [rockId, initialData])

  // Auto-extract action items from content
  useEffect(() => {
    if (content) {
      const lines = content.split('\n')
      const extracted: string[] = []

      lines.forEach((line) => {
        // Match patterns like "- [ ]" or "[ ]" at start of line
        const match = line.match(/^[\s-]*\[[\sx]\]\s*(.+)$/i)
        if (match && match[1]) {
          extracted.push(match[1].trim())
        }
      })

      if (extracted.length > 0) {
        setActionItems([...extracted, ''])
      }
    }
  }, [content])

  const handleAddAttendee = () => {
    setAttendees([...attendees, ''])
  }

  const handleRemoveAttendee = (index: number) => {
    setAttendees(attendees.filter((_, i) => i !== index))
  }

  const handleAttendeeChange = (index: number, value: string) => {
    const newAttendees = [...attendees]
    newAttendees[index] = value
    setAttendees(newAttendees)
  }

  const handleAddActionItem = () => {
    setActionItems([...actionItems, ''])
  }

  const handleRemoveActionItem = (index: number) => {
    setActionItems(actionItems.filter((_, i) => i !== index))
  }

  const handleActionItemChange = (index: number, value: string) => {
    const newItems = [...actionItems]
    newItems[index] = value
    setActionItems(newItems)
  }

  const handleAddKeyDecision = () => {
    setKeyDecisions([...keyDecisions, ''])
  }

  const handleRemoveKeyDecision = (index: number) => {
    setKeyDecisions(keyDecisions.filter((_, i) => i !== index))
  }

  const handleKeyDecisionChange = (index: number, value: string) => {
    const newDecisions = [...keyDecisions]
    newDecisions[index] = value
    setKeyDecisions(newDecisions)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Filter out empty strings
    const filteredAttendees = attendees.filter((a) => a.trim())
    const filteredActionItems = actionItems.filter((a) => a.trim())
    const filteredKeyDecisions = keyDecisions.filter((d) => d.trim())

    onSubmit({
      title,
      date,
      attendees: filteredAttendees,
      content,
      rockId,
      subRockId,
      actionItems: filteredActionItems,
      keyDecisions: filteredKeyDecisions,
      source,
      externalId: externalId || null,
      url: url || null,
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-gray-800 rounded-lg max-w-4xl w-full my-8">
        <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-6 flex items-center justify-between rounded-t-lg">
          <h3 className="text-xl font-bold">
            {initialData ? 'Edit Meeting Note' : 'New Meeting Note'}
          </h3>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2 text-gray-300">
                <FileText className="w-4 h-4 inline mr-1" />
                Meeting Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Weekly Sync with Team"
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500 text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                <Calendar className="w-4 h-4 inline mr-1" />
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500 text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Source
              </label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value as MeetingSource)}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500 text-white"
              >
                <option value="manual">Manual</option>
                <option value="granola">Granola</option>
              </select>
            </div>
          </div>

          {/* Attendees */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">
              <Users className="w-4 h-4 inline mr-1" />
              Attendees
            </label>
            <div className="space-y-2">
              {attendees.map((attendee, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={attendee}
                    onChange={(e) => handleAttendeeChange(index, e.target.value)}
                    placeholder="Name or email"
                    className="flex-1 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500 text-white"
                  />
                  {attendees.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveAttendee(index)}
                      className="p-2 text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddAttendee}
                className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Add Attendee
              </button>
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">
              Meeting Notes (Markdown supported)
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your meeting notes here. Use markdown for formatting. Action items with [ ] will be auto-extracted."
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500 text-white min-h-[200px] font-mono text-sm"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Tip: Use "- [ ] Task" format for action items to auto-extract them
            </p>
          </div>

          {/* Rock Assignment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Link to Rock
              </label>
              <select
                value={rockId || ''}
                onChange={(e) => setRockId(e.target.value || null)}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500 text-white"
              >
                <option value="">No Rock</option>
                {rocks.map((rock) => (
                  <option key={rock.id} value={rock.id}>
                    {rock.icon} {rock.name}
                  </option>
                ))}
              </select>
            </div>

            {rockId && availableSubRocks.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  Link to Sub-Rock
                </label>
                <select
                  value={subRockId || ''}
                  onChange={(e) => setSubRockId(e.target.value || null)}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500 text-white"
                >
                  <option value="">No Sub-Rock</option>
                  {availableSubRocks.map((subRock) => (
                    <option key={subRock.id} value={subRock.id}>
                      {subRock.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Action Items */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">
              Action Items
            </label>
            <div className="space-y-2">
              {actionItems.map((item, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => handleActionItemChange(index, e.target.value)}
                    placeholder="Action item"
                    className="flex-1 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500 text-white"
                  />
                  {actionItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveActionItem(index)}
                      className="p-2 text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddActionItem}
                className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Add Action Item
              </button>
            </div>
          </div>

          {/* Key Decisions */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">
              Key Decisions
            </label>
            <div className="space-y-2">
              {keyDecisions.map((decision, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={decision}
                    onChange={(e) => handleKeyDecisionChange(index, e.target.value)}
                    placeholder="Key decision"
                    className="flex-1 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500 text-white"
                  />
                  {keyDecisions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveKeyDecision(index)}
                      className="p-2 text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddKeyDecision}
                className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Add Key Decision
              </button>
            </div>
          </div>

          {/* External Links (for Granola) */}
          {source === 'granola' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  Granola ID
                </label>
                <input
                  type="text"
                  value={externalId}
                  onChange={(e) => setExternalId(e.target.value)}
                  placeholder="External ID"
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  <LinkIcon className="w-4 h-4 inline mr-1" />
                  URL
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500 text-white"
                />
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-700">
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium"
            >
              {initialData ? 'Update Meeting' : 'Create Meeting Note'}
            </button>
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
