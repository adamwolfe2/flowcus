/**
 * Agent Chat Components
 *
 * Complete AI Agent chat interface for Flowcus
 *
 * Quick Start:
 * ```tsx
 * import AgentWidget from '@/components/agent'
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
 *
 * For advanced usage with separate components:
 * ```tsx
 * import { AgentChat, AgentTrigger } from '@/components/agent'
 *
 * function CustomLayout() {
 *   const [isOpen, setIsOpen] = useState(false)
 *
 *   return (
 *     <>
 *       <AgentTrigger onClick={() => setIsOpen(true)} isOpen={isOpen} />
 *       <AgentChat
 *         isOpen={isOpen}
 *         onClose={() => setIsOpen(false)}
 *         onMinimize={() => setIsOpen(false)}
 *       />
 *     </>
 *   )
 * }
 * ```
 */

export { default } from './AgentWidget'
export { default as AgentWidget } from './AgentWidget'
export { default as AgentChat } from './AgentChat'
export { default as AgentTrigger } from './AgentTrigger'
