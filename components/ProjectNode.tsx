'use client'

import { memo } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'

interface ProjectNodeData {
  name: string
  description?: string
  color: string
  icon: string
  taskCount?: number
  noteCount?: number
  ideaCount?: number
  onNodeClick?: () => void
}

function ProjectNode({ data }: NodeProps<ProjectNodeData>) {
  return (
    <div
      className="relative bg-gray-900 border-2 rounded-lg shadow-lg hover:shadow-xl transition-shadow cursor-pointer min-w-[240px]"
      style={{ borderColor: data.color }}
      onClick={data.onNodeClick}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3" />

      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">{data.icon}</span>
          <h3 className="font-semibold text-lg text-white flex-1">{data.name}</h3>
        </div>

        {data.description && (
          <p className="text-sm text-gray-400 mb-3">{data.description}</p>
        )}

        <div className="flex gap-4 text-xs text-gray-500">
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
          {data.ideaCount !== undefined && (
            <div className="flex items-center gap-1">
              <span>💡</span>
              <span>{data.ideaCount} ideas</span>
            </div>
          )}
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  )
}

export default memo(ProjectNode)
