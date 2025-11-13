/**
 * useAgentEngine Hook
 *
 * React hook that runs the agent engine on a regular interval.
 * Integrates both the main agent engine and scheduled triggers.
 */

'use client'

import { useEffect } from 'react'
import { runAgentEngine } from '@/lib/agentEngine'
import { runScheduledTriggers } from '@/lib/agentScheduler'

/**
 * Main agent engine hook
 * Run this in your app layout or main dashboard
 */
export function useAgentEngine() {
  useEffect(() => {
    // Run immediately on mount
    try {
      runAgentEngine()
    } catch (error) {
      console.error('Error running agent engine on mount:', error)
    }

    // Run agent engine every 5 minutes
    const engineInterval = setInterval(() => {
      try {
        runAgentEngine()
      } catch (error) {
        console.error('Error running agent engine:', error)
      }
    }, 5 * 60 * 1000) // 5 minutes

    // Run scheduled triggers every minute (for time-based checks)
    const schedulerInterval = setInterval(() => {
      try {
        runScheduledTriggers()
      } catch (error) {
        console.error('Error running scheduled triggers:', error)
      }
    }, 60 * 1000) // 1 minute

    // Cleanup intervals on unmount
    return () => {
      clearInterval(engineInterval)
      clearInterval(schedulerInterval)
    }
  }, [])
}

/**
 * Hook for debugging - provides agent stats
 */
export function useAgentStats() {
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    const updateStats = async () => {
      try {
        const { getAgentStats } = await import('@/lib/agentEngine')
        const { getSchedulerStats } = await import('@/lib/agentScheduler')

        setStats({
          engine: getAgentStats(),
          scheduler: getSchedulerStats(),
        })
      } catch (error) {
        console.error('Error fetching agent stats:', error)
      }
    }

    updateStats()

    // Update stats every 30 seconds
    const interval = setInterval(updateStats, 30 * 1000)

    return () => clearInterval(interval)
  }, [])

  return stats
}

// Import useState for useAgentStats
import { useState } from 'react'
