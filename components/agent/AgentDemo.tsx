'use client'

import { useStore } from '@/lib/store'
import AgentWidget from './AgentWidget'

/**
 * AgentDemo - Demo component with test message buttons
 *
 * This component includes the AgentWidget plus buttons to trigger
 * sample messages for testing the UI.
 *
 * Usage:
 * ```tsx
 * import AgentDemo from '@/components/agent/AgentDemo'
 *
 * export default function TestPage() {
 *   return <AgentDemo />
 * }
 * ```
 */
export default function AgentDemo() {
  const { addAgentMessage } = useStore()

  const sampleMessages = {
    check_in: "Hey! Quick check-in - How's the Lead Gen Rock progressing? Any blockers I should know about?",
    reminder: "Don't forget your team standup in 15 minutes!",
    knowledge_gap: "I noticed you haven't logged any tasks for the Sales Dashboard project. Would you like to break down the work?",
    eod_prompt: "It's 5:30 PM - time to wrap up! Would you like to log your EOD report?",
    meeting_reminder: "Your 1-on-1 with Sarah starts in 10 minutes. I've pulled up the relevant notes.",
    refocus: "You've been working on email for 45 minutes. Want to get back to your top priority: Lead Gen Rock?",
  }

  const handleAddMessage = (type: keyof typeof sampleMessages) => {
    addAgentMessage({
      type,
      content: sampleMessages[type],
      dismissed: false,
      responded: false,
      response: null,
    })
  }

  return (
    <>
      {/* Test Controls - Remove in production */}
      <div className="fixed top-4 left-4 z-50 bg-gray-900 border border-gray-800 rounded-lg p-4 max-w-xs">
        <h3 className="text-sm font-semibold text-white mb-3">Agent Test Controls</h3>
        <div className="space-y-2">
          <button
            onClick={() => handleAddMessage('check_in')}
            className="w-full px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white text-xs rounded transition-colors text-left"
          >
            👋 Send Check-in
          </button>
          <button
            onClick={() => handleAddMessage('reminder')}
            className="w-full px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white text-xs rounded transition-colors text-left"
          >
            ⏰ Send Reminder
          </button>
          <button
            onClick={() => handleAddMessage('knowledge_gap')}
            className="w-full px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white text-xs rounded transition-colors text-left"
          >
            💭 Send Knowledge Gap
          </button>
          <button
            onClick={() => handleAddMessage('eod_prompt')}
            className="w-full px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white text-xs rounded transition-colors text-left"
          >
            📝 Send EOD Prompt
          </button>
          <button
            onClick={() => handleAddMessage('meeting_reminder')}
            className="w-full px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white text-xs rounded transition-colors text-left"
          >
            📅 Send Meeting Reminder
          </button>
          <button
            onClick={() => handleAddMessage('refocus')}
            className="w-full px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white text-xs rounded transition-colors text-left"
          >
            🎯 Send Refocus
          </button>
        </div>
      </div>

      {/* Agent Widget */}
      <AgentWidget />
    </>
  )
}
