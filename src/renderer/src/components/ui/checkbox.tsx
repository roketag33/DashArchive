import * as React from "react"
import { cn } from "../../lib/utils"
import { Check } from "lucide-react"

const Checkbox = React.forwardRef<
    HTMLInputElement,
    Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> & {
        onCheckedChange?: (checked: boolean) => void
        checked?: boolean
    }
>(({ className, onCheckedChange, ...props }, ref) => (
    <div className="relative flex items-center">
        <input
            type="checkbox"
            ref={ref}
            onChange={(e) => onCheckedChange?.(e.target.checked)}
            className={cn(
                "peer h-4 w-4 shrink-0 appearance-none rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 checked:bg-primary checked:text-primary-foreground",
                className
            )}
            {...props}
        />
        <Check className="absolute left-0 top-0 h-4 w-4 hidden peer-checked:block text-primary-foreground pointer-events-none" />
    </div>
))
Checkbox.displayName = "Checkbox"

export { Checkbox }
