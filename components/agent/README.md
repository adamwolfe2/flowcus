# Flowcus Agent Chat Interface

A complete AI Agent chat interface component for Flowcus that provides an interactive, minimizable chatbot experience.

## Features

- **Floating Chat Bubble**: Elegant bottom-right corner placement (Intercom/Drift style)
- **Minimizable/Expandable**: Full window controls with minimize and close options
- **Unread Badge**: Shows count of unread messages when minimized
- **Animated Entrance**: Smooth animations when agent sends messages
- **Message Types**: Six different message types with appropriate icons
- **Interactive Responses**: Users can respond to or dismiss messages
- **Message History**: View full conversation history
- **Dark Theme**: Matches Flowcus design system
- **TypeScript**: Fully typed for safety and autocomplete

## Quick Start

### Basic Usage

Add the agent widget to any page:

```tsx
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

That's it! The widget will handle all state management internally.

## Message Types

The agent supports six message types, each with its own icon:

| Type | Icon | Description |
|------|------|-------------|
| `check_in` | 👋 | Regular check-ins on project progress |
| `reminder` | ⏰ | Time-based reminders for meetings/tasks |
| `knowledge_gap` | 💭 | Suggestions when information is missing |
| `eod_prompt` | 📝 | End-of-day report prompts |
| `meeting_reminder` | 📅 | Upcoming meeting notifications |
| `refocus` | 🎯 | Productivity refocus suggestions |

## Store Integration

The components integrate seamlessly with the Zustand store:

```tsx
import { useStore } from '@/lib/store'

const {
  agentMessages,      // Array of all messages
  addAgentMessage,    // Add a new message
  dismissAgentMessage, // Dismiss a message
  respondToAgentMessage, // Respond to a message
} = useStore()
```

### Adding Messages Programmatically

```tsx
import { useStore } from '@/lib/store'

function MyComponent() {
  const { addAgentMessage } = useStore()

  const sendCheckIn = () => {
    addAgentMessage({
      type: 'check_in',
      content: "Hey! How's the project going?",
      dismissed: false,
      responded: false,
      response: null,
    })
  }

  return <button onClick={sendCheckIn}>Send Check-in</button>
}
```

## Advanced Usage

### Separate Components

For more control, use the individual components:

```tsx
import { useState } from 'react'
import { AgentChat, AgentTrigger } from '@/components/agent'

function CustomLayout() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <AgentTrigger
        onClick={() => setIsOpen(true)}
        isOpen={isOpen}
      />
      <AgentChat
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onMinimize={() => setIsOpen(false)}
      />
    </>
  )
}
```

### Demo/Testing Component

Use the demo component for testing:

```tsx
import AgentDemo from '@/components/agent/AgentDemo'

export default function TestPage() {
  return <AgentDemo />
}
```

This includes test buttons to trigger each message type.

## Component API

### AgentWidget

Combined component with internal state management.

```tsx
<AgentWidget />
```

No props needed - handles everything automatically.

### AgentTrigger

Floating button that shows when chat is closed.

```tsx
<AgentTrigger
  onClick={() => void}  // Function to open chat
  isOpen={boolean}      // Whether chat is currently open
/>
```

### AgentChat

Main chat window component.

```tsx
<AgentChat
  isOpen={boolean}           // Whether chat is open
  onClose={() => void}       // Function to close chat
  onMinimize={() => void}    // Function to minimize chat
/>
```

## Message States

Messages have three states in the store:

1. **Active** - Not dismissed, not responded to (shows action buttons)
2. **Responded** - User has responded (shows response, no actions)
3. **Dismissed** - User dismissed (filtered out, not shown)

## Styling

The components use Tailwind CSS and match the Flowcus dark theme:

- Background: `bg-gray-900`, `bg-gray-800`
- Borders: `border-gray-800`, `border-gray-700`
- Accent: `indigo-600`, `purple-600` gradients
- Text: `text-white`, `text-gray-400`, `text-gray-500`

## Animations

Smooth CSS animations included:

- **Fade In**: Message appearance
- **Slide Up**: Chat window entrance
- **Pulse**: Unread message indicator
- **Bounce**: Unread count badge

## User Interactions

Users can:

1. **Click trigger button** - Opens chat window
2. **View messages** - See all non-dismissed messages
3. **Respond** - Click "Respond" button, type message, send
4. **Dismiss** - Click "Dismiss" to hide message
5. **Minimize** - Click minimize icon to close but keep history
6. **Close** - Click X to close (backdrop click also works)

## Keyboard Shortcuts

- **Enter** - Send message
- **Escape** - Close chat (when backdrop is clicked)

## Accessibility

- Proper ARIA labels on buttons
- Keyboard navigation support
- Focus management for inputs
- Screen reader friendly

## File Structure

```
components/agent/
├── AgentChat.tsx      # Main chat window
├── AgentTrigger.tsx   # Floating button
├── AgentWidget.tsx    # Combined wrapper
├── AgentDemo.tsx      # Test/demo component
├── index.ts           # Exports
└── README.md          # This file
```

## Integration Example

Here's how it's integrated in the main app:

```tsx
// app/page.tsx
'use client'

import AgentWidget from '@/components/agent'
// ... other imports

export default function Home() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1">
        <YourContent />
      </main>
      <AgentWidget />
    </div>
  )
}
```

## Future Enhancements

Potential improvements:

- [ ] Voice input/output
- [ ] Rich message formatting (markdown)
- [ ] Attachment support
- [ ] Typing indicators
- [ ] Message reactions
- [ ] Search/filter messages
- [ ] Export conversation
- [ ] Customizable position
- [ ] Sound notifications
- [ ] Browser notifications

## TypeScript Types

All types are imported from the store:

```tsx
import { AgentMessage } from '@/lib/store'

// AgentMessage interface
interface AgentMessage {
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

## Browser Support

Works in all modern browsers:

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## License

Part of the Flowcus project.
