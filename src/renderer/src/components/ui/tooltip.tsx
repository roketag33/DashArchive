import * as React from 'react'
import { cn } from '../../lib/utils'

interface TooltipProps {
  children: React.ReactNode
  content: string
  side?: 'top' | 'bottom' | 'left' | 'right'
}

export function Tooltip({ children, content, side = 'top' }: TooltipProps): React.JSX.Element {
  const [isVisible, setIsVisible] = React.useState(false)

  return (
    <div
      className="relative flex items-center justify-center"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          className={cn(
            'absolute z-50 px-2 py-1 text-xs font-medium text-white bg-black/90 rounded shadow-sm whitespace-nowrap animate-in fade-in zoom-in-95 duration-200 pointer-events-none',
            side === 'top' && 'bottom-full mb-2',
            side === 'bottom' && 'top-full mt-2',
            side === 'left' && 'right-full mr-2',
            side === 'right' && 'left-full ml-2'
          )}
        >
          {content}
          {/* Arrow */}
          <div
            className={cn(
              'absolute w-0 h-0 border-4 border-transparent',
              side === 'top' && 'top-full left-1/2 -translate-x-1/2 border-t-black/90',
              side === 'bottom' && 'bottom-full left-1/2 -translate-x-1/2 border-b-black/90',
              side === 'left' && 'left-full top-1/2 -translate-y-1/2 border-l-black/90',
              side === 'right' && 'right-full top-1/2 -translate-y-1/2 border-r-black/90'
            )}
          />
        </div>
      )}
    </div>
  )
}
