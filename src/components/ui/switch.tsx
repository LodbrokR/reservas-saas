"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
    onCheckedChange?: (checked: boolean) => void
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
    ({ className, onCheckedChange, onChange, ...props }, ref) => {
        return (
            <label className="relative inline-flex items-center cursor-pointer">
                <input
                    type="checkbox"
                    ref={ref}
                    className="sr-only peer"
                    onChange={(e) => {
                        onChange?.(e)
                        onCheckedChange?.(e.target.checked)
                    }}
                    {...props}
                />
                <div className={cn(
                    "w-9 h-5 bg-input rounded-full peer peer-checked:bg-primary transition-colors",
                    "after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4",
                    className
                )} />
            </label>
        )
    }
)
Switch.displayName = "Switch"

export { Switch }
