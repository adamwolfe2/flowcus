'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'
import { format } from 'date-fns'
import { CheckCircle2, Circle, Edit2, Plus, X } from 'lucide-react'

export default function TodaysFocus() {
  const [showModal, setShowModal] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const {
    rocks,
    getTodaysFocus,
    getTasksDueToday,
    getTasksOverdue,
    getRocksAtRisk,
    setDailyFocus,
    updateDailyFocus,
  } = useStore()

  const todaysFocus = getTodaysFocus()
  const today = format(new Date(), 'EEEE, MMMM d, yyyy')

  const handleCheckboxChange = (priorityNum: 1 | 2 | 3) => {
    if (!todaysFocus) return

    const updateKey = `priority${priorityNum}Completed` as const
    updateDailyFocus(todaysFocus.id, {
      [updateKey]: !todaysFocus[updateKey],
    })
  }

  const getCompletedCount = () => {
    if (!todaysFocus) return 0
    return [
      todaysFocus.priority1Completed,
      todaysFocus.priority2Completed,
      todaysFocus.priority3Completed,
    ].filter(Boolean).length
  }

  const getRockColor = (rockId: string | null) => {
    if (!rockId) return 'gray'
    const rock = rocks.find((r) => r.id === rockId)
    return rock?.color || 'gray'
  }

  const getRockName = (rockId: string | null) => {
    if (!rockId) return 'No Rock'
    const rock = rocks.find((r) => r.id === rockId)
    return rock?.name || 'Unknown Rock'
  }

  if (!todaysFocus && !showModal) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Today's Focus</h2>
          <span className="text-gray-400">{today}</span>
        </div>

        <div className="text-center py-8">
          <p className="text-gray-400 mb-4">You haven't set your focus for today yet.</p>
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2 mx-auto transition-colors"
          >
            <Plus className="w-5 h-5" />
            Set Today's Focus
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">Today's Focus</h2>
            <span className="text-gray-400 text-sm">{today}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400">
              {getCompletedCount()} / 3 completed
            </span>
            <button
              onClick={() => setIsEditing(true)}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {todaysFocus && (
          <div className="space-y-3">
            {/* Priority 1 */}
            <PriorityItem
              number={1}
              text={todaysFocus.priority1}
              completed={todaysFocus.priority1Completed}
              rockId={todaysFocus.priority1RockId}
              rockName={getRockName(todaysFocus.priority1RockId)}
              rockColor={getRockColor(todaysFocus.priority1RockId)}
              onToggle={() => handleCheckboxChange(1)}
            />

            {/* Priority 2 */}
            <PriorityItem
              number={2}
              text={todaysFocus.priority2}
              completed={todaysFocus.priority2Completed}
              rockId={todaysFocus.priority2RockId}
              rockName={getRockName(todaysFocus.priority2RockId)}
              rockColor={getRockColor(todaysFocus.priority2RockId)}
              onToggle={() => handleCheckboxChange(2)}
            />

            {/* Priority 3 */}
            <PriorityItem
              number={3}
              text={todaysFocus.priority3}
              completed={todaysFocus.priority3Completed}
              rockId={todaysFocus.priority3RockId}
              rockName={getRockName(todaysFocus.priority3RockId)}
              rockColor={getRockColor(todaysFocus.priority3RockId)}
              onToggle={() => handleCheckboxChange(3)}
            />
          </div>
        )}

        {/* Progress bar */}
        <div className="mt-4">
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
              style={{ width: `${(getCompletedCount() / 3) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Set/Edit Focus Modal */}
      {(showModal || isEditing) && (
        <SetFocusModal
          isEditing={isEditing}
          existingFocus={todaysFocus}
          onClose={() => {
            setShowModal(false)
            setIsEditing(false)
          }}
        />
      )}
    </>
  )
}

interface PriorityItemProps {
  number: number
  text: string
  completed: boolean
  rockId: string | null
  rockName: string
  rockColor: string
  onToggle: () => void
}

function PriorityItem({
  number,
  text,
  completed,
  rockName,
  rockColor,
  onToggle,
}: PriorityItemProps) {
  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-lg border-2 transition-all ${
        completed
          ? 'bg-gray-900 border-gray-700 opacity-60'
          : 'bg-gray-900 border-gray-700 hover:border-gray-600'
      }`}
    >
      <button
        onClick={onToggle}
        className="flex-shrink-0 mt-0.5 hover:scale-110 transition-transform"
      >
        {completed ? (
          <CheckCircle2 className="w-6 h-6 text-green-500" />
        ) : (
          <Circle className="w-6 h-6 text-gray-400" />
        )}
      </button>

      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold text-gray-500">PRIORITY {number}</span>
        </div>
        <p className={`text-lg ${completed ? 'line-through text-gray-500' : 'text-white'}`}>
          {text}
        </p>
        <div className="mt-2">
          <span
            className="inline-flex items-center px-2 py-1 rounded text-xs font-medium"
            style={{
              backgroundColor: `${rockColor}20`,
              color: rockColor,
            }}
          >
            {rockName}
          </span>
        </div>
      </div>
    </div>
  )
}

