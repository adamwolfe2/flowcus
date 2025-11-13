'use client'

import { memo } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { RockStatus } from '@/lib/store'

interface RockNodeData {
  name: string
  description?: string
  color: string
  icon: string
  status: RockStatus
  progress: number // 0-100
  category: string
  taskCount?: number
  noteCount?: number
  subRockCount?: number
  onNodeClick?: () => void
}

const getStatusColor = (status: RockStatus): string => {
  switch (status) {
    case 'not_started':
      return '#9CA3AF' // gray-400
    case 'in_progress':
      return '#3B82F6' // blue-500
    case 'on_track':
      return '#10B981' // green-500
    case 'at_risk':
      return '#F59E0B' // amber-500
    case 'complete':
      return '#8B5CF6' // purple-500
    default:
      return '#9CA3AF'
  }
}

const getStatusText = (status: RockStatus): string => {
  switch (status) {
    case 'not_started':
      return 'Not Started'
    case 'in_progress':
      return 'In Progress'
    case 'on_track':
      return 'On Track'
    case 'at_risk':
      return 'At Risk'
    case 'complete':
      return 'Complete'
    default:
      return status
  }
}

const getProgressColor = (progress: number): string => {
  if (progress >= 91) return '#10B981' // green
  if (progress >= 61) return '#3B82F6' // blue
  if (progress >= 31) return '#F59E0B' // amber
  return '#EF4444' // red
}

function RockNode({ data }: NodeProps<RockNodeData>) {
  const statusColor = getStatusColor(data.status)
  const progressColor = getProgressColor(data.progress)

  return (
    <div
      className="relative bg-gray-900 border-2 rounded-lg shadow-lg hover:shadow-xl transition-shadow cursor-pointer min-w-[240px]"
      style={{ borderColor: data.color }}
      onClick={data.onNodeClick}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3" />

      {/* Status Badge in Top-Right Corner */}
      <div
        className="absolute -top-2 -right-2 px-2 py-1 rounded-full text-xs font-semibold shadow-lg border-2 border-gray-900"
        style={{ backgroundColor: statusColor, color: '#fff' }}
      >
        {getStatusText(data.status)}
      </div>

      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">{data.icon}</span>
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-white">{data.name}</h3>
            {data.category && (
              <p className="text-xs text-gray-500">{data.category}</p>
            )}
          </div>
        </div>

        {data.description && (
          <p className="text-sm text-gray-400 mb-3 line-clamp-2">{data.description}</p>
        )}

        <div className="flex gap-4 text-xs text-gray-500 mb-3">
          {data.taskCount !== undefined && (
            <div className="flex items-center gap-1">
              <span>✓</span>
              <span>{data.taskCount} tasks</span>
            </div>
          )}
          {data.noteCount !== undefined && (
            <div className="flex items-center gap-1">
              <span>📝</span>
              <span>{data.noteCount} notes</span>
            </div>
          )}
          {data.subRockCount !== undefined && (
            <div className="flex items-center gap-1">
              <span>🎯</span>
              <span>{data.subRockCount} sub-rocks</span>
            </div>
          )}
        </div>

        {/* Progress Bar at Bottom */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-xs text-gray-400">
            <span>Progress</span>
            <span className="font-semibold">{data.progress}%</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
            <div
              className="h-full transition-all duration-300 ease-out rounded-full"
              style={{
                width: `${data.progress}%`,
                backgroundColor: progressColor,
              }}
            />
          </div>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  )
}

export default memo(RockNode)
