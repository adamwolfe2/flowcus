'use client'

import TodaysFocus from '@/components/dashboard/TodaysFocus'
import QuickStats from '@/components/dashboard/QuickStats'
import ActivityFeed from '@/components/dashboard/ActivityFeed'
import AgentWidget from '@/components/agent'
import Link from 'next/link'
import { Network, List } from 'lucide-react'

export default function Home() {
  const currentHour = new Date().getHours()
  const greeting =
    currentHour < 12 ? 'Good morning' :
    currentHour < 17 ? 'Good afternoon' :
    'Good evening'

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="p-8 max-w-7xl mx-auto">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              {greeting}! <span className="wave">👋</span>
            </h1>
            <p className="text-gray-400">Welcome to your Flowcus dashboard</p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/canvas"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <Network className="w-4 h-4" />
              Canvas View
            </Link>
            <Link
              href="/rocks"
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <List className="w-4 h-4" />
              All Rocks
            </Link>
          </div>
        </div>

        <TodaysFocus />

        <QuickStats />

        <ActivityFeed />
      </div>

      {/* AI Agent Chat Interface */}
      <AgentWidget />

      <style jsx>{`
        .wave {
          animation: wave 1s ease-in-out;
          display: inline-block;
        }

        @keyframes wave {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(20deg); }
          75% { transform: rotate(-20deg); }
        }
      `}</style>
    </div>
  )
}
