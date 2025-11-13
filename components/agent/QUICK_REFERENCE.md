# Agent Chat - Quick Reference

## Installation

```tsx
import AgentWidget from '@/components/agent'

<AgentWidget />
```

## Send Messages

```tsx
import { useStore } from '@/lib/store'

const { addAgentMessage } = useStore()

addAgentMessage({
  type: 'check_in', // or 'reminder', 'knowledge_gap', 'eod_prompt', 'meeting_reminder', 'refocus'
  content: 'Your message here',
  dismissed: false,
  responded: false,
  response: null,
})
```

## Helper Functions

```tsx
import {
  sendRockCheckIn,
  sendMeetingReminder,
  sendEODPrompt,
  sendRefocusPrompt,
  sendKnowledgeGap,
  sendReminder,
} from '@/lib/agentHelpers'

// Examples
sendRockCheckIn('Project Name')
sendMeetingReminder('Meeting Title', 15) // 15 minutes
sendEODPrompt(5) // 5 tasks completed
sendRefocusPrompt('Top Priority')
sendKnowledgeGap('Project Name')
sendReminder('Custom reminder text')
```

## Message Types

| Type | Icon | Use Case |
|------|------|----------|
| `check_in` | 👋 | Progress updates, greetings |
| `reminder` | ⏰ | Time-based alerts |
| `knowledge_gap` | 💭 | Missing information |
| `eod_prompt` | 📝 | End of day report |
| `meeting_reminder` | 📅 | Upcoming meetings |
| `refocus` | 🎯 | Productivity nudges |

## Automated Checks

```tsx
import {
  checkUpcomingMeetings,
  checkAtRiskRocks,
  checkForKnowledgeGaps,
  sendDailyCheckIn,
} from '@/lib/agentHelpers'

// Run periodically
checkUpcomingMeetings()
checkAtRiskRocks()
checkForKnowledgeGaps()
sendDailyCheckIn()
```

## Store Actions

```tsx
const {
  agentMessages,           // Get all messages
  addAgentMessage,         // Add new message
  dismissAgentMessage,     // Dismiss message (id)
  respondToAgentMessage,   // Respond to message (id, response)
} = useStore()
```

## Component Props

### AgentWidget
```tsx
<AgentWidget />
// No props - self-contained
```

### AgentTrigger
```tsx
<AgentTrigger
  onClick={() => setOpen(true)}
  isOpen={isOpen}
/>
```

### AgentChat
```tsx
<AgentChat
  isOpen={isOpen}
  onClose={() => setOpen(false)}
  onMinimize={() => setOpen(false)}
/>
```

## Styling

Components use Tailwind with these z-indexes:
- Trigger: `z-40`
- Chat backdrop: `z-40`
- Chat window: `z-50`

Ensure no conflicts with existing components.

## Files

```
components/agent/
├── AgentChat.tsx       - Main chat window (273 lines)
├── AgentTrigger.tsx    - Floating button (84 lines)
├── AgentWidget.tsx     - Combined wrapper (47 lines)
├── AgentDemo.tsx       - Test component (92 lines)
├── index.ts            - Exports (44 lines)
├── README.md           - Full documentation
├── INTEGRATION_GUIDE.md - Integration examples
└── QUICK_REFERENCE.md  - This file

lib/
└── agentHelpers.ts     - Helper functions (289 lines)
```

## Testing

```tsx
import AgentDemo from '@/components/agent/AgentDemo'

// Includes test buttons for all message types
<AgentDemo />
```

## Common Patterns

### Morning Check-in
```tsx
useEffect(() => {
  const hour = new Date().getHours()
  if (hour >= 8 && hour < 10) {
    sendDailyCheckIn()
  }
}, [])
```

### EOD Reminder
```tsx
useEffect(() => {
  const hour = new Date().getHours()
  if (hour >= 17 && hour < 19) {
    sendEODPrompt()
  }
}, [])
```

### Monitor Meetings
```tsx
useEffect(() => {
  const interval = setInterval(() => {
    checkUpcomingMeetings()
  }, 5 * 60 * 1000) // Every 5 minutes

  return () => clearInterval(interval)
}, [])
```

## TypeScript

```tsx
import type { AgentMessage } from '@/lib/store'

const message: AgentMessage = {
  id: string
  type: 'check_in' | 'reminder' | 'knowledge_gap' |
        'eod_prompt' | 'meeting_reminder' | 'refocus'
  content: string
  timestamp: string
  dismissed: boolean
  responded: boolean
  response: string | null
}
```

## Troubleshooting

**Widget not showing?**
- Check z-index conflicts
- Verify `<AgentWidget />` is rendered
- Check browser console for errors

**Messages not appearing?**
- Verify store integration
- Check if messages are dismissed
- Use Redux DevTools to inspect state

**TypeScript errors?**
- Import types: `import type { AgentMessage } from '@/lib/store'`
- Check tsconfig.json paths

## Production Ready

All components are:
- ✅ Fully typed (TypeScript)
- ✅ Accessible (ARIA labels)
- ✅ Responsive (mobile-friendly)
- ✅ Animated (smooth transitions)
- ✅ Tested (compiles without errors)
- ✅ Documented (README + guides)

## Support

- Full docs: `README.md`
- Integration examples: `INTEGRATION_GUIDE.md`
- Source code: `components/agent/*.tsx`
- Helper functions: `lib/agentHelpers.ts`
