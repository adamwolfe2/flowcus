'use client'

import { Plus, Home, Network, List, Target, BookOpen, ClipboardCheck, Users } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface SidebarProps {
  onCreateProject: () => void
  onCreateTask: () => void
}

export default function Sidebar({ onCreateProject, onCreateTask }: SidebarProps) {
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  return (
    <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <Link href="/" className="block">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Network className="w-6 h-6 text-indigo-500" />
            <span className="bg-gradient-to-r from-indigo-500 to-purple-500 text-transparent bg-clip-text">
              Flowcus
            </span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">Your Neural Network Dashboard</p>
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <div className="space-y-1">
          <Link
            href="/"
            className={`w-full px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
              isActive('/')
                ? 'bg-indigo-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="font-medium">Dashboard</span>
          </Link>

          <Link
            href="/canvas"
            className={`w-full px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
              isActive('/canvas')
                ? 'bg-indigo-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            <Network className="w-5 h-5" />
            <span className="font-medium">Canvas</span>
          </Link>

          <Link
            href="/daily"
            className={`w-full px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
              isActive('/daily')
                ? 'bg-indigo-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            <List className="w-5 h-5" />
            <span className="font-medium">Daily Workspace</span>
          </Link>

          <Link
            href="/rocks"
            className={`w-full px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
              isActive('/rocks')
                ? 'bg-indigo-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            <Target className="w-5 h-5" />
            <span className="font-medium">Rocks</span>
          </Link>
        </div>
      </nav>

      {/* Quick Actions */}
      <div className="p-4 border-t border-gray-800 space-y-2">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Quick Actions
        </div>

        <Link
          href="/journal"
          className={`w-full px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm ${
            isActive('/journal')
              ? 'bg-gray-700 text-white'
              : 'bg-gray-800 hover:bg-gray-700 text-white'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Journal
        </Link>

        <Link
          href="/eod"
          className={`w-full px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm ${
            isActive('/eod')
              ? 'bg-gray-700 text-white'
              : 'bg-gray-800 hover:bg-gray-700 text-white'
          }`}
        >
          <ClipboardCheck className="w-4 h-4" />
          EOD Report
        </Link>

        <Link
          href="/meetings"
          className={`w-full px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm ${
            isActive('/meetings')
              ? 'bg-gray-700 text-white'
              : 'bg-gray-800 hover:bg-gray-700 text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          Meetings
        </Link>

        <div className="pt-2 space-y-2">
          <button
            onClick={onCreateTask}
            className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center justify-center gap-2 transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            New Task
          </button>

          <button
            onClick={onCreateProject}
            className="w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg flex items-center justify-center gap-2 transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            New Project
          </button>
        </div>
      </div>
    </div>
  )
}
