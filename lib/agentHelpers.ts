/**
 * Agent Helper Functions
 *
 * Utility functions for triggering agent messages based on various
 * system events and conditions.
 */

import { useStore } from './store'
import type { AgentMessage } from './store'

/**
 * Message templates for common agent interactions
 */
export const agentTemplates = {
  // Check-in messages
  rockCheckIn: (rockName: string) =>
    `Hey! Quick check-in - How's the ${rockName} progressing? Any blockers I should know about?`,

  dailyCheckIn: () =>
    `Good morning! Ready to tackle today's priorities? Let me know if you need help planning your day.`,

  afternoonCheckIn: () =>
    `How's your day going? Need any help refocusing on your top priorities?`,

  // Reminder messages
  meetingReminder: (meetingTitle: string, minutesUntil: number) =>
    `Your "${meetingTitle}" meeting starts in ${minutesUntil} minutes. I've pulled up the relevant notes.`,

  taskDueReminder: (taskTitle: string) =>
    `Reminder: "${taskTitle}" is due today. Want to mark it as complete?`,

  standupReminder: (minutesUntil: number) =>
    `Don't forget your team standup in ${minutesUntil} minutes!`,

  // Knowledge gap messages
  missingTasks: (rockName: string) =>
    `I noticed you haven't logged any tasks for the ${rockName} project. Would you like to break down the work?`,

  noEODReport: () =>
    `You haven't logged an EOD report in a few days. Keeping track helps identify patterns and blockers.`,

  unlinkedTasks: (count: number) =>
    `You have ${count} tasks that aren't linked to any Rock. Want to organize them?`,

  // EOD prompts
  eodPrompt: () =>
    `It's ${new Date().getHours()}:${new Date().getMinutes().toString().padStart(2, '0')} - time to wrap up! Would you like to log your EOD report?`,

  eodWithWins: (completedCount: number) =>
    `Great work today! You completed ${completedCount} tasks. Ready to log your EOD report?`,

  // Meeting reminders
  upcomingMeeting: (title: string, time: string) =>
    `Upcoming: "${title}" at ${time}. Need a pre-meeting refresher?`,

  postMeetingFollowup: (title: string) =>
    `How did your "${title}" meeting go? Want to log action items or key decisions?`,

  // Refocus messages
  timeTracking: (currentTask: string, duration: number) =>
    `You've been working on "${currentTask}" for ${duration} minutes. Want to take a break or switch focus?`,

  priorityReminder: (topPriority: string) =>
    `Your top priority today is "${topPriority}". Want to refocus on that?`,

  distractionAlert: (activityName: string) =>
    `You've been on ${activityName} for 45 minutes. Ready to get back to your priorities?`,
}

/**
 * Agent Message Triggers
 *
 * Functions to trigger specific agent behaviors
 */

/**
 * Send a check-in message for a specific rock
 */
export function sendRockCheckIn(rockName: string) {
  const { addAgentMessage } = useStore.getState()
  addAgentMessage({
    type: 'check_in',
    content: agentTemplates.rockCheckIn(rockName),
    dismissed: false,
    responded: false,
    response: null,
  })
}

/**
 * Send a meeting reminder
 */
export function sendMeetingReminder(meetingTitle: string, minutesUntil: number) {
  const { addAgentMessage } = useStore.getState()
  addAgentMessage({
    type: 'meeting_reminder',
    content: agentTemplates.meetingReminder(meetingTitle, minutesUntil),
    dismissed: false,
    responded: false,
    response: null,
  })
}

/**
 * Send an EOD prompt
 */
export function sendEODPrompt(tasksCompleted?: number) {
  const { addAgentMessage } = useStore.getState()
  const content = tasksCompleted
    ? agentTemplates.eodWithWins(tasksCompleted)
    : agentTemplates.eodPrompt()

  addAgentMessage({
    type: 'eod_prompt',
    content,
    dismissed: false,
    responded: false,
    response: null,
  })
}

/**
 * Send a refocus message
 */
export function sendRefocusPrompt(priorityName: string) {
  const { addAgentMessage } = useStore.getState()
  addAgentMessage({
    type: 'refocus',
    content: agentTemplates.priorityReminder(priorityName),
    dismissed: false,
    responded: false,
    response: null,
  })
}

/**
 * Send a knowledge gap message
 */
export function sendKnowledgeGap(rockName: string) {
  const { addAgentMessage } = useStore.getState()
  addAgentMessage({
    type: 'knowledge_gap',
    content: agentTemplates.missingTasks(rockName),
    dismissed: false,
    responded: false,
    response: null,
  })
}

/**
 * Send a generic reminder
 */
