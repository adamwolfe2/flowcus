'use client'

import { useState, useEffect, useCallback } from 'react'
import { format } from 'date-fns'
import { Save, X, Plus, Trash2, Calendar, Link2 } from 'lucide-react'
import { JournalEntry, Rock } from '@/lib/store'

interface JournalFormProps {
  date: string
  existingEntry?: JournalEntry | null
  onSubmit: (entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>) => void
  onCancel?: () => void
  rocks: Rock[]
}

export default function JournalForm({ date, existingEntry, onSubmit, onCancel, rocks }: JournalFormProps) {
  const [content, setContent] = useState(existingEntry?.content || '')
  const [gratitude, setGratitude] = useState(existingEntry?.gratitude || '')
  const [wentWell, setWentWell] = useState<string[]>(existingEntry?.wentWell || [''])
  const [couldImprove, setCouldImprove] = useState<string[]>(existingEntry?.couldImprove || [''])
  const [keyInsights, setKeyInsights] = useState<string[]>(existingEntry?.keyInsights || [''])
  const [tomorrowIntention, setTomorrowIntention] = useState(existingEntry?.tomorrowIntention || '')
  const [selectedRockIds, setSelectedRockIds] = useState<string[]>(existingEntry?.rockIds || [])
  const [wordCount, setWordCount] = useState(0)

  // Calculate word count
  useEffect(() => {
    const words = content.trim().split(/\s+/).filter((word) => word.length > 0)
    setWordCount(words.length)
  }, [content])

  // Auto-save draft to localStorage
  useEffect(() => {
    const draftKey = `journal-draft-${date}`
    const draft = {
      content,
      gratitude,
      wentWell,
      couldImprove,
      keyInsights,
      tomorrowIntention,
      selectedRockIds,
    }
    localStorage.setItem(draftKey, JSON.stringify(draft))
  }, [content, gratitude, wentWell, couldImprove, keyInsights, tomorrowIntention, selectedRockIds, date])

  // Load draft on mount
  useEffect(() => {
    if (!existingEntry) {
      const draftKey = `journal-draft-${date}`
      const savedDraft = localStorage.getItem(draftKey)
      if (savedDraft) {
        try {
          const draft = JSON.parse(savedDraft)
          setContent(draft.content || '')
          setGratitude(draft.gratitude || '')
          setWentWell(draft.wentWell || [''])
          setCouldImprove(draft.couldImprove || [''])
          setKeyInsights(draft.keyInsights || [''])
          setTomorrowIntention(draft.tomorrowIntention || '')
          setSelectedRockIds(draft.selectedRockIds || [])
        } catch (error) {
          console.error('Failed to load draft:', error)
        }
      }
    }
  }, [date, existingEntry])

  // Keyboard shortcut: Ctrl+S to save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        handleSubmit()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [content, gratitude, wentWell, couldImprove, keyInsights, tomorrowIntention, selectedRockIds])

  const handleSubmit = useCallback(() => {
    const entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'> = {
      date,
      content: content.trim(),
      prompt: null,
      gratitude: gratitude.trim() || null,
      wentWell: wentWell.filter((item) => item.trim()),
      couldImprove: couldImprove.filter((item) => item.trim()),
      keyInsights: keyInsights.filter((item) => item.trim()),
      tomorrowIntention: tomorrowIntention.trim() || null,
      rockIds: selectedRockIds,
    }

    onSubmit(entry)

    // Clear draft after successful submit
    const draftKey = `journal-draft-${date}`
    localStorage.removeItem(draftKey)
  }, [content, date, gratitude, wentWell, couldImprove, keyInsights, tomorrowIntention, selectedRockIds, onSubmit])

  const addArrayItem = (setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter((prev) => [...prev, ''])
  }

  const removeArrayItem = (setter: React.Dispatch<React.SetStateAction<string[]>>, index: number) => {
    setter((prev) => prev.filter((_, i) => i !== index))
  }

  const updateArrayItem = (
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    index: number,
    value: string
  ) => {
    setter((prev) => prev.map((item, i) => (i === index ? value : item)))
  }

  const toggleRock = (rockId: string) => {
    setSelectedRockIds((prev) =>
      prev.includes(rockId) ? prev.filter((id) => id !== rockId) : [...prev, rockId]
    )
  }

  const displayDate = format(new Date(date), 'EEEE, MMMM d, yyyy')

  return (
    <div className="h-full flex flex-col bg-gray-900 rounded-lg border border-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-800">
        <div>
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
            <Calendar size={16} />
            <span>{displayDate}</span>
          </div>
          <h2 className="text-2xl font-bold text-white">
            {existingEntry ? 'Edit Entry' : 'New Entry'}
          </h2>
        </div>
        <div className="flex gap-2">
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
            >
              <X size={16} />
              Cancel
            </button>
          )}
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
          >
            <Save size={16} />
            Save Entry
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Main Content */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            What's on your mind today?
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write freely about your day, thoughts, feelings, and experiences..."
            className="w-full h-48 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
          <p className="mt-2 text-xs text-gray-500">{wordCount} words</p>
        </div>

        {/* Gratitude */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            What are you grateful for today?
          </label>
          <input
            type="text"
            value={gratitude}
            onChange={(e) => setGratitude(e.target.value)}
            placeholder="Express your gratitude..."
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* What Went Well */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            What went well today?
          </label>
          <div className="space-y-2">
            {wentWell.map((item, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => updateArrayItem(setWentWell, index, e.target.value)}
                  placeholder="Something positive that happened..."
                  className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {wentWell.length > 1 && (
                  <button
                    onClick={() => removeArrayItem(setWentWell, index)}
                    className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                    aria-label="Remove item"
                  >
                    <Trash2 size={18} className="text-gray-500 hover:text-red-500" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            onClick={() => addArrayItem(setWentWell)}
            className="mt-2 text-sm text-blue-500 hover:text-blue-400 flex items-center gap-1"
          >
            <Plus size={16} />
            Add another
          </button>
        </div>

        {/* What Could Improve */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            What could be improved?
          </label>
          <div className="space-y-2">
            {couldImprove.map((item, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => updateArrayItem(setCouldImprove, index, e.target.value)}
                  placeholder="Something to work on..."
                  className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {couldImprove.length > 1 && (
                  <button
                    onClick={() => removeArrayItem(setCouldImprove, index)}
                    className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                    aria-label="Remove item"
                  >
                    <Trash2 size={18} className="text-gray-500 hover:text-red-500" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            onClick={() => addArrayItem(setCouldImprove)}
            className="mt-2 text-sm text-blue-500 hover:text-blue-400 flex items-center gap-1"
          >
            <Plus size={16} />
            Add another
          </button>
        </div>

        {/* Key Insights */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            What did you learn today?
          </label>
          <div className="space-y-2">
            {keyInsights.map((item, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => updateArrayItem(setKeyInsights, index, e.target.value)}
                  placeholder="A key insight or learning..."
                  className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {keyInsights.length > 1 && (
                  <button
                    onClick={() => removeArrayItem(setKeyInsights, index)}
                    className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                    aria-label="Remove item"
                  >
                    <Trash2 size={18} className="text-gray-500 hover:text-red-500" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            onClick={() => addArrayItem(setKeyInsights)}
            className="mt-2 text-sm text-blue-500 hover:text-blue-400 flex items-center gap-1"
          >
            <Plus size={16} />
            Add another
          </button>
        </div>

        {/* Tomorrow's Intention */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            What's your intention for tomorrow?
          </label>
          <input
            type="text"
            value={tomorrowIntention}
            onChange={(e) => setTomorrowIntention(e.target.value)}
            placeholder="Set an intention for tomorrow..."
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Link to Rocks */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
            <Link2 size={16} />
            Link to Rocks
          </label>
          <div className="flex flex-wrap gap-2">
            {rocks.length === 0 ? (
              <p className="text-sm text-gray-500">No rocks available</p>
            ) : (
              rocks.map((rock) => (
                <button
                  key={rock.id}
                  onClick={() => toggleRock(rock.id)}
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all border-2
                    ${
                      selectedRockIds.includes(rock.id)
                        ? 'border-current'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }
                  `}
                  style={{
                    backgroundColor: selectedRockIds.includes(rock.id)
                      ? `${rock.color}30`
                      : `${rock.color}10`,
                    color: rock.color,
                  }}
                >
                  <span>{rock.icon}</span>
                  <span>{rock.name}</span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Save Hint */}
        <div className="pt-4 border-t border-gray-800">
          <p className="text-xs text-gray-500">
            Press Ctrl+S (or Cmd+S on Mac) to save • Drafts are auto-saved
          </p>
        </div>
      </div>
    </div>
  )
}
