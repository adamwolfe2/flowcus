/**
 * Agent Scheduler - Time-based Triggers
 *
 * Schedule-based triggers that run at specific times of day or days of week.
 * Coordinates with the main agent engine to provide timely reminders and check-ins.
 */

import { useStore } from './store'
import { sendEODPrompt, sendRefocusPrompt, generateContextualMessage } from './agentHelpers'

export type ScheduledTrigger = {
  id: string
  time: string // HH:MM format (24h)
  days: number[] // 0-6 (Sunday-Saturday)
  action: () => void
  enabled: boolean
  description: string
}

/**
 * Define all scheduled triggers
 */
const scheduledTriggers: ScheduledTrigger[] = [
  {
    id: 'morning-checkin',
    time: '08:00',
    days: [1, 2, 3, 4, 5], // Monday-Friday
    description: 'Morning check-in to set daily priorities',
    action: () => {
      const store = useStore.getState()
      const todaysFocus = store.getTodaysFocus()

      if (!todaysFocus) {
        const content = generateContextualMessage('morning_checkin', {
          dayOfWeek: new Date().toLocaleDateString('en-US', { weekday: 'long' })
        })

        store.addAgentMessage({
          type: 'check_in',
          content,
          dismissed: false,
          responded: false,
          response: null,
        })
      }
    },
    enabled: true
  },
  {
    id: 'eod-reminder',
    time: '17:00',
    days: [1, 2, 3, 4, 5], // Monday-Friday
    description: 'End of day reminder to log progress',
    action: () => {
      const store = useStore.getState()
      const today = new Date().toISOString().split('T')[0]
      const todaysEOD = store.eodReports.find(r => r.date === today)

      if (!todaysEOD) {
        // Count tasks completed today
        const tasksCompletedToday = store.tasks.filter(t => {
          if (t.status !== 'done' || !t.completedDate) return false
          const completedDate = new Date(t.completedDate).toISOString().split('T')[0]
          return completedDate === today
        }).length

        sendEODPrompt(tasksCompletedToday > 0 ? tasksCompletedToday : undefined)
      }
    },
    enabled: true
  },
  {
    id: 'afternoon-checkin',
    time: '14:00',
    days: [1, 2, 3, 4, 5], // Monday-Friday
    description: 'Afternoon progress check',
    action: () => {
      const store = useStore.getState()
      const tasksDueToday = store.getTasksDueToday()
      const today = new Date().toISOString().split('T')[0]

      const completedToday = store.tasks.filter(t => {
        if (t.status !== 'done' || !t.completedDate) return false
        const completedDate = new Date(t.completedDate).toISOString().split('T')[0]
        return completedDate === today
      })

      const allTasksToday = store.tasks.filter(t => {
        if (!t.dueDate) return false
        return t.dueDate === today
      })

      const progress = allTasksToday.length > 0
        ? (completedToday.length / allTasksToday.length) * 100
        : 100

      // Only send if progress is low
      if (progress < 30 && tasksDueToday.length > 0) {
        const content = `You have ${tasksDueToday.length} tasks left today. Need help prioritizing?`
        sendRefocusPrompt(content)
      }
    },
    enabled: true
  },
  {
    id: 'midmorning-focus',
    time: '10:30',
    days: [1, 2, 3, 4, 5], // Monday-Friday
    description: 'Mid-morning focus check',
    action: () => {
      const store = useStore.getState()
      const todaysFocus = store.getTodaysFocus()

      // Only send if user has set priorities but hasn't completed any yet
      if (todaysFocus && !todaysFocus.priority1Completed) {
        const today = new Date().toISOString().split('T')[0]
        const completedToday = store.tasks.filter(t => {
          if (t.status !== 'done' || !t.completedDate) return false
          const completedDate = new Date(t.completedDate).toISOString().split('T')[0]
          return completedDate === today
        })

        if (completedToday.length === 0) {
          store.addAgentMessage({
            type: 'refocus',
            content: `Your top priority today is "${todaysFocus.priority1}". Ready to tackle it?`,
            dismissed: false,
            responded: false,
            response: null,
          })
        }
      }
    },
    enabled: true
  },
  {
    id: 'weekly-review-reminder',
    time: '09:00',
    days: [1], // Monday only
    description: 'Weekly review reminder',
    action: () => {
      const store = useStore.getState()
      const lastWeek = new Date()
      lastWeek.setDate(lastWeek.getDate() - 7)
      const lastWeekStr = lastWeek.toISOString().split('T')[0]

      const lastWeekEODs = store.eodReports.filter(r => r.date >= lastWeekStr)
      const rocksAtRisk = store.getRocksAtRisk()

      if (lastWeekEODs.length < 3 || rocksAtRisk.length > 0) {
        store.addAgentMessage({
          type: 'check_in',
          content: `Start of a new week! ${rocksAtRisk.length > 0 ? `You have ${rocksAtRisk.length} rocks at risk. ` : ''}Want to review your priorities?`,
          dismissed: false,
          responded: false,
          response: null,
        })
      }
    },
    enabled: true
  },
]

