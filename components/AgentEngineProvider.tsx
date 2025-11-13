/**
 * AgentEngineProvider
 *
 * Client-side component that wraps the app and runs the agent engine.
 * This allows us to use hooks in a Next.js server-side layout.
 */

'use client'

import { useAgentEngine } from '@/hooks/useAgentEngine'
import type { ReactNode } from 'react'

interface AgentEngineProviderProps {
  children: ReactNode
}

export function AgentEngineProvider({ children }: AgentEngineProviderProps) {
  // Initialize and run the agent engine
  useAgentEngine()

  return <>{children}</>
}
