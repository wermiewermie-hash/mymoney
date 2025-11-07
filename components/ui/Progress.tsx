'use client'

interface ProgressProps {
  value: number
  className?: string
}

export function Progress({ value, className = '' }: ProgressProps) {
  return (
    <div className={`relative w-full bg-[#E0E0E0] rounded-full overflow-hidden ${className}`}>
      <div
        className="h-full bg-gradient-to-r from-[#52C41A] to-[#389E0D] rounded-full transition-all duration-500"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
}
