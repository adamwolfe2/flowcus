'use client'

interface ProgressBarProps {
  progress: number // 0-100
  height?: number // pixels
  showLabel?: boolean
  color?: string // override color
}

const getProgressColor = (progress: number): string => {
  if (progress >= 91) return '#10B981' // green-500
  if (progress >= 61) return '#3B82F6' // blue-500
  if (progress >= 31) return '#F59E0B' // amber-500
  return '#EF4444' // red-500
}

export default function ProgressBar({
  progress,
  height = 8,
  showLabel = true,
  color,
}: ProgressBarProps) {
  const clampedProgress = Math.min(Math.max(progress, 0), 100)
  const barColor = color || getProgressColor(clampedProgress)

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center mb-1 text-xs text-gray-400">
          <span>Progress</span>
          <span className="font-semibold text-white">{clampedProgress}%</span>
        </div>
      )}
      <div
        className="w-full bg-gray-800 rounded-full overflow-hidden"
        style={{ height: `${height}px` }}
      >
        <div
          className="h-full transition-all duration-500 ease-out rounded-full"
          style={{
            width: `${clampedProgress}%`,
            backgroundColor: barColor,
          }}
        />
      </div>
    </div>
  )
}
