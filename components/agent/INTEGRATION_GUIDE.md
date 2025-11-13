# Agent Integration Guide

Complete guide for integrating the Flowcus Agent into your workflow.

## Table of Contents

1. [Quick Setup](#quick-setup)
2. [Triggering Messages](#triggering-messages)
3. [Automated Workflows](#automated-workflows)
4. [Advanced Patterns](#advanced-patterns)
5. [Best Practices](#best-practices)

## Quick Setup

### 1. Add Agent Widget to Your App

```tsx
// app/page.tsx or your main layout
import AgentWidget from '@/components/agent'

export default function App() {
  return (
    <div>
      <YourContent />
      <AgentWidget />
    </div>
  )
}
```

That's it! The agent is now active.

### 2. Send Your First Message

```tsx
import { useStore } from '@/lib/store'

function MyComponent() {
  const { addAgentMessage } = useStore()

  const sendWelcome = () => {
    addAgentMessage({
      type: 'check_in',
      content: 'Welcome to Flowcus! How can I help you today?',
      dismissed: false,
      responded: false,
      response: null,
    })
  }

  return <button onClick={sendWelcome}>Say Hi</button>
}
```

## Triggering Messages

### Using Helper Functions

Import pre-made helpers for common scenarios:

```tsx
import {
  sendRockCheckIn,
  sendMeetingReminder,
  sendEODPrompt,
  sendRefocusPrompt,
  sendKnowledgeGap,
  sendReminder,
} from '@/lib/agentHelpers'

// Rock check-in
sendRockCheckIn('Lead Generation')

// Meeting in 15 minutes
sendMeetingReminder('Weekly Standup', 15)

// End of day
sendEODPrompt(5) // 5 tasks completed

// Refocus on priority
sendRefocusPrompt('Complete Sales Dashboard')

// Knowledge gap detected
sendKnowledgeGap('Marketing Campaign')

// Generic reminder
sendReminder('Don\'t forget to review PRs')
```

### Using Custom Messages

For complete control:

```tsx
import { useStore } from '@/lib/store'

const { addAgentMessage } = useStore.getState()

addAgentMessage({
  type: 'check_in', // or 'reminder', 'knowledge_gap', etc.
  content: 'Your custom message here',
  dismissed: false,
  responded: false,
  response: null,
})
```

## Automated Workflows

### 1. Morning Check-in

Trigger a check-in when the user opens the app in the morning:

```tsx
// app/page.tsx
import { useEffect } from 'react'
import { sendDailyCheckIn } from '@/lib/agentHelpers'

export default function Home() {
  useEffect(() => {
    const hour = new Date().getHours()
    const lastCheckIn = localStorage.getItem('lastCheckIn')
    const today = new Date().toDateString()

    // Send morning check-in once per day
    if (hour < 12 && lastCheckIn !== today) {
      setTimeout(() => {
        sendDailyCheckIn()
        localStorage.setItem('lastCheckIn', today)
      }, 2000) // Delay for better UX
    }
  }, [])

  return <YourApp />
}
```

### 2. EOD Report Reminder

Remind users to log their EOD report:

```tsx
import { useEffect } from 'react'
import { shouldSendEODPrompt, sendEODPrompt } from '@/lib/agentHelpers'

export default function EODMonitor() {
  useEffect(() => {
    const checkEOD = () => {
      if (shouldSendEODPrompt()) {
        const lastEOD = localStorage.getItem('lastEODPrompt')
        const today = new Date().toDateString()

        if (lastEOD !== today) {
          sendEODPrompt()
          localStorage.setItem('lastEODPrompt', today)
        }
      }
    }

    // Check every 30 minutes
    const interval = setInterval(checkEOD, 30 * 60 * 1000)
    checkEOD() // Check immediately

    return () => clearInterval(interval)
  }, [])

  return null // This is a monitoring component
}
```

### 3. Meeting Reminders

Monitor calendar and send reminders:

```tsx
import { useEffect } from 'react'
import { checkUpcomingMeetings } from '@/lib/agentHelpers'

export default function MeetingMonitor() {
  useEffect(() => {
    // Check for upcoming meetings every 5 minutes
    const interval = setInterval(() => {
      checkUpcomingMeetings()
    }, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  return null
}
```

### 4. At-Risk Rock Alerts

Weekly check for at-risk projects:

```tsx
import { useEffect } from 'react'
import { checkAtRiskRocks } from '@/lib/agentHelpers'

export default function RockMonitor() {
  useEffect(() => {
    const checkRisks = () => {
      const lastCheck = localStorage.getItem('lastRiskCheck')
      const now = Date.now()
      const oneWeek = 7 * 24 * 60 * 60 * 1000

      if (!lastCheck || now - parseInt(lastCheck) > oneWeek) {
        checkAtRiskRocks()
        localStorage.setItem('lastRiskCheck', now.toString())
      }
    }

    checkRisks()
  }, [])

  return null
}
```

### 5. Knowledge Gap Detection

Check for rocks without tasks:

```tsx
import { useEffect } from 'react'
import { checkForKnowledgeGaps } from '@/lib/agentHelpers'
import { useStore } from '@/lib/store'

export default function KnowledgeGapMonitor() {
  const rocks = useStore((state) => state.rocks)

  useEffect(() => {
    // Check when rocks change
    const timer = setTimeout(() => {
      checkForKnowledgeGaps()
    }, 5000) // Debounce

    return () => clearTimeout(timer)
  }, [rocks])

  return null
}
```

## Advanced Patterns

### Contextual Messages Based on Task Completion

```tsx
import { useStore } from '@/lib/store'
import { sendEODPrompt } from '@/lib/agentHelpers'

// Watch for task completions
useStore.subscribe(
  (state) => state.tasks,
  (tasks) => {
    const completedToday = tasks.filter((t) => {
      const completed = new Date(t.completedDate || '')
      const today = new Date()
      return (
        t.status === 'done' &&
        completed.toDateString() === today.toDateString()
      )
    })

    // Celebrate milestone completions
    if (completedToday.length === 5) {
      const { addAgentMessage } = useStore.getState()
      addAgentMessage({
        type: 'check_in',
        content: '🎉 Great job! You\'ve completed 5 tasks today. Keep it up!',
        dismissed: false,
        responded: false,
        response: null,
      })
    }
  }
)
```

### Smart Refocus Based on Activity

```tsx
import { useEffect, useRef } from 'react'
import { sendRefocusPrompt } from '@/lib/agentHelpers'
import { useStore } from '@/lib/store'

export default function ActivityMonitor() {
  const idleTime = useRef(0)
  const { getTodaysFocus } = useStore()

  useEffect(() => {
    const resetTimer = () => {
      idleTime.current = 0
    }

    const checkIdle = () => {
      idleTime.current += 1

      // After 45 minutes, suggest refocus
      if (idleTime.current === 45) {
        const focus = getTodaysFocus()
        if (focus?.priority1) {
          sendRefocusPrompt(focus.priority1)
        }
      }
    }

    // Track user activity
    window.addEventListener('mousemove', resetTimer)
    window.addEventListener('keypress', resetTimer)

    const interval = setInterval(checkIdle, 60000) // Every minute

    return () => {
      window.removeEventListener('mousemove', resetTimer)
      window.removeEventListener('keypress', resetTimer)
      clearInterval(interval)
    }
  }, [])

  return null
}
```

### Message Sequencing

Chain messages for onboarding or complex workflows:

```tsx
function sendOnboardingSequence() {
  const { addAgentMessage } = useStore.getState()

  // Message 1
  addAgentMessage({
    type: 'check_in',
    content: 'Welcome to Flowcus! 👋 I\'m your AI productivity assistant.',
    dismissed: false,
    responded: false,
    response: null,
  })

  // Message 2 (after 5 seconds)
  setTimeout(() => {
    addAgentMessage({
      type: 'check_in',
      content: 'Let\'s set up your first Rock. What\'s your top priority this quarter?',
      dismissed: false,
      responded: false,
      response: null,
    })
  }, 5000)

  // Message 3 (after 15 seconds)
  setTimeout(() => {
    addAgentMessage({
      type: 'reminder',
      content: 'I\'ll check in throughout the day to keep you on track. You can dismiss or respond to any message.',
      dismissed: false,
      responded: false,
      response: null,
    })
  }, 15000)
}
```

## Best Practices

### 1. Message Frequency

Don't overwhelm users with too many messages:

```tsx
// Track last message time
const canSendMessage = () => {
  const { agentMessages } = useStore.getState()
  if (agentMessages.length === 0) return true

  const lastMessage = agentMessages[agentMessages.length - 1]
  const lastTime = new Date(lastMessage.timestamp)
  const now = new Date()

  // Wait at least 15 minutes between messages
  return now.getTime() - lastTime.getTime() > 15 * 60 * 1000
}

if (canSendMessage()) {
  sendRockCheckIn('Sales Dashboard')
}
```

### 2. Contextual Relevance

Only send messages when they're relevant:

```tsx
// Don't send EOD prompt on weekends
function shouldSendEOD() {
  const day = new Date().getDay()
  return day >= 1 && day <= 5 // Monday-Friday only
}

// Don't send meeting reminders for past meetings
function shouldSendMeetingReminder(meetingDate: Date) {
  return meetingDate > new Date()
}
```

### 3. User Preferences

Respect user preferences (implement in settings):

```tsx
interface AgentPreferences {
  enableCheckIns: boolean
  enableReminders: boolean
  enableEODPrompts: boolean
  quietHoursStart: number // hour (0-23)
  quietHoursEnd: number
}

function isQuietHours(prefs: AgentPreferences): boolean {
  const hour = new Date().getHours()
  return hour >= prefs.quietHoursStart || hour < prefs.quietHoursEnd
}

function sendMessageIfAllowed(type: string, content: string, prefs: AgentPreferences) {
  if (isQuietHours(prefs)) return

  if (type === 'check_in' && !prefs.enableCheckIns) return
  if (type === 'reminder' && !prefs.enableReminders) return
  if (type === 'eod_prompt' && !prefs.enableEODPrompts) return

  const { addAgentMessage } = useStore.getState()
  addAgentMessage({
    type: type as any,
    content,
    dismissed: false,
    responded: false,
    response: null,
  })
}
```

### 4. Progressive Disclosure

Start simple, add features gradually:

```tsx
// Day 1: Welcome only
// Day 2: Add check-ins
// Day 3: Add reminders
// Week 2: Add knowledge gaps
// Week 3: Add refocus prompts

const daysSinceSignup = getDaysSinceSignup()

if (daysSinceSignup >= 1) enableCheckIns()
if (daysSinceSignup >= 2) enableReminders()
if (daysSinceSignup >= 7) enableKnowledgeGaps()
if (daysSinceSignup >= 14) enableRefocus()
```

### 5. Analytics

Track which messages are most effective:

```tsx
// When user responds
useStore.subscribe(
  (state) => state.agentMessages,
  (messages) => {
    messages.forEach((msg) => {
      if (msg.responded && msg.response) {
        // Track engagement
        analytics.track('agent_message_responded', {
          messageType: msg.type,
          responseLength: msg.response.length,
          timeToRespond: Date.now() - new Date(msg.timestamp).getTime(),
        })
      }

      if (msg.dismissed) {
        analytics.track('agent_message_dismissed', {
          messageType: msg.type,
          timeToDismiss: Date.now() - new Date(msg.timestamp).getTime(),
        })
      }
    })
  }
)
```

## Complete Integration Example

Here's a complete monitoring system:

```tsx
// components/AgentMonitoring.tsx
'use client'

import { useEffect } from 'react'
import {
  sendDailyCheckIn,
  sendEODPrompt,
  checkUpcomingMeetings,
  checkAtRiskRocks,
  checkForKnowledgeGaps,
} from '@/lib/agentHelpers'

export default function AgentMonitoring() {
  useEffect(() => {
    // Morning check-in (once per day)
    const hour = new Date().getHours()
    if (hour >= 8 && hour < 10) {
      const lastCheckIn = localStorage.getItem('lastMorningCheckIn')
      const today = new Date().toDateString()

      if (lastCheckIn !== today) {
        setTimeout(() => {
          sendDailyCheckIn()
          localStorage.setItem('lastMorningCheckIn', today)
        }, 2000)
      }
    }

    // EOD prompt (once per day, 5-7 PM)
    if (hour >= 17 && hour < 19) {
      const lastEOD = localStorage.getItem('lastEODPrompt')
      const today = new Date().toDateString()

      if (lastEOD !== today) {
        sendEODPrompt()
        localStorage.setItem('lastEODPrompt', today)
      }
    }

    // Meeting reminders (every 5 minutes)
    const meetingInterval = setInterval(() => {
      checkUpcomingMeetings()
    }, 5 * 60 * 1000)

    // At-risk rocks (once per week)
    const riskInterval = setInterval(() => {
      checkAtRiskRocks()
    }, 7 * 24 * 60 * 60 * 1000)

    // Knowledge gaps (once per day)
    const gapInterval = setInterval(() => {
      checkForKnowledgeGaps()
    }, 24 * 60 * 60 * 1000)

    return () => {
      clearInterval(meetingInterval)
      clearInterval(riskInterval)
      clearInterval(gapInterval)
    }
  }, [])

  return null
}

// Add to your app:
// <AgentMonitoring />
// <AgentWidget />
```

## Testing

Use the demo component for testing:

```tsx
import AgentDemo from '@/components/agent/AgentDemo'

// In development only
if (process.env.NODE_ENV === 'development') {
  return <AgentDemo />
}
```

## Troubleshooting

### Messages not appearing?

Check:
1. Is `<AgentWidget />` in your component tree?
2. Are messages being added to the store? (Check with Redux DevTools)
3. Are messages dismissed? (Check `dismissed: false`)

### Widget not showing?

Check:
1. Z-index conflicts (widget uses z-40 and z-50)
2. CSS conflicts with positioning
3. Is the page scrollable? (Widget is fixed position)

### TypeScript errors?

```tsx
import type { AgentMessage } from '@/lib/store'
```

Make sure to import types from the store.
