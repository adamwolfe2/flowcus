/**
 * Agent Engine - Core Logic
 *
 * Intelligent agent system that proactively sends messages based on context and time.
 * The agent analyzes user patterns, rock health, and work habits to provide helpful,
 * non-intrusive assistance.
 */

import { useStore } from './store'
import {
  sendRockCheckIn,
  sendMeetingReminder,
  sendEODPrompt,
  sendRefocusPrompt,
  sendKnowledgeGap,
  analyzeRockHealth,
  detectPatterns,
  generateContextualMessage,
} from './agentHelpers'

/**
 * Main engine function - runs all checks
 * Called periodically by the useAgentEngine hook
 */
export function runAgentEngine() {
  const store = useStore.getState()

  // Only run during reasonable hours (8am - 9pm)
  if (!isReasonableHour()) {
    return
  }

  // Run all checks
  checkMorningCheckIn()
  checkEODReminder()
  checkMeetingReminders()
  checkRockProgress()
  checkKnowledgeGaps()
  checkIdleTime()

  // Clean up old messages (older than 24 hours)
  cleanupOldMessages()
}

/**
 * Check if it's a reasonable hour to send messages
 * Don't disturb before 8am or after 9pm
 */
function isReasonableHour(): boolean {
  const hour = new Date().getHours()
  return hour >= 8 && hour < 21
}

/**
 * Check if it's time for morning check-in
 * Sends between 8-9am if no daily focus set
 * Only once per day
 */
function checkMorningCheckIn() {
  const now = new Date()
  const hour = now.getHours()
  const day = now.getDay()

  // Skip weekends
  if (day === 0 || day === 6) return

  // Only between 8-9am
  if (hour < 8 || hour >= 9) return

  // Check if already sent today
  if (!shouldSendMessage('morning_checkin', 'daily', 24)) return

  // Check if user already has today's focus
  const store = useStore.getState()
  const todaysFocus = store.getTodaysFocus()

  if (!todaysFocus) {
    const content = generateContextualMessage('morning_checkin', {
      dayOfWeek: now.toLocaleDateString('en-US', { weekday: 'long' })
    })

    store.addAgentMessage({
      type: 'check_in',
      content,
      dismissed: false,
      responded: false,
      response: null,
    })

    recordMessageSent('morning_checkin', 'daily')
  }
}

/**
 * Check if it's time for EOD reminder
 * Sends after 5pm if no EOD report today
 * Only once per day
 */
function checkEODReminder() {
  const now = new Date()
  const hour = now.getHours()
  const day = now.getDay()

  // Skip weekends
  if (day === 0 || day === 6) return

  // Only after 5pm
  if (hour < 17) return

  // Check if already sent today
  if (!shouldSendMessage('eod_reminder', 'daily', 24)) return

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
    recordMessageSent('eod_reminder', 'daily')
  }
}

/**
 * Check for upcoming meetings
 * Sends reminder 30 minutes before meeting
 * Only once per meeting
 */
function checkMeetingReminders() {
  const store = useStore.getState()
  const now = new Date()

  store.meetingNotes.forEach((meeting) => {
    const meetingDate = new Date(meeting.date)
    const minutesUntil = Math.floor(
      (meetingDate.getTime() - now.getTime()) / (1000 * 60)
    )

    // Send reminder 30 minutes before
    if (minutesUntil > 25 && minutesUntil <= 30) {
      const messageKey = `meeting_${meeting.id}`

      if (shouldSendMessage('meeting_reminder', messageKey, 24)) {
        sendMeetingReminder(meeting.title, minutesUntil)
        recordMessageSent('meeting_reminder', messageKey)
      }
    }
  })
}

/**
 * Check rock progress and health
 * Sends check-in for rocks that need attention
 * Max once per week per rock
 */
function checkRockProgress() {
  const store = useStore.getState()
  const now = new Date()
  const day = now.getDay()

  // Only check on weekdays
  if (day === 0 || day === 6) return

  // Only check at specific times to avoid spam
  const hour = now.getHours()
  if (hour !== 10 && hour !== 14) return

  store.rocks.forEach((rock) => {
    // Skip completed rocks
    if (rock.status === 'complete') return

    const messageKey = `rock_progress_${rock.id}`

    // Max once per week per rock
    if (!shouldSendMessage('rock_checkin', messageKey, 7 * 24)) return

    const health = analyzeRockHealth(rock.id)

    if (health.needsAttention) {
      const content = generateContextualMessage('rock_checkin', {
        rockName: rock.name,
        reason: health.reason,
        progress: rock.progress,
      })

      store.addAgentMessage({
        type: 'check_in',
        content,
        dismissed: false,
        responded: false,
        response: null,
      })

      recordMessageSent('rock_checkin', messageKey)
    }
  })
}

