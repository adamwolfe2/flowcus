'use client'

import { useState, useEffect } from 'react'
import { useStore } from '@/lib/store'
import { Plus, CheckSquare, FileText, Lightbulb, Zap } from 'lucide-react'

interface QuickCaptureProps {
  defaultType?: 'task' | 'note' | 'idea'
}

export default function QuickCapture({ defaultType = 'task' }: QuickCaptureProps) {
  const { rocks, subRocks, addTask, addNote, addIdea } = useStore()

  const [type, setType] = useState<'task' | 'note' | 'idea'>(defaultType)
  const [content, setContent] = useState('')
  const [selectedRockId, setSelectedRockId] = useState<string | null>(null)
  const [selectedSubRockId, setSelectedSubRockId] = useState<string | null>(null)
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium')
  const [showSuccess, setShowSuccess] = useState(false)

  // Filter sub-rocks based on selected rock
  const availableSubRocks = selectedRockId
    ? subRocks.filter((sr) => sr.rockId === selectedRockId)
    : []

  // Reset sub-rock when rock changes
  useEffect(() => {
    setSelectedSubRockId(null)
  }, [selectedRockId])

  // Keyboard shortcut: Ctrl+K to focus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        document.getElementById('quick-capture-input')?.focus()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!content.trim()) return

    const today = new Date().toISOString().split('T')[0]

    switch (type) {
      case 'task':
        addTask({
          title: content,
          description: '',
          rockId: selectedRockId,
          subRockId: selectedSubRockId,
          status: 'todo',
          priority,
          dueDate: today,
          completedDate: null,
          source: 'manual',
          externalId: null,
          url: null,
          tags: [],
          timeEstimate: null,
        })
        break

      case 'note':
        addNote({
          title: content,
          content: '',
          source: 'manual',
          externalId: null,
          url: null,
          rockId: selectedRockId,
          subRockId: selectedSubRockId,
        })
        break

      case 'idea':
        addIdea({
          title: content,
          content: '',
          rockId: selectedRockId,
          subRockId: selectedSubRockId,
        })
        break
    }

    // Clear form
    setContent('')
    setSelectedRockId(null)
    setSelectedSubRockId(null)
    setPriority('medium')

    // Show success message
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 2000)

    // Re-focus input
    setTimeout(() => {
      document.getElementById('quick-capture-input')?.focus()
    }, 100)
  }

  const getPlaceholder = () => {
    switch (type) {
      case 'task':
        return 'What do you need to do?'
      case 'note':
        return 'What do you want to remember?'
      case 'idea':
        return 'What idea came to mind?'
    }
  }

  const getIcon = (t: 'task' | 'note' | 'idea') => {
    switch (t) {
      case 'task':
        return <CheckSquare className="w-4 h-4" />
      case 'note':
        return <FileText className="w-4 h-4" />
      case 'idea':
        return <Lightbulb className="w-4 h-4" />
    }
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 border-2 border-gray-700 hover:border-indigo-600 transition-colors">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-5 h-5 text-indigo-500" />
        <h2 className="text-xl font-bold">Quick Capture</h2>
        <span className="text-xs text-gray-500 ml-auto">Ctrl+K to focus</span>
      </div>

      {/* Type Selector Tabs */}
      <div className="flex gap-2 mb-4">
        {(['task', 'note', 'idea'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${
              type === t
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
            }`}
          >
            {getIcon(t)}
            <span className="capitalize">{t}</span>
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Main Input */}
        <input
          id="quick-capture-input"
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={getPlaceholder()}
          className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500 text-white placeholder-gray-500"
          autoFocus
        />

        {/* Options Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Rock Selector */}
          <select
            value={selectedRockId || ''}
            onChange={(e) => setSelectedRockId(e.target.value || null)}
            className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500 text-white text-sm"
          >
            <option value="">Select Rock...</option>
            {rocks.map((rock) => (
              <option key={rock.id} value={rock.id}>
                {rock.icon} {rock.name}
              </option>
            ))}
          </select>

          {/* Sub-Rock Selector */}
          {selectedRockId && availableSubRocks.length > 0 && (
            <select
              value={selectedSubRockId || ''}
              onChange={(e) => setSelectedSubRockId(e.target.value || null)}
              className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500 text-white text-sm"
            >
              <option value="">Select Sub-Rock...</option>
              {availableSubRocks.map((subRock) => (
                <option key={subRock.id} value={subRock.id}>
                  {subRock.name}
                </option>
              ))}
            </select>
          )}

          {/* Priority Selector (only for tasks) */}
          {type === 'task' && (
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500 text-white text-sm"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
              <option value="urgent">Urgent</option>
            </select>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!content.trim()}
          className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add {type.charAt(0).toUpperCase() + type.slice(1)}
        </button>
      </form>

      {/* Success Message */}
      {showSuccess && (
        <div className="mt-4 p-3 bg-green-900/20 border border-green-800 rounded-lg text-green-400 text-sm text-center animate-fade-in">
          {type.charAt(0).toUpperCase() + type.slice(1)} added successfully!
        </div>
      )}
    </div>
  )
}
