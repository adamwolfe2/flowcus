'use client'

import { useState, useMemo } from 'react'
import { format, parseISO, differenceInDays } from 'date-fns'
import { Search, Download, Flame, X } from 'lucide-react'
import { useStore, JournalEntry as JournalEntryType } from '@/lib/store'
import JournalCalendar from '@/components/journal/JournalCalendar'
import JournalEntry from '@/components/journal/JournalEntry'
import JournalForm from '@/components/journal/JournalForm'

type ViewMode = 'view' | 'edit' | 'create'

export default function JournalPage() {
  const {
    journalEntries,
    addJournalEntry,
    updateJournalEntry,
    deleteJournalEntry,
    rocks,
  } = useStore()

  const [selectedDate, setSelectedDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<ViewMode>('view')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterRockId, setFilterRockId] = useState<string | null>(null)

  const selectedDateString = format(selectedDate, 'yyyy-MM-dd')

  // Get entry for selected date
  const selectedEntry = journalEntries.find((entry) => entry.date === selectedDateString)

  // Filter entries based on search and rock filter
  const filteredEntries = useMemo(() => {
    let filtered = journalEntries

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (entry) =>
          entry.content.toLowerCase().includes(query) ||
          entry.gratitude?.toLowerCase().includes(query) ||
          entry.wentWell.some((item) => item.toLowerCase().includes(query)) ||
          entry.couldImprove.some((item) => item.toLowerCase().includes(query)) ||
          entry.keyInsights.some((item) => item.toLowerCase().includes(query)) ||
          entry.tomorrowIntention?.toLowerCase().includes(query)
      )
    }

    if (filterRockId) {
      filtered = filtered.filter((entry) => entry.rockIds.includes(filterRockId))
    }

    return filtered
  }, [journalEntries, searchQuery, filterRockId])

  // Calculate streak
  const streak = useMemo(() => {
    if (journalEntries.length === 0) return 0

    const sortedEntries = [...journalEntries].sort((a, b) => b.date.localeCompare(a.date))
    const today = format(new Date(), 'yyyy-MM-dd')

    let currentStreak = 0
    let checkDate = today

    for (const entry of sortedEntries) {
      if (entry.date === checkDate) {
        currentStreak++
        const entryDate = parseISO(entry.date)
        checkDate = format(new Date(entryDate.getTime() - 86400000), 'yyyy-MM-dd')
      } else {
        const daysDiff = differenceInDays(parseISO(checkDate), parseISO(entry.date))
        if (daysDiff > 1) break
      }
    }

    return currentStreak
  }, [journalEntries])

  // Handle form submission
  const handleSubmit = (entry: Omit<JournalEntryType, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (selectedEntry) {
      updateJournalEntry(selectedEntry.id, entry)
    } else {
      addJournalEntry(entry)
    }
    setViewMode('view')
  }

  // Handle edit
  const handleEdit = () => {
    setViewMode('edit')
  }

  // Handle delete
  const handleDelete = () => {
    if (selectedEntry) {
      deleteJournalEntry(selectedEntry.id)
      setViewMode('view')
    }
  }

  // Handle cancel
  const handleCancel = () => {
    setViewMode('view')
  }

  // Handle date select
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    const dateString = format(date, 'yyyy-MM-dd')
    const entry = journalEntries.find((e) => e.date === dateString)
    setViewMode(entry ? 'view' : 'create')
  }

  // Export entry as markdown
  const exportAsMarkdown = () => {
    if (!selectedEntry) return

    let markdown = `# Journal Entry - ${format(parseISO(selectedEntry.date), 'MMMM d, yyyy')}\n\n`

    if (selectedEntry.content) {
      markdown += `${selectedEntry.content}\n\n`
    }

    if (selectedEntry.gratitude) {
      markdown += `## Gratitude\n${selectedEntry.gratitude}\n\n`
    }

    if (selectedEntry.wentWell.length > 0) {
      markdown += `## What Went Well\n${selectedEntry.wentWell.map((item) => `- ${item}`).join('\n')}\n\n`
    }

    if (selectedEntry.couldImprove.length > 0) {
      markdown += `## What Could Improve\n${selectedEntry.couldImprove.map((item) => `- ${item}`).join('\n')}\n\n`
    }

    if (selectedEntry.keyInsights.length > 0) {
      markdown += `## Key Insights\n${selectedEntry.keyInsights.map((item) => `- ${item}`).join('\n')}\n\n`
    }

    if (selectedEntry.tomorrowIntention) {
      markdown += `## Tomorrow's Intention\n${selectedEntry.tomorrowIntention}\n\n`
    }

    if (selectedEntry.rockIds.length > 0) {
      const linkedRocks = rocks.filter((rock) => selectedEntry.rockIds.includes(rock.id))
      markdown += `## Linked Rocks\n${linkedRocks.map((rock) => `- ${rock.icon} ${rock.name}`).join('\n')}\n\n`
    }

    // Create and download file
    const blob = new Blob([markdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `journal-${selectedEntry.date}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Determine what to show in the right panel
  const renderRightPanel = () => {
    if (viewMode === 'edit' || viewMode === 'create') {
      return (
        <JournalForm
          date={selectedDateString}
          existingEntry={selectedEntry}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          rocks={rocks}
        />
      )
    }

    if (selectedEntry) {
      return (
        <JournalEntry
          entry={selectedEntry}
          rocks={rocks}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )
    }

    return (
      <div className="h-full flex items-center justify-center bg-gray-900 rounded-lg border border-gray-800">
        <div className="text-center px-6">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-semibold text-white mb-2">No Entry for This Date</h3>
          <p className="text-gray-400 mb-6">
            Start writing about your day by clicking the button below.
          </p>
          <button
            onClick={() => setViewMode('create')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
          >
            Create Entry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-black">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-white">Journal</h1>
          {streak > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-500/20 rounded-full">
              <Flame size={16} className="text-orange-500" />
              <span className="text-sm font-semibold text-orange-500">
                {streak} day{streak !== 1 ? 's' : ''} streak
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search entries..."
              className="pl-10 pr-4 py-2 w-64 bg-gray-900 border border-gray-800 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-400"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Rock Filter */}
          <select
            value={filterRockId || ''}
            onChange={(e) => setFilterRockId(e.target.value || null)}
            className="px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="">All Rocks</option>
            {rocks.map((rock) => (
              <option key={rock.id} value={rock.id}>
                {rock.icon} {rock.name}
              </option>
            ))}
          </select>

          {/* Export */}
          {selectedEntry && (
            <button
              onClick={exportAsMarkdown}
              className="px-4 py-2 bg-gray-900 hover:bg-gray-800 border border-gray-800 text-white rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
              title="Export as Markdown"
            >
              <Download size={16} />
              Export
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full grid grid-cols-1 lg:grid-cols-[320px,1fr] gap-4 p-4">
          {/* Left Side: Calendar */}
          <div className="h-full overflow-hidden">
            <JournalCalendar
              entries={filteredEntries}
              selectedDate={selectedDate}
              onDateSelect={handleDateSelect}
            />
          </div>

          {/* Right Side: Entry or Form */}
          <div className="h-full overflow-hidden">
            {renderRightPanel()}
          </div>
        </div>
      </div>
    </div>
  )
}