/**
 * Run scheduled triggers
 * Should be called every minute to check for trigger times
 */
export function runScheduledTriggers() {
  const now = new Date()
  const currentTime = now.toTimeString().slice(0, 5) // HH:MM
  const currentDay = now.getDay()

  scheduledTriggers.forEach(trigger => {
    if (!trigger.enabled) return
    if (trigger.time !== currentTime) return
    if (!trigger.days.includes(currentDay)) return

    // Check if already ran today (prevent duplicates if called multiple times)
    const lastRun = getLastRunTime(trigger.id)
    const today = now.toDateString()

    if (lastRun === today) return

    try {
      // Run the action
      trigger.action()

      // Record that it ran
      setLastRunTime(trigger.id, today)
    } catch (error) {
      console.error(`Error running scheduled trigger ${trigger.id}:`, error)
    }
  })
}

/**
 * Get last run time for a trigger
 */
function getLastRunTime(triggerId: string): string | null {
  const key = `flowcus_scheduler_${triggerId}_last_run`
  return localStorage.getItem(key)
}

/**
 * Set last run time for a trigger
 */
function setLastRunTime(triggerId: string, timestamp: string) {
  const key = `flowcus_scheduler_${triggerId}_last_run`
  localStorage.setItem(key, timestamp)
}

/**
 * Enable or disable a trigger
 */
export function setTriggerEnabled(triggerId: string, enabled: boolean) {
  const trigger = scheduledTriggers.find(t => t.id === triggerId)
  if (trigger) {
    trigger.enabled = enabled
  }
}

/**
 * Get all triggers (for UI/debugging)
 */
export function getAllTriggers(): ScheduledTrigger[] {
  return scheduledTriggers
}

/**
 * Get next scheduled run for a trigger
 */
export function getNextRun(triggerId: string): Date | null {
  const trigger = scheduledTriggers.find(t => t.id === triggerId)
  if (!trigger || !trigger.enabled) return null

  const now = new Date()
  const [hours, minutes] = trigger.time.split(':').map(Number)

  // Find next occurrence
  for (let daysAhead = 0; daysAhead <= 7; daysAhead++) {
    const candidate = new Date(now)
    candidate.setDate(candidate.getDate() + daysAhead)
    candidate.setHours(hours, minutes, 0, 0)

    const candidateDay = candidate.getDay()

    // If it's in the future and on a valid day
    if (candidate > now && trigger.days.includes(candidateDay)) {
      return candidate
    }
  }

  return null
}

/**
 * Get scheduler statistics
 */
export function getSchedulerStats() {
  const now = new Date()

  return {
    totalTriggers: scheduledTriggers.length,
    enabledTriggers: scheduledTriggers.filter(t => t.enabled).length,
    disabledTriggers: scheduledTriggers.filter(t => !t.enabled).length,
    upcomingToday: scheduledTriggers.filter(t => {
      if (!t.enabled) return false
      const [hours] = t.time.split(':').map(Number)
      return t.days.includes(now.getDay()) && hours > now.getHours()
    }).length,
  }
}