interface SetFocusModalProps {
  isEditing: boolean
  existingFocus: any
  onClose: () => void
}

function SetFocusModal({ isEditing, existingFocus, onClose }: SetFocusModalProps) {
  const {
    rocks,
    getTasksDueToday,
    getTasksOverdue,
    getRocksAtRisk,
    setDailyFocus,
    updateDailyFocus,
  } = useStore()

  const [priority1, setPriority1] = useState(existingFocus?.priority1 || '')
  const [priority2, setPriority2] = useState(existingFocus?.priority2 || '')
  const [priority3, setPriority3] = useState(existingFocus?.priority3 || '')

  const [priority1RockId, setPriority1RockId] = useState(existingFocus?.priority1RockId || null)
  const [priority2RockId, setPriority2RockId] = useState(existingFocus?.priority2RockId || null)
  const [priority3RockId, setPriority3RockId] = useState(existingFocus?.priority3RockId || null)

  const tasksDueToday = getTasksDueToday()
  const tasksOverdue = getTasksOverdue()
  const rocksAtRisk = getRocksAtRisk()

  const suggestions = [
    ...tasksOverdue.slice(0, 2).map((t) => ({ text: t.title, rockId: t.rockId, type: 'overdue' })),
    ...tasksDueToday.slice(0, 2).map((t) => ({ text: t.title, rockId: t.rockId, type: 'due_today' })),
    ...rocksAtRisk.slice(0, 1).map((r) => ({ text: `Progress ${r.name}`, rockId: r.id, type: 'at_risk' })),
  ].slice(0, 3)

  const handleSave = () => {
    const today = new Date().toISOString().split('T')[0]

    if (isEditing && existingFocus) {
      updateDailyFocus(existingFocus.id, {
        priority1,
        priority2,
        priority3,
        priority1RockId,
        priority2RockId,
        priority3RockId,
      })
    } else {
      setDailyFocus({
        date: today,
        priority1,
        priority2,
        priority3,
        priority1RockId,
        priority2RockId,
        priority3RockId,
        priority1Completed: false,
        priority2Completed: false,
        priority3Completed: false,
      })
    }

    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-6 flex items-center justify-between">
          <h3 className="text-xl font-bold">
            {isEditing ? 'Edit Today\'s Focus' : 'Set Today\'s Focus'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {suggestions.length > 0 && !isEditing && (
            <div className="mb-6 p-4 bg-gray-900 rounded-lg">
              <h4 className="text-sm font-semibold mb-3 text-gray-300">Suggested Priorities</h4>
              <div className="space-y-2">
                {suggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      if (idx === 0) {
                        setPriority1(suggestion.text)
                        setPriority1RockId(suggestion.rockId)
                      } else if (idx === 1) {
                        setPriority2(suggestion.text)
                        setPriority2RockId(suggestion.rockId)
                      } else {
                        setPriority3(suggestion.text)
                        setPriority3RockId(suggestion.rockId)
                      }
                    }}
                    className="w-full text-left px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm transition-colors"
                  >
                    <span className="text-gray-300">{suggestion.text}</span>
                    <span className="text-xs text-gray-500 ml-2">
                      ({suggestion.type === 'overdue' ? 'Overdue' : suggestion.type === 'due_today' ? 'Due Today' : 'At Risk'})
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-6">
            {/* Priority 1 */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Priority 1
              </label>
              <input
                type="text"
                value={priority1}
                onChange={(e) => setPriority1(e.target.value)}
                placeholder="What's your top priority today?"
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500 text-white"
              />
              <select
                value={priority1RockId || ''}
                onChange={(e) => setPriority1RockId(e.target.value || null)}
                className="w-full mt-2 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500 text-white"
              >
                <option value="">No Rock</option>
                {rocks.map((rock) => (
                  <option key={rock.id} value={rock.id}>
                    {rock.icon} {rock.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority 2 */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Priority 2
              </label>
              <input
                type="text"
                value={priority2}
                onChange={(e) => setPriority2(e.target.value)}
                placeholder="What's your second priority?"
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500 text-white"
              />
              <select
                value={priority2RockId || ''}
                onChange={(e) => setPriority2RockId(e.target.value || null)}
                className="w-full mt-2 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500 text-white"
              >
                <option value="">No Rock</option>
                {rocks.map((rock) => (
                  <option key={rock.id} value={rock.id}>
                    {rock.icon} {rock.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority 3 */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Priority 3
              </label>
              <input
                type="text"
                value={priority3}
                onChange={(e) => setPriority3(e.target.value)}
                placeholder="What's your third priority?"
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500 text-white"
              />
              <select
                value={priority3RockId || ''}
                onChange={(e) => setPriority3RockId(e.target.value || null)}
                className="w-full mt-2 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500 text-white"
              >
                <option value="">No Rock</option>
                {rocks.map((rock) => (
                  <option key={rock.id} value={rock.id}>
                    {rock.icon} {rock.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={handleSave}
              disabled={!priority1 || !priority2 || !priority3}
              className="flex-1 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg transition-colors font-medium"
            >
              {isEditing ? 'Update Focus' : 'Set Focus'}
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
