'use client'

import { useState } from 'react'
import { Plus, ChevronDown, ChevronRight, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { useStore, SubRock, RockStatus } from '@/lib/store'
import StatusBadge from './StatusBadge'
import ProgressBar from './ProgressBar'

interface SubRockListProps {
  rockId: string
}

export default function SubRockList({ rockId }: SubRockListProps) {
  const { subRocks, updateSubRock, addSubRock } = useStore()
  const [expandedSubRocks, setExpandedSubRocks] = useState<Set<string>>(new Set())
  const [isAdding, setIsAdding] = useState(false)
  const [newSubRockName, setNewSubRockName] = useState('')

  // Get sub-rocks for this rock, sorted by order
  const rockSubRocks = subRocks
    .filter((sr) => sr.rockId === rockId)
    .sort((a, b) => a.order - b.order)

  const toggleExpand = (subRockId: string) => {
    const newExpanded = new Set(expandedSubRocks)
    if (newExpanded.has(subRockId)) {
      newExpanded.delete(subRockId)
    } else {
      newExpanded.add(subRockId)
    }
    setExpandedSubRocks(newExpanded)
  }

  const handleProgressClick = (subRock: SubRock) => {
    // Simple increment by 10% on click, or cycle back to 0 if at 100
    const newProgress = subRock.progress >= 100 ? 0 : subRock.progress + 10
    updateSubRock(subRock.id, { progress: newProgress })
  }

  const handleStatusChange = (subRock: SubRock, newStatus: RockStatus) => {
    updateSubRock(subRock.id, { status: newStatus })
  }

  const handleAddSubRock = () => {
    if (!newSubRockName.trim()) return

    const maxOrder = rockSubRocks.length > 0
      ? Math.max(...rockSubRocks.map((sr) => sr.order))
      : -1

    addSubRock({
      rockId,
      name: newSubRockName,
      description: '',
      target: '',
      targetDate: '',
      progress: 0,
      status: 'not_started',
      order: maxOrder + 1,
    })

    setNewSubRockName('')
    setIsAdding(false)
  }

  return (
    <div className="space-y-2">
      {rockSubRocks.length === 0 && !isAdding && (
        <p className="text-sm text-gray-500 text-center py-8">
          No sub-rocks yet. Add one to break down this rock into smaller goals.
        </p>
      )}

      {rockSubRocks.map((subRock) => {
        const isExpanded = expandedSubRocks.has(subRock.id)

        return (
          <div
            key={subRock.id}
            className="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-750 transition-colors"
          >
            {/* Sub-Rock Header */}
            <div className="p-3">
              <div className="flex items-start gap-2">
                <button
                  onClick={() => toggleExpand(subRock.id)}
                  className="mt-0.5 text-gray-400 hover:text-white transition-colors"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="text-sm font-semibold text-white">
                      {subRock.name}
                    </h4>
                    <StatusBadge status={subRock.status} size="sm" />
                  </div>

                  {subRock.target && (
                    <p className="text-xs text-gray-400 mb-2">
                      Target: {subRock.target}
                    </p>
                  )}

                  {/* Progress Bar - Click to increment */}
                  <div
                    onClick={() => handleProgressClick(subRock)}
                    className="cursor-pointer"
                    title="Click to increment progress"
                  >
                    <ProgressBar
                      progress={subRock.progress}
                      height={6}
                      showLabel={true}
                    />
                  </div>

                  {subRock.targetDate && (
                    <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      <span>
                        Due: {format(new Date(subRock.targetDate), 'MMM d, yyyy')}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="mt-3 pl-6 space-y-3 border-t border-gray-700 pt-3">
                  {subRock.description && (
                    <div>
                      <label className="text-xs font-medium text-gray-400">
                        Description
                      </label>
                      <p className="text-sm text-gray-300 mt-1">
                        {subRock.description}
                      </p>
                    </div>
                  )}

                  {/* Status Selector */}
                  <div>
                    <label className="text-xs font-medium text-gray-400 block mb-1">
                      Status
                    </label>
                    <div className="flex flex-wrap gap-1">
                      {(['not_started', 'in_progress', 'on_track', 'at_risk', 'complete'] as RockStatus[]).map(
                        (status) => (
                          <button
                            key={status}
                            onClick={() => handleStatusChange(subRock, status)}
                            className={`px-2 py-1 text-xs rounded transition-colors ${
                              subRock.status === status
                                ? 'bg-indigo-600 text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                          >
                            {status.replace('_', ' ')}
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  {/* Progress Slider */}
                  <div>
                    <label className="text-xs font-medium text-gray-400 block mb-1">
                      Progress: {subRock.progress}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={subRock.progress}
                      onChange={(e) =>
                        updateSubRock(subRock.id, {
                          progress: parseInt(e.target.value),
                        })
                      }
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )
      })}

      {/* Add Sub-Rock Form */}
      {isAdding ? (
        <div className="p-3 bg-gray-800 rounded-lg">
          <input
            type="text"
            value={newSubRockName}
            onChange={(e) => setNewSubRockName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddSubRock()}
            placeholder="Sub-rock name..."
            className="w-full bg-transparent text-white text-sm outline-none mb-2"
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={handleAddSubRock}
              className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs rounded transition-colors"
            >
              Add
            </button>
            <button
              onClick={() => {
                setIsAdding(false)
                setNewSubRockName('')
              }}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="w-full px-3 py-2 bg-gray-800 hover:bg-gray-750 text-gray-400 hover:text-white rounded-lg flex items-center justify-center gap-2 transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Sub-Rock
        </button>
      )}
    </div>
  )
}
