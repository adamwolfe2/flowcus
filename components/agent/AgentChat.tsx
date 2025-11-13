'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Send, Bot, Minimize2 } from 'lucide-react'
import { useStore, AgentMessage } from '@/lib/store'
import { format } from 'date-fns'

interface AgentChatProps {
  isOpen: boolean
  onClose: () => void
  onMinimize: () => void
}

// Message type icons mapping
const MESSAGE_TYPE_ICONS: Record<AgentMessage['type'], string> = {
  check_in: '👋',
  reminder: '⏰',
  knowledge_gap: '💭',
  eod_prompt: '📝',
  meeting_reminder: '📅',
  refocus: '🎯',
}

// Message type labels for better UX
const MESSAGE_TYPE_LABELS: Record<AgentMessage['type'], string> = {
  check_in: 'Check-in',
  reminder: 'Reminder',
  knowledge_gap: 'Knowledge Gap',
  eod_prompt: 'End of Day',
  meeting_reminder: 'Meeting',
  refocus: 'Refocus',
}

export default function AgentChat({ isOpen, onClose, onMinimize }: AgentChatProps) {
  const { agentMessages, dismissAgentMessage, respondToAgentMessage } = useStore()
  const [inputValue, setInputValue] = useState('')
  const [respondingToId, setRespondingToId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Filter non-dismissed messages
  const activeMessages = agentMessages.filter((msg) => !msg.dismissed)

  // Sort messages by timestamp (oldest first for chat display)
  const sortedMessages = [...activeMessages].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  )

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current && isOpen) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [sortedMessages.length, isOpen])

  const handleDismiss = (id: string) => {
    dismissAgentMessage(id)
  }

  const handleRespond = (id: string) => {
    setRespondingToId(id)
  }

  const handleSendResponse = (messageId?: string) => {
    if (!inputValue.trim()) return

    if (messageId) {
      // Responding to a specific message
      respondToAgentMessage(messageId, inputValue)
      setRespondingToId(null)
    }

    setInputValue('')
  }

  const handleKeyPress = (e: React.KeyboardEvent, messageId?: string) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendResponse(messageId)
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Chat Window */}
      <div className="fixed bottom-6 right-6 z-50 w-96 max-h-[600px] flex flex-col bg-gray-900 border border-gray-800 rounded-lg shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-gradient-to-r from-indigo-600/10 to-purple-600/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Flowcus Agent</h3>
              <p className="text-xs text-gray-400">Your AI productivity assistant</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={onMinimize}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              aria-label="Minimize"
            >
              <Minimize2 className="w-4 h-4 text-gray-400" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
          {sortedMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <Bot className="w-12 h-12 text-gray-600 mb-3" />
              <p className="text-sm text-gray-500">No messages yet</p>
              <p className="text-xs text-gray-600 mt-1">
                I'll check in when I have updates for you
              </p>
            </div>
          ) : (
            sortedMessages.map((message) => (
              <div key={message.id} className="animate-fade-in">
                {/* Agent Message */}
                <div className="flex gap-3 mb-2">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-lg">
                    {MESSAGE_TYPE_ICONS[message.type]}
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-800 rounded-lg rounded-tl-none p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-indigo-400">
                          {MESSAGE_TYPE_LABELS[message.type]}
                        </span>
                        <span className="text-xs text-gray-500">
                          {format(new Date(message.timestamp), 'h:mm a')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-200 leading-relaxed">
                        {message.content}
                      </p>
                    </div>

                    {/* User Response (if exists) */}
                    {message.responded && message.response && (
                      <div className="mt-2 bg-indigo-600/20 border border-indigo-600/30 rounded-lg rounded-br-none p-3 ml-4">
                        <p className="text-xs text-indigo-300 mb-1">You responded:</p>
                        <p className="text-sm text-gray-200">{message.response}</p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    {!message.responded && respondingToId !== message.id && (
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => handleRespond(message.id)}
                          className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs rounded transition-colors"
                        >
                          Respond
                        </button>
                        <button
                          onClick={() => handleDismiss(message.id)}
                          className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs rounded transition-colors"
                        >
                          Dismiss
                        </button>
                      </div>
                    )}

                    {/* Response Input (inline) */}
                    {respondingToId === message.id && (
                      <div className="mt-2 flex gap-2 animate-fade-in">
                        <input
                          type="text"
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          onKeyPress={(e) => handleKeyPress(e, message.id)}
                          placeholder="Type your response..."
                          className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSendResponse(message.id)}
                          className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={!inputValue.trim()}
                        >
                          <Send className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setRespondingToId(null)
                            setInputValue('')
                          }}
                          className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors text-xs"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area (General) */}
        {!respondingToId && (
          <div className="p-4 border-t border-gray-800">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e)}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
              <button
                onClick={() => handleSendResponse()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                disabled={!inputValue.trim()}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </>
  )
}