export function sendReminder(content: string) {
  const { addAgentMessage } = useStore.getState()
  addAgentMessage({
    type: 'reminder',
    content,
    dismissed: false,
    responded: false,
    response: null,
  })
}

/**
 * Smart Agent Triggers - Contextual message sending
 */

/**
 * Check if it's time to send an EOD prompt (after 5 PM on weekdays)
 */
export function shouldSendEODPrompt(): boolean {
  const now = new Date()
  const hour = now.getHours()
  const day = now.getDay()

  // Weekdays (Monday-Friday), between 5-7 PM
  return day >= 1 && day <= 5 && hour >= 17 && hour < 19
}

/**
 * Check rocks for missing tasks and send knowledge gap messages
 */
export function checkForKnowledgeGaps() {
  const { rocks, tasks, addAgentMessage } = useStore.getState()

  rocks.forEach((rock) => {
    const rockTasks = tasks.filter((t) => t.rockId === rock.id)

    // If rock is not complete but has no tasks
    if (rock.status !== 'complete' && rockTasks.length === 0) {
      addAgentMessage({
        type: 'knowledge_gap',
        content: agentTemplates.missingTasks(rock.name),
        dismissed: false,
        responded: false,
        response: null,
      })
    }
  })
}

/**
 * Send check-in for at-risk rocks
 */
export function checkAtRiskRocks() {
  const { getRocksAtRisk, addAgentMessage } = useStore.getState()
  const atRiskRocks = getRocksAtRisk()

  atRiskRocks.forEach((rock) => {
    addAgentMessage({
      type: 'check_in',
      content: `The "${rock.name}" Rock is marked as at-risk. What can we do to get it back on track?`,
      dismissed: false,
      responded: false,
      response: null,
    })
  })
}

/**
 * Send reminders for upcoming meetings (15 minutes before)
 */
export function checkUpcomingMeetings() {
  const { meetingNotes, agentMessages, addAgentMessage } = useStore.getState()
  const now = new Date()

  meetingNotes.forEach((meeting) => {
    const meetingDate = new Date(meeting.date)
    const minutesUntil = Math.floor(
      (meetingDate.getTime() - now.getTime()) / (1000 * 60)
    )

    // Send reminder 15 minutes before, if not already sent
    if (minutesUntil === 15) {
      const alreadySent = agentMessages.some(
        (msg) =>
          msg.type === 'meeting_reminder' &&
          msg.content.includes(meeting.title) &&
          !msg.dismissed
      )

      if (!alreadySent) {
        sendMeetingReminder(meeting.title, minutesUntil)
      }
    }
  })
}

/**
 * Daily check-in based on time of day
 */
export function sendDailyCheckIn() {
  const { addAgentMessage } = useStore.getState()
  const hour = new Date().getHours()

  let content: string
  if (hour < 12) {
    content = agentTemplates.dailyCheckIn()
  } else {
    content = agentTemplates.afternoonCheckIn()
  }

  addAgentMessage({
    type: 'check_in',
    content,
    dismissed: false,
    responded: false,
    response: null,
  })
}

/**
 * Get count of unread messages
 */
export function getUnreadCount(): number {
  const { agentMessages } = useStore.getState()
  return agentMessages.filter((msg) => !msg.dismissed && !msg.responded).length
}

/**
 * Clear all dismissed messages (cleanup utility)
 */
export function clearDismissedMessages() {
  const { agentMessages } = useStore.getState()
  // This would require a new store action to actually remove dismissed messages
  // For now, they're just filtered out in the UI
  const activeMsgs = agentMessages.filter((msg) => !msg.dismissed)
  return activeMsgs.length
}

/**
 * Analyze rock health and determine if it needs attention
 */
