'use client'

import { useState } from 'react'
import AgentChat from './AgentChat'
import AgentTrigger from './AgentTrigger'

/**
 * AgentWidget - Combined component that manages the agent chat UI state
 *
 * This component handles the open/closed state and coordinates between
 * the floating trigger button and the chat window.
 *
 * Usage:
 * ```tsx
 * import AgentWidget from '@/components/agent/AgentWidget'
 *
 * export default function App() {
 *   return (
 *     <div>
 *       <YourContent />
 *       <AgentWidget />
 *     </div>
 *   )
 * }
 * ```
 */
export default function AgentWidget() {
  const [isOpen, setIsOpen] = useState(false)

  const handleOpen = () => setIsOpen(true)
  const handleClose = () => setIsOpen(false)
  const handleMinimize = () => setIsOpen(false)

  return (
    <>
      <AgentTrigger
        onClick={handleOpen}
        isOpen={isOpen}
      />
      <AgentChat
        isOpen={isOpen}
        onClose={handleClose}
        onMinimize={handleMinimize}
      />
    </>
  )
}
