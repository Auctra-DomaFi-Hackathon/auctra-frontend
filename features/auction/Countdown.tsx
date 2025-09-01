'use client'

import { useEffect, useState } from 'react'
import { formatTimeRemaining } from '@/lib/utils/time'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface CountdownProps {
  endTime: string
  className?: string
  compact?: boolean // New prop for compact display
}

export function Countdown({ endTime, className = "", compact = false }: CountdownProps) {
  const [timeRemaining, setTimeRemaining] = useState(formatTimeRemaining(endTime))

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(formatTimeRemaining(endTime))
    }, 1000)

    return () => clearInterval(timer)
  }, [endTime])

  if (timeRemaining.isExpired) {
    return (
      <div className={cn("font-mono text-center", className)}>
        <Badge variant="secondary" className={compact ? "text-[10px] px-2 py-1" : "text-xs"}>
          Expired
        </Badge>
      </div>
    )
  }

  // Compact version for very small screens or tight spaces
  if (compact) {
    return (
      <div className={cn("font-mono text-center", className)} aria-live="polite">
        <div className="text-xs font-bold">
          {timeRemaining.days > 0 && `${timeRemaining.days}d `}
          {String(timeRemaining.hours).padStart(2, '0')}:
          {String(timeRemaining.minutes).padStart(2, '0')}:
          {String(timeRemaining.seconds).padStart(2, '0')}
        </div>
      </div>
    )
  }

  return (
    <div className={cn("font-mono text-center", className)} aria-live="polite">
      {/* Mobile: Stacked layout (< sm) */}
      <div className="sm:hidden">
        <div className="grid grid-cols-2 gap-2 text-center max-w-[200px] mx-auto">
          {timeRemaining.days > 0 && (
            <div className="text-center">
              <div className="text-sm font-bold text-blue-700">{timeRemaining.days}</div>
              <Badge variant="outline" className="text-[10px] px-1">Days</Badge>
            </div>
          )}
          <div className="text-center">
            <div className="text-sm font-bold text-blue-700">{timeRemaining.hours.toString().padStart(2, '0')}</div>
            <Badge variant="outline" className="text-[10px] px-1">Hrs</Badge>
          </div>
          <div className="text-center">
            <div className="text-sm font-bold text-blue-700">{timeRemaining.minutes.toString().padStart(2, '0')}</div>
            <Badge variant="outline" className="text-[10px] px-1">Min</Badge>
          </div>
          <div className="text-center">
            <div className="text-sm font-bold text-blue-700">{timeRemaining.seconds.toString().padStart(2, '0')}</div>
            <Badge variant="outline" className="text-[10px] px-1">Sec</Badge>
          </div>
        </div>
      </div>

      {/* Desktop: Horizontal layout (>= sm) */}
      <div className="hidden sm:flex justify-center items-center space-x-1 md:space-x-2">
        {timeRemaining.days > 0 && (
          <>
            <div className="text-center">
              <div className="text-base md:text-sm font-bold text-blue-700">
                {timeRemaining.days.toString().padStart(2, '0')}
              </div>
              <Badge variant="outline" className="text-[10px] md:text-xs px-1 md:px-2">
                Days
              </Badge>
            </div>
            <div className="text-base md:text-sm font-bold text-gray-400 px-1">:</div>
          </>
        )}
        
        <div className="text-center">
          <div className="text-base md:text-sm font-bold text-blue-700">
            {timeRemaining.hours.toString().padStart(2, '0')}
          </div>
          <Badge variant="outline" className="text-[10px] md:text-xs px-1 md:px-2">
            Hours
          </Badge>
        </div>
        
        <div className="text-base md:text-sm font-bold text-gray-400 px-1">:</div>
        
        <div className="text-center">
          <div className="text-base md:text-sm font-bold text-blue-700">
            {timeRemaining.minutes.toString().padStart(2, '0')}
          </div>
          <Badge variant="outline" className="text-[10px] md:text-xs px-1 md:px-2">
            Min
          </Badge>
        </div>
        
        <div className="text-base md:text-sm font-bold text-gray-400 px-1">:</div>
        
        <div className="text-center">
          <div className="text-base md:text-sm font-bold text-blue-700">
            {timeRemaining.seconds.toString().padStart(2, '0')}
          </div>
          <Badge variant="outline" className="text-[10px] md:text-xs px-1 md:px-2">
            Sec
          </Badge>
        </div>
      </div>
    </div>
  )
}