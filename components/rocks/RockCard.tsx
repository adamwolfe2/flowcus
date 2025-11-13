'use client'

import { Rock, RockStatus, useStore } from '@/lib/store'
import { Calendar, CheckSquare, FileText, TrendingUp, MoreVertical } from 'lucide-react'
import { format } from 'date-fns'
import StatusBadge from './StatusBadge'
import ProgressBar from './ProgressBar'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

interface RockCardProps {
  rock: Rock
  view: 'grid' | 'list'
  onClick?: () => void
  onStatusChange?: (status: RockStatus) => void
}

export default function RockCard({ rock, view, onClick, onStatusChange }: RockCardProps) {
  const { subRocks, tasks } = useStore()
  const [showStatusDropdown, setShowStatusDropdown] = useState(false)
  const [showActionsMenu, setShowActionsMenu] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const actionsRef = useRef<HTMLDivElement>(null)

  const rockSubRocks = subRocks.filter((sr) => sr.rockId === rock.id)
  const rockTasks = tasks.filter((t) => t.rockId === rock.id)

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowStatusDropdown(false)
      }
      if (actionsRef.current && !actionsRef.current.contains(event.target as Node)) {
        setShowActionsMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleStatusClick = (e: React.MouseEvent, status: RockStatus) => {
    e.preventDefault()
    e.stopPropagation()
    onStatusChange?.(status)
    setShowStatusDropdown(false)
  }

  const handleCardClick = () => {
    onClick?.()
  }

  if (view === 'grid') {
    return (
      <Link href={`/rocks/${rock.id}`}>
        <div
          className="bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-gray-700 transition-all cursor-pointer group relative"
          onClick={handleCardClick}
        >
          {/* Quick Actions Menu */}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" ref={actionsRef}>
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setShowActionsMenu(!showActionsMenu)
              }}
              className="p-1 hover:bg-gray-800 rounded transition-colors"
            >
              <MoreVertical className="w-4 h-4 text-gray-400" />
            </button>

            {showActionsMenu && (
              <div className="absolute right-0 mt-1 w-32 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10">
                <button className="w-full px-3 py-2 text-xs text-left text-gray-300 hover:bg-gray-700 rounded-t-lg">
                  Edit
                </button>
                <button className="w-full px-3 py-2 text-xs text-left text-gray-300 hover:bg-gray-700">
                  Duplicate
                </button>
                <button className="w-full px-3 py-2 text-xs text-left text-red-400 hover:bg-gray-700 rounded-b-lg">
                  Delete
                </button>
              </div>
            )}
          </div>

          {/* Icon and Name */}
          <div className="flex items-start gap-3 mb-3">
            <span className="text-3xl">{rock.icon}</span>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-white truncate">{rock.name}</h3>
              {rock.category && (
                <p className="text-xs text-gray-500 truncate">{rock.category}</p>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-3">
            <ProgressBar progress={rock.progress} height={8} showLabel={false} />
          </div>

          {/* Status and Progress Percentage */}
          <div className="flex items-center justify-between mb-3 relative" ref={dropdownRef}>
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setShowStatusDropdown(!showStatusDropdown)
              }}
              className="hover:opacity-80 transition-opacity"
            >
              <StatusBadge status={rock.status} size="sm" />
            </button>
            <span className="text-sm font-medium text-white">{rock.progress}%</span>

            {/* Status Dropdown */}
            {showStatusDropdown && (
              <div className="absolute top-full left-0 mt-1 w-40 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-20">
                {(['not_started', 'in_progress', 'on_track', 'at_risk', 'complete'] as RockStatus[]).map((status) => (
                  <button
                    key={status}
                    onClick={(e) => handleStatusClick(e, status)}
                    className={`w-full px-3 py-2 text-xs text-left transition-colors ${
                      rock.status === status
                        ? 'bg-gray-700 text-white'
                        : 'text-gray-300 hover:bg-gray-700'
                    } ${status === 'not_started' ? 'rounded-t-lg' : ''} ${status === 'complete' ? 'rounded-b-lg' : ''}`}
                  >
                    {status.replace('_', ' ')}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-3 text-xs text-gray-400 mb-2">
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {rockSubRocks.length} sub
            </span>
            <span className="flex items-center gap-1">
              <CheckSquare className="w-3 h-3" />
              {rockTasks.length} tasks
            </span>
          </div>

          {/* Due Date */}
          {rock.targetDate && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Calendar className="w-3 h-3" />
              <span>Due: {format(new Date(rock.targetDate), 'MMM d, yyyy')}</span>
            </div>
          )}
        </div>
      </Link>
    )
  }

  // List view
  return (
    <Link href={`/rocks/${rock.id}`}>
      <div
        className="bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-gray-700 transition-all cursor-pointer group flex items-center gap-4"
        onClick={handleCardClick}
      >
        {/* Icon */}
        <span className="text-2xl flex-shrink-0">{rock.icon}</span>

        {/* Name and Category */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-white truncate">{rock.name}</h3>
          {rock.category && (
            <p className="text-xs text-gray-500 truncate">{rock.category}</p>
          )}
        </div>

        {/* Status */}
        <div className="flex-shrink-0 relative" ref={dropdownRef}>
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setShowStatusDropdown(!showStatusDropdown)
            }}
            className="hover:opacity-80 transition-opacity"
          >
            <StatusBadge status={rock.status} size="sm" />
          </button>

          {showStatusDropdown && (
            <div className="absolute top-full right-0 mt-1 w-40 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-20">
              {(['not_started', 'in_progress', 'on_track', 'at_risk', 'complete'] as RockStatus[]).map((status) => (
                <button
                  key={status}
                  onClick={(e) => handleStatusClick(e, status)}
                  className={`w-full px-3 py-2 text-xs text-left transition-colors ${
                    rock.status === status
                      ? 'bg-gray-700 text-white'
                      : 'text-gray-300 hover:bg-gray-700'
                  } ${status === 'not_started' ? 'rounded-t-lg' : ''} ${status === 'complete' ? 'rounded-b-lg' : ''}`}
                >
                  {status.replace('_', ' ')}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="w-32 flex-shrink-0">
          <ProgressBar progress={rock.progress} height={6} showLabel={true} />
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 text-xs text-gray-400 flex-shrink-0">
          <span className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            {rockSubRocks.length}
          </span>
          <span className="flex items-center gap-1">
            <CheckSquare className="w-3 h-3" />
            {rockTasks.length}
          </span>
        </div>

        {/* Due Date */}
        {rock.targetDate && (
          <div className="flex items-center gap-1 text-xs text-gray-500 flex-shrink-0 w-28">
            <Calendar className="w-3 h-3" />
            <span>{format(new Date(rock.targetDate), 'MMM d')}</span>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" ref={actionsRef}>
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setShowActionsMenu(!showActionsMenu)
            }}
            className="p-1 hover:bg-gray-800 rounded transition-colors relative"
          >
            <MoreVertical className="w-4 h-4 text-gray-400" />

            {showActionsMenu && (
              <div className="absolute right-0 mt-1 w-32 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10">
                <button className="w-full px-3 py-2 text-xs text-left text-gray-300 hover:bg-gray-700 rounded-t-lg">
                  Edit
                </button>
                <button className="w-full px-3 py-2 text-xs text-left text-gray-300 hover:bg-gray-700">
                  Duplicate
                </button>
                <button className="w-full px-3 py-2 text-xs text-left text-red-400 hover:bg-gray-700 rounded-b-lg">
                  Delete
                </button>
              </div>
            )}
          </button>
        </div>
      </div>
    </Link>
  )
}