/**
 * Check for knowledge gaps
 * Analyzes rocks with low progress and no recent activity
 * Max once per week total
 */
function checkKnowledgeGaps() {
  const now = new Date()
  const day = now.getDay()
  const hour = now.getHours()

  // Skip weekends
  if (day === 0 || day === 6) return

  // Only check once per day at 11am
  if (hour !== 11) return

  // Max once per week
  if (!shouldSendMessage('knowledge_gap', 'global', 7 * 24)) return

  const store = useStore.getState()

  // Find rocks with low progress and no tasks
  const problematicRocks = store.rocks.filter(rock => {
    if (rock.status === 'complete') return false

    const rockTasks = store.tasks.filter(t => t.rockId === rock.id)
    const hasNoTasks = rockTasks.length === 0
    const hasLowProgress = rock.progress < 30

    return hasNoTasks || (hasLowProgress && rock.status === 'not_started')
  })

  if (problematicRocks.length > 0) {
    // Pick the most recently updated one to ask about
    const rockToAskAbout = problematicRocks.sort((a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )[0]

    sendKnowledgeGap(rockToAskAbout.name)
    recordMessageSent('knowledge_gap', 'global')
  }
}

/**
 * Check for idle time
 * Sends refocus prompt if no tasks completed in last 4 hours
 * Max once per day
 */
function checkIdleTime() {
  const now = new Date()
  const hour = now.getHours()
  const day = now.getDay()

  // Skip weekends
  if (day === 0 || day === 6) return

  // Only during work hours (10am-6pm)
  if (hour < 10 || hour >= 18) return

  // Only check at specific times
  if (hour !== 14 && hour !== 16) return

  // Max once per day
  if (!shouldSendMessage('idle_time', 'daily', 24)) return

  const store = useStore.getState()
  const fourHoursAgo = new Date(now.getTime() - 4 * 60 * 60 * 1000)

  // Check for recent task completions
  const recentCompletions = store.tasks.filter(t => {
    if (t.status !== 'done' || !t.completedDate) return false
    const completedDate = new Date(t.completedDate)
    return completedDate >= fourHoursAgo
  })

  if (recentCompletions.length === 0) {
    const todaysFocus = store.getTodaysFocus()
    const tasksDueToday = store.getTasksDueToday()

    const content = generateContextualMessage('refocus', {
      hasFocus: !!todaysFocus,
      tasksDueCount: tasksDueToday.length,
      topPriority: todaysFocus?.priority1,
    })

    store.addAgentMessage({
      type: 'refocus',
      content,
      dismissed: false,
      responded: false,
      response: null,
    })

    recordMessageSent('idle_time', 'daily')
  }
}

/**
 * Clean up old messages
 * Remove dismissed messages older than 24 hours
 */
function cleanupOldMessages() {
  const store = useStore.getState()
  const now = new Date()
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

  // Filter out old dismissed messages
  // This would ideally be a new store action, but for now we just track them
  const activeMessages = store.agentMessages.filter(msg => {
    if (!msg.dismissed) return true
    const msgDate = new Date(msg.timestamp)
    return msgDate >= oneDayAgo
  })

  // In a production system, we'd have a cleanup action in the store
  // For now, this serves as documentation of the desired behavior
}

/**
 * Helper to prevent message spam
 * Checks if similar message was sent recently
 * Uses localStorage to track last sent times
 */
function shouldSendMessage(
  type: string,
  key: string,
  cooldownHours: number
): boolean {
  const storageKey = `flowcus_agent_${type}_${key}`
  const lastSent = localStorage.getItem(storageKey)

  if (!lastSent) return true

  const lastSentTime = new Date(lastSent)
  const now = new Date()
  const hoursSince = (now.getTime() - lastSentTime.getTime()) / (1000 * 60 * 60)

  return hoursSince >= cooldownHours
}

/**
 * Record that a message was sent
 * Used for cooldown tracking
 */
function recordMessageSent(type: string, key: string) {
  const storageKey = `flowcus_agent_${type}_${key}`
  localStorage.setItem(storageKey, new Date().toISOString())
}

/**
 * Get agent statistics
 * Useful for debugging and monitoring
 */
export function getAgentStats() {
  const store = useStore.getState()

  return {
    totalMessages: store.agentMessages.length,
    unreadMessages: store.agentMessages.filter(m => !m.dismissed && !m.responded).length,
    respondedMessages: store.agentMessages.filter(m => m.responded).length,
    dismissedMessages: store.agentMessages.filter(m => m.dismissed).length,
    messageTypes: store.agentMessages.reduce((acc, msg) => {
      acc[msg.type] = (acc[msg.type] || 0) + 1
      return acc
    }, {} as Record<string, number>),
  }
}