export function analyzeRockHealth(rockId: string): {
  needsAttention: boolean
  reason: string
} {
  const { rocks, tasks, subRocks } = useStore.getState()
  const rock = rocks.find(r => r.id === rockId)

  if (!rock) return { needsAttention: false, reason: '' }

  // Check various health indicators
  const rockTasks = tasks.filter(t => t.rockId === rockId)
  const completedTasks = rockTasks.filter(t => t.status === 'done')

  // Get recent completions (last 7 days)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const recentCompletions = completedTasks.filter(t => {
    if (!t.completedDate) return false
    const completedDate = new Date(t.completedDate)
    return completedDate >= sevenDaysAgo
  })

  // Check 1: Low progress + no recent activity = needs attention
  if (rock.progress < 30 && recentCompletions.length === 0 && rockTasks.length > 0) {
    return {
      needsAttention: true,
      reason: 'low_progress_no_activity'
    }
  }

  // Check 2: At risk status
  if (rock.status === 'at_risk') {
    return {
      needsAttention: true,
      reason: 'at_risk'
    }
  }

  // Check 3: No tasks for non-complete rock (knowledge gap)
  if (rock.status !== 'complete' && rockTasks.length === 0) {
    return {
      needsAttention: true,
      reason: 'no_tasks'
    }
  }

  // Check 4: Target date approaching but low progress
  if (rock.targetDate) {
    const targetDate = new Date(rock.targetDate)
    const now = new Date()
    const daysUntilTarget = Math.floor((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (daysUntilTarget <= 14 && daysUntilTarget > 0 && rock.progress < 50) {
      return {
        needsAttention: true,
        reason: 'deadline_approaching'
      }
    }
  }

  return { needsAttention: false, reason: '' }
}

/**
 * Generate contextual message based on type and context
 */
export function generateContextualMessage(
  type: 'check_in' | 'knowledge_gap' | 'refocus' | 'rock_checkin' | 'morning_checkin',
  context: any
): string {
  switch (type) {
    case 'morning_checkin':
      return `Good morning! It's ${context.dayOfWeek}. Ready to set your top 3 priorities for today?`

    case 'rock_checkin':
      if (context.reason === 'at_risk') {
        return `The "${context.rockName}" Rock is marked as at-risk. What's blocking progress?`
      } else if (context.reason === 'low_progress_no_activity') {
        return `"${context.rockName}" is at ${context.progress}% with no recent activity. Need help breaking down the work?`
      } else if (context.reason === 'deadline_approaching') {
        return `"${context.rockName}" deadline is coming up soon and progress is at ${context.progress}%. What can we do to accelerate?`
      } else if (context.reason === 'no_tasks') {
        return `I noticed "${context.rockName}" doesn't have any tasks yet. Want to break it down into actionable steps?`
      }
      return `How's "${context.rockName}" going? Any blockers?`

    case 'refocus':
      if (context.hasFocus && context.topPriority) {
        return `Your top priority today is "${context.topPriority}". Ready to refocus on it?`
      } else if (context.tasksDueCount > 0) {
        return `You have ${context.tasksDueCount} tasks due today. Want to prioritize them?`
      }
      return `No recent activity in the last few hours. Ready to refocus on your priorities?`

    case 'knowledge_gap':
      return `I noticed some gaps in "${context.rockName}". What information or resources would help you make progress?`

    default:
      return 'Quick check-in: How can I help you today?'
  }
}

/**
 * Detect patterns in user behavior
 */
export function detectPatterns(): {
  mostProductiveTime: string
  favoriteRocks: string[]
  averageTasksPerDay: number
  commonBlockers: string[]
} {
  const { tasks, eodReports, rocks } = useStore.getState()

  // Analyze task completion times
  const completionHours: Record<number, number> = {}
  tasks.forEach(task => {
    if (task.status === 'done' && task.completedDate) {
      const hour = new Date(task.completedDate).getHours()
      completionHours[hour] = (completionHours[hour] || 0) + 1
    }
  })

  const mostProductiveHour = Object.entries(completionHours).sort((a, b) => b[1] - a[1])[0]
  const mostProductiveTime = mostProductiveHour
    ? `${mostProductiveHour[0]}:00 - ${Number(mostProductiveHour[0]) + 1}:00`
    : 'Not enough data'

  // Find favorite rocks (most tasks completed)
  const rockTaskCounts: Record<string, number> = {}
  tasks.forEach(task => {
    if (task.rockId && task.status === 'done') {
      rockTaskCounts[task.rockId] = (rockTaskCounts[task.rockId] || 0) + 1
    }
  })

  const favoriteRockIds = Object.entries(rockTaskCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([rockId]) => rockId)

  const favoriteRocks = favoriteRockIds
    .map(id => rocks.find(r => r.id === id)?.name)
    .filter(Boolean) as string[]

  // Calculate average tasks per day
  const completedTasks = tasks.filter(t => t.status === 'done' && t.completedDate)
  const daysTracked = eodReports.length > 0 ? eodReports.length : 1
  const averageTasksPerDay = Math.round(completedTasks.length / daysTracked)

  // Extract common blockers from EOD reports
  const blockers: string[] = []
  eodReports.forEach(report => {
    blockers.push(...report.blockers)
  })

  // Find most common blockers
  const blockerCounts: Record<string, number> = {}
  blockers.forEach(blocker => {
    const normalized = blocker.toLowerCase().trim()
    blockerCounts[normalized] = (blockerCounts[normalized] || 0) + 1
  })

  const commonBlockers = Object.entries(blockerCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([blocker]) => blocker)

  return {
    mostProductiveTime,
    favoriteRocks,
    averageTasksPerDay,
    commonBlockers,
  }
}
