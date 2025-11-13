'use client'

import { Bot } from 'lucide-react'
import { useStore } from '@/lib/store'
import { useState, useEffect } from 'react'

interface AgentTriggerProps {
  onClick: () => void
  isOpen: boolean
}

export default function AgentTrigger({ onClick, isOpen }: AgentTriggerProps) {
  const { agentMessages } = useStore()
  const [pulse, setPulse] = useState(false)

  // Calculate unread messages (non-dismissed, non-responded)
  const unreadCount = agentMessages.filter(
    (msg) => !msg.dismissed && !msg.responded
  ).length

  // Trigger pulse animation when new messages arrive
  useEffect(() => {
    if (unreadCount > 0 && !isOpen) {
      setPulse(true)
      const timer = setTimeout(() => setPulse(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [unreadCount, isOpen])

  // Don't show trigger if chat is open
  if (isOpen) return null

  return (
    <button
      onClick={onClick}
      className={`
        fixed bottom-6 right-6 z-40
        w-14 h-14 rounded-full
        bg-gradient-to-br from-indigo-600 to-purple-600
        hover:from-indigo-500 hover:to-purple-500
        shadow-lg hover:shadow-xl
        flex items-center justify-center
        transition-all duration-300
        ${pulse ? 'animate-pulse' : ''}
      `}
      aria-label="Open Flowcus Agent"
    >
      <Bot className="w-6 h-6 text-white" />

      {unreadCount > 0 && (
        <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center animate-bounce">
          <span className="text-xs font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        </div>
      )}

      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
        .animate-pulse {
          animation: pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-4px);
          }
        }
        .animate-bounce {
          animation: bounce 1s infinite;
        }
      `}</style>
    </button>
  )
}
