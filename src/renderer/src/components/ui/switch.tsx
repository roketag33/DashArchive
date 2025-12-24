import * as React from 'react'
import { cn } from '../../lib/utils'

// Minimal custom implementation without radix-ui for speed/simplicity
export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value'> {
  onCheckedChange?: (checked: boolean) => void
  checked?: boolean
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, onCheckedChange, onChange, ...props }, ref) => {
    return (
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          className="peer sr-only"
          ref={ref}
          onChange={(e) => {
            onCheckedChange?.(e.target.checked)
            onChange?.(e)
          }}
          {...props}
        />
        <div
          className={cn(
            "w-11 h-6 bg-input peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-ring rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-background after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-background after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary",
            className
          )}
        ></div>
      </label>
    )
  }
)
Switch.displayName = 'Switch'

export { Switch }
