'use client'

import { useState, useEffect } from 'react'
import { useStore, EODReport } from '@/lib/store'
import { Plus, X, Save, Loader2 } from 'lucide-react'
import { format } from 'date-fns'

interface EODFormProps {
  date: string
  existingReport?: EODReport | null
  onSubmit: (report: Omit<EODReport, 'id' | 'createdAt' | 'updatedAt'>) => void
  onCancel?: () => void
}

const DRAFT_KEY = 'flowcus-eod-draft'

export default function EODForm({ date, existingReport, onSubmit, onCancel }: EODFormProps) {
  const { tasks, rocks } = useStore()

  // Form state
  const [accomplished, setAccomplished] = useState<string[]>(existingReport?.accomplished || [''])
  const [blockers, setBlockers] = useState<string[]>(existingReport?.blockers || [''])
  const [tomorrowPriorities, setTomorrowPriorities] = useState<string[]>(
    existingReport?.tomorrowPriorities || ['', '', '']
  )
  const [wins, setWins] = useState<string[]>(existingReport?.wins || [''])
  const [learnings, setLearnings] = useState<string[]>(existingReport?.learnings || [''])
  const [hoursWorked, setHoursWorked] = useState<string>(
    existingReport?.hoursWorked?.toString() || ''
  )

  const [isSubmitting, setIsSubmitting] = useState(false)

  // Auto-save draft (only if creating new, not editing)
  useEffect(() => {
    if (!existingReport) {
      const draft = {
        accomplished,
        blockers,
        tomorrowPriorities,
        wins,
        learnings,
        hoursWorked,
        date,
      }
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
    }
  }, [accomplished, blockers, tomorrowPriorities, wins, learnings, hoursWorked, date, existingReport])

  // Load draft on mount (only if creating new)
  useEffect(() => {
    if (!existingReport) {
      const savedDraft = localStorage.getItem(DRAFT_KEY)
      if (savedDraft) {
        try {
          const draft = JSON.parse(savedDraft)
          if (draft.date === date) {
            setAccomplished(draft.accomplished || [''])
            setBlockers(draft.blockers || [''])
            setTomorrowPriorities(draft.tomorrowPriorities || ['', '', ''])
            setWins(draft.wins || [''])
            setLearnings(draft.learnings || [''])
            setHoursWorked(draft.hoursWorked || '')
          }
        } catch (e) {
          // Invalid draft, ignore
        }
      }
    }
  }, [date, existingReport])

  // Calculate stats from tasks
  const calculateStats = () => {
    const dateString = date
    const completedTasks = tasks.filter(
      (t) =>
        t.status === 'done' &&
        t.completedDate &&
        t.completedDate.startsWith(dateString)
    )

    const tasksCompleted = completedTasks.length
    const rocksProgressed = Array.from(
      new Set(completedTasks.filter((t) => t.rockId).map((t) => t.rockId))
    ).filter(Boolean) as string[]

    return { tasksCompleted, rocksProgressed }
  }

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const { tasksCompleted, rocksProgressed } = calculateStats()

    const report: Omit<EODReport, 'id' | 'createdAt' | 'updatedAt'> = {
      date,
      accomplished: accomplished.filter((item) => item.trim() !== ''),
      blockers: blockers.filter((item) => item.trim() !== ''),
      tomorrowPriorities: tomorrowPriorities.filter((item) => item.trim() !== ''),
      wins: wins.filter((item) => item.trim() !== ''),
      learnings: learnings.filter((item) => item.trim() !== ''),
      hoursWorked: hoursWorked ? parseFloat(hoursWorked) : null,
      tasksCompleted,
      rocksProgressed,
      source: 'manual',
      externalId: null,
    }

    // Simulate async operation
    await new Promise((resolve) => setTimeout(resolve, 500))

    onSubmit(report)

    // Clear draft after successful submit
    if (!existingReport) {
      localStorage.removeItem(DRAFT_KEY)
    }

    setIsSubmitting(false)
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault()
        handleSubmit(e as any)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [accomplished, blockers, tomorrowPriorities, wins, learnings, hoursWorked])

  // Validation
  const isValid = () => {
    const hasAccomplished = accomplished.some((item) => item.trim() !== '')
    const hasThreePriorities = tomorrowPriorities.filter((p) => p.trim() !== '').length === 3
    return hasAccomplished && hasThreePriorities
  }

  const { tasksCompleted, rocksProgressed } = calculateStats()

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Auto-calculated stats */}
      <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
        <h3 className="text-sm font-semibold text-gray-400 mb-3">Auto-Calculated Stats</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-2xl font-bold text-indigo-400">{tasksCompleted}</p>
            <p className="text-xs text-gray-500">Tasks Completed Today</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-purple-400">{rocksProgressed.length}</p>
            <p className="text-xs text-gray-500">Rocks Progressed</p>
          </div>
        </div>
      </div>

      {/* 1. What did you accomplish today? */}
      <DynamicListField
        label="What did you accomplish today?"
        required
        items={accomplished}
        onChange={setAccomplished}
        placeholder="e.g., Completed user authentication module"
      />

      {/* 2. What's blocking your progress? */}
      <DynamicListField
        label="What's blocking your progress?"
        items={blockers}
        onChange={setBlockers}
        placeholder="e.g., Waiting for API documentation"
      />

      {/* 3. Top 3 priorities for tomorrow */}
      <div>
        <label className="block text-sm font-semibold mb-3 text-gray-300">
          Top 3 priorities for tomorrow <span className="text-red-400">*</span>
        </label>
        <div className="space-y-3">
          {tomorrowPriorities.map((priority, index) => (
            <div key={index}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-gray-500">PRIORITY {index + 1}</span>
              </div>
              <input
                type="text"
                value={priority}
                onChange={(e) => {
                  const newPriorities = [...tomorrowPriorities]
                  newPriorities[index] = e.target.value
                  setTomorrowPriorities(newPriorities)
                }}
                placeholder={`Priority ${index + 1}`}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500 text-white placeholder-gray-600"
              />
            </div>
          ))}
        </div>
        {tomorrowPriorities.filter((p) => p.trim() !== '').length !== 3 && (
          <p className="text-xs text-yellow-500 mt-2">
            Please fill in exactly 3 priorities for tomorrow
          </p>
        )}
      </div>

      {/* 4. Wins/breakthroughs */}
      <DynamicListField
        label="Wins/breakthroughs"
        items={wins}
        onChange={setWins}
        placeholder="e.g., Fixed a bug that was blocking the team"
      />

      {/* 5. Key learnings */}
      <DynamicListField
        label="Key learnings"
        items={learnings}
        onChange={setLearnings}
        placeholder="e.g., Learned how to optimize React renders"
      />

      {/* 6. Hours worked */}
      <div>
        <label className="block text-sm font-semibold mb-3 text-gray-300">
          Hours worked (optional)
        </label>
        <input
          type="number"
          step="0.5"
          min="0"
          max="24"
          value={hoursWorked}
          onChange={(e) => setHoursWorked(e.target.value)}
          placeholder="e.g., 8"
          className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500 text-white placeholder-gray-600"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={!isValid() || isSubmitting}
          className="flex-1 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              {existingReport ? 'Update EOD Report' : 'Save EOD Report'}
            </>
          )}
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

      {/* Keyboard shortcut hint */}
      <p className="text-xs text-gray-500 text-center">
        Press <kbd className="px-2 py-1 bg-gray-800 rounded border border-gray-700">Ctrl+Enter</kbd> to save
      </p>
    </form>
  )
}

interface DynamicListFieldProps {
  label: string
  required?: boolean
  items: string[]
  onChange: (items: string[]) => void
  placeholder: string
}

function DynamicListField({ label, required, items, onChange, placeholder }: DynamicListFieldProps) {
  const addItem = () => {
    onChange([...items, ''])
  }

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index)
    // Keep at least one empty item
    if (newItems.length === 0) {
      onChange([''])
    } else {
      onChange(newItems)
    }
  }

  const updateItem = (index: number, value: string) => {
    const newItems = [...items]
    newItems[index] = value
    onChange(newItems)
  }

  return (
    <div>
      <label className="block text-sm font-semibold mb-3 text-gray-300">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              type="text"
              value={item}
              onChange={(e) => updateItem(index, e.target.value)}
              placeholder={placeholder}
              className="flex-1 px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500 text-white placeholder-gray-600"
            />
            {items.length > 1 && (
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-red-400"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addItem}
          className="w-full px-4 py-2 border-2 border-dashed border-gray-700 hover:border-indigo-500 rounded-lg text-gray-400 hover:text-indigo-400 transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add another
        </button>
      </div>
    </div>
  )
}
