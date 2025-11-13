'use client'

import { useState, useCallback, useMemo } from 'react'
import FlowCanvas from '@/components/FlowCanvas'
import DetailPanel from '@/components/DetailPanel'
import { useStore, Rock, SubRock, Task, Note, Idea, RockStatus } from '@/lib/store'
import { Filter, Eye, EyeOff, Maximize2 } from 'lucide-react'
import Link from 'next/link'

interface RockWithDetails extends Rock {
  subRocks: SubRock[]
  tasks: Task[]
  notes: Note[]
  ideas: Idea[]
}

export default function CanvasPage() {
  const { rocks, subRocks, tasks, notes, ideas } = useStore()
  const [selectedRock, setSelectedRock] = useState<RockWithDetails | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedStatuses, setSelectedStatuses] = useState<RockStatus[]>([])
  const [showConnections, setShowConnections] = useState(true)
  const [showLegend, setShowLegend] = useState(true)

  // Get unique categories
  const categories = useMemo(() => {
    return Array.from(new Set(rocks.map((r) => r.category).filter(Boolean)))
  }, [rocks])

  // Filter rocks based on selected filters
  const filteredRocks = useMemo(() => {
    return rocks.filter((rock) => {
      // Category filter
      if (selectedCategories.length > 0 && !selectedCategories.includes(rock.category)) {
        return false
      }

      // Status filter
      if (selectedStatuses.length > 0 && !selectedStatuses.includes(rock.status)) {
        return false
      }

      return true
    })
  }, [rocks, selectedCategories, selectedStatuses])

  const handleNodeSelect = useCallback(
    (rock: RockWithDetails | null) => {
      setSelectedRock(rock)
    },
    []
  )

  const handleClosePanel = useCallback(() => {
    setSelectedRock(null)
  }, [])

  const handleRefreshPanel = useCallback(() => {
    if (selectedRock) {
      const updatedRock = rocks.find((r) => r.id === selectedRock.id)
      if (updatedRock) {
        const rockSubRocks = subRocks.filter((sr) => sr.rockId === updatedRock.id)
        const rockTasks = tasks.filter((t) => t.rockId === updatedRock.id)
        const rockNotes = notes.filter((n) => n.rockId === updatedRock.id)
        const rockIdeas = ideas.filter((i) => i.rockId === updatedRock.id)

        setSelectedRock({
          ...updatedRock,
          subRocks: rockSubRocks,
          tasks: rockTasks,
          notes: rockNotes,
          ideas: rockIdeas,
        })
      }
    }
  }, [selectedRock, rocks, subRocks, tasks, notes, ideas])

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    )
  }

  const toggleStatus = (status: RockStatus) => {
    setSelectedStatuses((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    )
  }

  const clearFilters = () => {
    setSelectedCategories([])
    setSelectedStatuses([])
  }

  const hasActiveFilters = selectedCategories.length > 0 || selectedStatuses.length > 0

  return (
    <div className="h-screen w-screen bg-gray-950 flex overflow-hidden">
      {/* Main Canvas Area */}
      <div className="flex-1 relative">
        <FlowCanvas onNodeSelect={handleNodeSelect} />

        {/* Floating Controls - Top Left */}
        <div className="absolute top-4 left-4 z-10">
          <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-xl">
            {/* View Options Header */}
            <div className="p-3 border-b border-gray-800">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-white flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  View Options
                </h3>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="text-xs text-indigo-400 hover:text-indigo-300"
                >
                  {showFilters ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {showFilters && (
              <div className="p-3 space-y-4 max-w-xs">
                {/* Category Filter */}
                <div>
                  <label className="text-xs font-medium text-gray-400 block mb-2">
                    Categories
                  </label>
                  <div className="space-y-1.5">
                    {categories.map((category) => (
                      <label key={category} className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(category)}
                          onChange={() => toggleCategory(category)}
                          className="w-3.5 h-3.5 rounded border-gray-600 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                        <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                          {category}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="text-xs font-medium text-gray-400 block mb-2">
                    Status
                  </label>
                  <div className="space-y-1.5">
                    {(['not_started', 'in_progress', 'on_track', 'at_risk', 'complete'] as RockStatus[]).map((status) => (
                      <label key={status} className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={selectedStatuses.includes(status)}
                          onChange={() => toggleStatus(status)}
                          className="w-3.5 h-3.5 rounded border-gray-600 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                        <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                          {status.replace('_', ' ')}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Connections Toggle */}
                <div>
                  <label className="text-xs font-medium text-gray-400 block mb-2">
                    Display
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={showConnections}
                      onChange={() => setShowConnections(!showConnections)}
                      className="w-3.5 h-3.5 rounded border-gray-600 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                      Show Connections
                    </span>
                  </label>
                </div>

                {/* Clear Filters */}
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="w-full px-3 py-2 text-xs text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded transition-colors"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions - Top Right */}
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <Link
            href="/rocks"
            className="px-4 py-2 bg-gray-900 border border-gray-800 hover:bg-gray-800 text-white rounded-lg transition-colors text-sm flex items-center gap-2 shadow-xl"
          >
            <Maximize2 className="w-4 h-4" />
            List View
          </Link>
          <Link
            href="/"
            className="px-4 py-2 bg-gray-900 border border-gray-800 hover:bg-gray-800 text-white rounded-lg transition-colors text-sm flex items-center gap-2 shadow-xl"
          >
            Dashboard
          </Link>
        </div>

        {/* Legend - Bottom Left */}
        {showLegend && (
          <div className="absolute bottom-4 left-4 z-10 bg-gray-900 border border-gray-800 rounded-lg shadow-xl p-4 max-w-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-white">Legend</h3>
              <button
                onClick={() => setShowLegend(false)}
                className="text-gray-400 hover:text-white"
              >
                <EyeOff className="w-4 h-4" />
              </button>
            </div>

            {/* Status Colors */}
            <div className="space-y-2 mb-4">
              <p className="text-xs font-medium text-gray-400 mb-2">Status Colors</p>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-600"></div>
                  <span className="text-xs text-gray-300">Not Started</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-xs text-gray-300">In Progress</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-xs text-gray-300">On Track</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <span className="text-xs text-gray-300">At Risk</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                  <span className="text-xs text-gray-300">Complete</span>
                </div>
              </div>
            </div>

            {/* Connection Types (Placeholder) */}
            {showConnections && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-400 mb-2">Connection Types</p>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-0.5 bg-blue-400"></div>
                    <span className="text-xs text-gray-300">Depends On</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-0.5 bg-gray-400"></div>
                    <span className="text-xs text-gray-300">Related To</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-0.5 bg-red-400"></div>
                    <span className="text-xs text-gray-300">Blocks</span>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-3 pt-3 border-t border-gray-800">
              <p className="text-xs text-gray-500">
                {filteredRocks.length} of {rocks.length} rocks visible
              </p>
            </div>
          </div>
        )}

        {/* Show Legend Button (when hidden) */}
        {!showLegend && (
          <button
            onClick={() => setShowLegend(true)}
            className="absolute bottom-4 left-4 z-10 p-2 bg-gray-900 border border-gray-800 hover:bg-gray-800 rounded-lg transition-colors shadow-xl"
            title="Show Legend"
          >
            <Eye className="w-4 h-4 text-gray-400" />
          </button>
        )}

        {/* Stats Overlay - Bottom Right */}
        <div className="absolute bottom-4 right-4 z-10 bg-gray-900 border border-gray-800 rounded-lg shadow-xl p-3">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-xl font-bold text-white">{rocks.length}</div>
              <div className="text-xs text-gray-400">Total Rocks</div>
            </div>
            <div>
              <div className="text-xl font-bold text-green-400">
                {rocks.filter((r) => r.status === 'complete').length}
              </div>
              <div className="text-xs text-gray-400">Complete</div>
            </div>
            <div>
              <div className="text-xl font-bold text-amber-400">
                {rocks.filter((r) => r.status === 'at_risk').length}
              </div>
              <div className="text-xs text-gray-400">At Risk</div>
            </div>
            <div>
              <div className="text-xl font-bold text-indigo-400">
                {Math.round(rocks.reduce((sum, r) => sum + r.progress, 0) / rocks.length)}%
              </div>
              <div className="text-xs text-gray-400">Avg Progress</div>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Panel */}
      {selectedRock && (
        <DetailPanel
          rock={selectedRock}
          onClose={handleClosePanel}
          onRefresh={handleRefreshPanel}
        />
      )}
    </div>
  )
}
