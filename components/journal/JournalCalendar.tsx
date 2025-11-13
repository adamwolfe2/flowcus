'use client'

import { useState } from 'react'
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isToday,
  format,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  isSameMonth,
} from 'date-fns'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'
import { JournalEntry } from '@/lib/store'

interface JournalCalendarProps {
  entries: JournalEntry[]
  selectedDate: Date
  onDateSelect: (date: Date) => void
}

export default function JournalCalendar({ entries, selectedDate, onDateSelect }: JournalCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(selectedDate)

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  const hasEntry = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd')
    return entries.some((entry) => entry.date === dateString)
  }

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  const handleToday = () => {
    const today = new Date()
    setCurrentMonth(today)
    onDateSelect(today)
  }

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="flex flex-col h-full bg-gray-900 rounded-lg border border-gray-800 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <CalendarIcon size={20} />
          Journal Calendar
        </h2>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handlePrevMonth}
          className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft size={20} className="text-gray-400" />
        </button>

        <h3 className="text-base font-medium text-white">
          {format(currentMonth, 'MMMM yyyy')}
        </h3>

        <button
          onClick={handleNextMonth}
          className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          aria-label="Next month"
        >
          <ChevronRight size={20} className="text-gray-400" />
        </button>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-gray-500 py-1"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 flex-1">
        {days.map((day, index) => {
          const isSelected = isSameDay(day, selectedDate)
          const isCurrentDay = isToday(day)
          const isCurrentMonth = isSameMonth(day, currentMonth)
          const dayHasEntry = hasEntry(day)

          return (
            <button
              key={index}
              onClick={() => onDateSelect(day)}
              className={`
                relative p-2 rounded-lg text-sm transition-all
                ${isCurrentMonth ? 'text-white' : 'text-gray-600'}
                ${isSelected ? 'bg-blue-600 ring-2 ring-blue-500' : 'hover:bg-gray-800'}
                ${isCurrentDay && !isSelected ? 'ring-1 ring-gray-600' : ''}
                ${!isCurrentMonth ? 'opacity-50' : ''}
              `}
            >
              <div className="flex flex-col items-center justify-center">
                <span className={isSelected ? 'font-semibold' : ''}>
                  {format(day, 'd')}
                </span>
                {dayHasEntry && (
                  <div
                    className={`
                      w-1.5 h-1.5 rounded-full mt-1
                      ${isSelected ? 'bg-white' : 'bg-green-500'}
                    `}
                  />
                )}
              </div>
            </button>
          )
        })}
      </div>

      {/* Today Button */}
      <button
        onClick={handleToday}
        className="mt-4 w-full py-2 px-4 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm font-medium"
      >
        Jump to Today
      </button>

      {/* Entry Count */}
      <div className="mt-3 pt-3 border-t border-gray-800">
        <p className="text-xs text-gray-500 text-center">
          {entries.length} {entries.length === 1 ? 'entry' : 'entries'} total
        </p>
      </div>
    </div>
  )
}
