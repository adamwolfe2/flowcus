'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, TrendingUp, X, ChevronDown, Plus } from 'lucide-react'
import { useStore } from '@/lib/store'
import { useRouter } from 'next/navigation'

interface HeaderProps {
  title?: string
  showSearch?: boolean
  showStats?: boolean
  onQuickAdd?: () => void
}

interface SearchResult {
  id: string
  type: 'rock' | 'task' | 'note' | 'journal' | 'meeting'
  title: string
  subtitle?: string
  url: string
}

export default function Header({
  title,
  showSearch = true,
  showStats = true,
  onQuickAdd
}: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [showStatsDropdown, setShowStatsDropdown] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const {
    rocks,
    tasks,
    notes,
    journalEntries,
    meetingNotes,
    getTasksDueToday,
    getRocksAtRisk,
    eodReports,
  } = useStore()

  // Search functionality
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([])
      return
    }

    const query = searchQuery.toLowerCase()
    const results: SearchResult[] = []

    // Search rocks
    rocks.forEach((rock) => {
      if (rock.name.toLowerCase().includes(query) || rock.description.toLowerCase().includes(query)) {
        results.push({
          id: rock.id,
          type: 'rock',
          title: rock.name,
          subtitle: rock.target,
          url: `/canvas?rock=${rock.id}`,
        })
      }
    })

    // Search tasks
    tasks.forEach((task) => {
      if (
        task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query)
      ) {
        const rock = task.rockId ? rocks.find((r) => r.id === task.rockId) : null
        results.push({
          id: task.id,
          type: 'task',
          title: task.title,
          subtitle: rock ? `In ${rock.name}` : undefined,
          url: `/daily?task=${task.id}`,
        })
      }
    })

    // Search notes
    notes.forEach((note) => {
      if (note.title.toLowerCase().includes(query) || note.content.toLowerCase().includes(query)) {
        results.push({
          id: note.id,
          type: 'note',
          title: note.title,
          subtitle: 'Note',
          url: `/canvas?note=${note.id}`,
        })
      }
    })

    // Search journal entries
    journalEntries.forEach((entry) => {
      if (entry.content.toLowerCase().includes(query)) {
        results.push({
          id: entry.id,
          type: 'journal',
          title: `Journal - ${entry.date}`,
          subtitle: entry.content.substring(0, 50) + '...',
          url: `/journal?date=${entry.date}`,
        })
      }
    })

    // Search meeting notes
    meetingNotes.forEach((meeting) => {
      if (
        meeting.title.toLowerCase().includes(query) ||
        meeting.content.toLowerCase().includes(query)
      ) {
        results.push({
          id: meeting.id,
          type: 'meeting',
          title: meeting.title,
          subtitle: meeting.date,
          url: `/meetings?id=${meeting.id}`,
        })
      }
    })

    setSearchResults(results.slice(0, 10))
  }, [searchQuery, rocks, tasks, notes, journalEntries, meetingNotes])

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false)
      }
      if (statsRef.current && !statsRef.current.contains(event.target as Node)) {
        setShowStatsDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K or Ctrl+K to focus search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        const searchInput = document.getElementById('global-search') as HTMLInputElement
        searchInput?.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleSearchResultClick = (url: string) => {
    router.push(url)
    setSearchQuery('')
    setShowSearchResults(false)
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'rock':
        return 'text-purple-400'
      case 'task':
        return 'text-blue-400'
      case 'note':
        return 'text-green-400'
      case 'journal':
        return 'text-yellow-400'
      case 'meeting':
        return 'text-pink-400'
      default:
        return 'text-gray-400'
    }
  }

  // Calculate stats
  const tasksDueToday = getTasksDueToday()
  const rocksAtRisk = getRocksAtRisk()
  const onTrackRocks = rocks.filter((r) => r.status === 'on_track').length
  const todayString = new Date().toISOString().split('T')[0]
  const hasEODToday = eodReports.some((report) => report.date === todayString)
  const currentStreak = 7 // TODO: Calculate actual streak from EOD reports

  return (
    <div className="h-16 bg-gray-900 border-b border-gray-800 flex items-center px-6 gap-4">
      {/* Title */}
      {title && (
        <h2 className="text-xl font-bold text-white whitespace-nowrap">{title}</h2>
      )}

      <div className="flex-1" />

      {/* Search Bar */}
      {showSearch && (
        <div className="relative flex-1 max-w-md" ref={searchRef}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              id="global-search"
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setShowSearchResults(true)
              }}
              onFocus={() => setShowSearchResults(true)}
              placeholder="Search rocks, tasks, notes... (Cmd+K)"
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('')
                  setSearchResults([])
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Search Results Dropdown */}
          {showSearchResults && searchResults.length > 0 && (
            <div className="absolute top-full mt-2 w-full bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
              {searchResults.map((result) => (
                <button
                  key={`${result.type}-${result.id}`}
                  onClick={() => handleSearchResultClick(result.url)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors border-b border-gray-700 last:border-b-0"
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`text-xs font-semibold uppercase tracking-wider ${getTypeColor(
                        result.type
                      )}`}
                    >
                      {result.type}
                    </span>
                    <div className="flex-1">
                      <div className="text-white font-medium">{result.title}</div>
                      {result.subtitle && (
                        <div className="text-sm text-gray-400 mt-0.5">{result.subtitle}</div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* No Results */}
          {showSearchResults && searchQuery.length >= 2 && searchResults.length === 0 && (
            <div className="absolute top-full mt-2 w-full bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 px-4 py-6 text-center">
              <p className="text-gray-400">No results found for "{searchQuery}"</p>
            </div>
          )}
        </div>
      )}

      {/* Quick Stats Dropdown */}
      {showStats && (
        <div className="relative" ref={statsRef}>
          <button
            onClick={() => setShowStatsDropdown(!showStatsDropdown)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg transition-colors"
          >
            <TrendingUp className="w-4 h-4 text-indigo-400" />
            <span className="text-sm font-medium text-white">Stats</span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>

          {showStatsDropdown && (
            <div className="absolute top-full right-0 mt-2 w-80 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50">
              <div className="p-4">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                  Quick Overview
                </h3>

                <div className="space-y-4">
                  {/* Rocks on Track */}
                  <div className="flex items-center justify-between">
                    <span className="text-white">Rocks on Track</span>
                    <span className="text-2xl font-bold text-green-500">
                      {onTrackRocks}/{rocks.length}
                    </span>
                  </div>

                  {/* Rocks at Risk */}
                  {rocksAtRisk.length > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-white">Rocks at Risk</span>
                      <span className="text-2xl font-bold text-red-500">{rocksAtRisk.length}</span>
                    </div>
                  )}

                  {/* Tasks Due Today */}
                  <div className="flex items-center justify-between">
                    <span className="text-white">Tasks Due Today</span>
                    <span className="text-2xl font-bold text-blue-500">{tasksDueToday.length}</span>
                  </div>

                  {/* Current Streak */}
                  <div className="flex items-center justify-between">
                    <span className="text-white">Current Streak</span>
                    <span className="text-2xl font-bold text-yellow-500">{currentStreak} days</span>
                  </div>

                  {/* EOD Status */}
                  <div className="flex items-center justify-between">
                    <span className="text-white">EOD Today</span>
                    <span
                      className={`text-sm font-semibold ${
                        hasEODToday ? 'text-green-500' : 'text-red-500'
                      }`}
                    >
                      {hasEODToday ? 'Complete' : 'Pending'}
                    </span>
                  </div>
                </div>

                {/* Quick Links */}
                <div className="mt-4 pt-4 border-t border-gray-700 space-y-2">
                  <button
                    onClick={() => {
                      router.push('/')
                      setShowStatsDropdown(false)
                    }}
                    className="w-full px-3 py-2 text-sm text-left text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors"
                  >
                    View Dashboard
                  </button>
                  <button
                    onClick={() => {
                      router.push('/daily')
                      setShowStatsDropdown(false)
                    }}
                    className="w-full px-3 py-2 text-sm text-left text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors"
                  >
                    Daily Workspace
                  </button>
                  <button
                    onClick={() => {
                      router.push('/eod')
                      setShowStatsDropdown(false)
                    }}
                    className="w-full px-3 py-2 text-sm text-left text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors"
                  >
                    Create EOD Report
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quick Add Button */}
      {onQuickAdd && (
        <button
          onClick={onQuickAdd}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm font-medium">Quick Add</span>
        </button>
      )}
    </div>
  )
}
