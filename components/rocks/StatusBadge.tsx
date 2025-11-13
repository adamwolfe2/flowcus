'use client'

import { RockStatus } from '@/lib/store'

interface StatusBadgeProps {
  status: RockStatus
  size?: 'sm' | 'md' | 'lg'
}

const getStatusConfig = (status: RockStatus) => {
  switch (status) {
    case 'not_started':
      return {
        color: 'bg-gray-500',
        text: 'Not Started',
        icon: '⚪',
      }
    case 'in_progress':
      return {
        color: 'bg-blue-500',
        text: 'In Progress',
        icon: '🔵',
      }
    case 'on_track':
      return {
        color: 'bg-green-500',
        text: 'On Track',
        icon: '🟢',
      }
    case 'at_risk':
      return {
        color: 'bg-amber-500',
        text: 'At Risk',
        icon: '🟡',
      }
    case 'complete':
      return {
        color: 'bg-purple-500',
        text: 'Complete',
        icon: '🟣',
      }
    default:
      return {
        color: 'bg-gray-500',
        text: status,
        icon: '⚪',
      }
  }
}

const getSizeClasses = (size: 'sm' | 'md' | 'lg') => {
  switch (size) {
    case 'sm':
      return 'px-2 py-0.5 text-xs'
    case 'md':
      return 'px-3 py-1 text-sm'
    case 'lg':
      return 'px-4 py-1.5 text-base'
    default:
      return 'px-3 py-1 text-sm'
  }
}

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = getStatusConfig(status)
  const sizeClasses = getSizeClasses(size)

  return (
    <span
      className={`inline-flex items-center gap-1.5 ${config.color} text-white font-semibold rounded-full ${sizeClasses}`}
    >
      <span>{config.icon}</span>
      <span>{config.text}</span>
    </span>
  )
}
