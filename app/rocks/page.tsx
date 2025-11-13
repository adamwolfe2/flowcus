'use client'

import { useState, useMemo } from 'react'
import { useStore, Rock, RockStatus } from '@/lib/store'
import RockCard from '@/components/rocks/RockCard'
import { Grid, List, Search, Filter, SortAsc, Plus } from 'lucide-react'
import Link from 'next/link'

type SortOption = 'name' | 'progress' | 'targetDate' | 'status'
type ViewMode = 'grid' | 'list'

export default function RocksPage() {
  const { rocks, updateRock } = useStore()
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatuses, setSelectedStatuses] = useState<RockStatus[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [progressRange, setProgressRange] = useState<[number, number]>([0, 100])
  const [sortBy, setSortBy] = useState<SortOption>('name')
  const [showFilters, setShowFilters] = useState(false)

  // Get unique categories
  const categories = useMemo(() => {
    return Array.from(new Set(rocks.map((r) => r.category).filter(Boolean)))
  }, [rocks])

  // Filter and sort rocks
  const filteredRocks = useMemo(() => {
    let filtered = rocks.filter((rock) => {
      // Search filter
      if (searchQuery && !rock.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false
      }

      // Status filter
      if (selectedStatuses.length > 0 && !selectedStatuses.includes(rock.status)) {
        return false
      }

      // Category filter
      if (selectedCategories.length > 0 && !selectedCategories.includes(rock.category)) {
        return false
      }

      // Progress filter
      if (rock.progress < progressRange[0] || rock.progress > progressRange[1]) {
        return false
      }

      return true
    })

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'progress':
          return b.progress - a.progress
        case 'targetDate':
          return new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime()
        case 'status':
          const statusOrder = { complete: 0, on_track: 1, in_progress: 2, at_risk: 3, not_started: 4 }
          return statusOrder[a.status] - statusOrder[b.status]
        default:
          return 0
      }
    })

    return filtered
  }, [rocks, searchQuery, selectedStatuses, selectedCategories, progressRange, sortBy])

  const toggleStatus = (status: RockStatus) => {
    setSelectedStatuses((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    )
  }

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    )
  }

  const handleStatusChange = (rockId: string, status: RockStatus) => {
    updateRock(rockId, { status })
  }

  const clearFilters = () => {
    setSelectedStatuses([])
    setSelectedCategories([])
    setProgressRange([0, 100])
    setSearchQuery('')
  }

  const hasActiveFilters =
    selectedStatuses.length > 0 ||
    selectedCategories.length > 0 ||
    progressRange[0] !== 0 ||
    progressRange[1] !== 100 ||
    searchQuery !== ''

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-1">All Rocks</h1>
            <p className="text-gray-400">
              {filteredRocks.length} of {rocks.length} rocks
            </p>
          </div>
          <Link
            href="/"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Rock
          </Link>
        </div>

        {/* Controls Bar */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search rocks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Filters Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm ${
                showFilters || hasActiveFilters
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <Filter className="w-4 h-4" />
              Filters
              {hasActiveFilters && (
                <span className="bg-indigo-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {selectedStatuses.length + selectedCategories.length + (progressRange[0] !== 0 || progressRange[1] !== 100 ? 1 : 0)}
                </span>
              )}
            </button>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <SortAsc className="w-4 h-4 text-gray-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="name">Name</option>
                <option value="progress">Progress</option>
                <option value="targetDate">Target Date</option>
                <option value="status">Status</option>
              </select>
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-1 bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'grid' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'list' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-800 grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Status Filter */}
              <div>
                <label className="text-xs font-medium text-gray-400 block mb-2">Status</label>
                <div className="flex flex-wrap gap-2">
                  {(['not_started', 'in_progress', 'on_track', 'at_risk', 'complete'] as RockStatus[]).map((status) => (
                    <button
                      key={status}
                      onClick={() => toggleStatus(status)}
                      className={`px-3 py-1 text-xs rounded transition-colors ${
                        selectedStatuses.includes(status)
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {status.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <label className="text-xs font-medium text-gray-400 block mb-2">Category</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => toggleCategory(category)}
                      className={`px-3 py-1 text-xs rounded transition-colors ${
                        selectedCategories.includes(category)
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Progress Filter */}
              <div>
                <label className="text-xs font-medium text-gray-400 block mb-2">
                  Progress: {progressRange[0]}% - {progressRange[1]}%
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={progressRange[0]}
                    onChange={(e) => setProgressRange([parseInt(e.target.value), progressRange[1]])}
                    className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={progressRange[1]}
                    onChange={(e) => setProgressRange([progressRange[0], parseInt(e.target.value)])}
                    className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <div className="md:col-span-3 flex justify-end">
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Rocks Grid/List */}
        {filteredRocks.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">No rocks found matching your filters</p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-4 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
                : 'flex flex-col gap-3'
            }
          >
            {filteredRocks.map((rock) => (
              <RockCard
                key={rock.id}
                rock={rock}
                view={viewMode}
                onStatusChange={(status) => handleStatusChange(rock.id, status)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
