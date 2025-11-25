import * as React from "react"
import { cn } from "@/lib/utils/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "warning" | "destructive"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
        {
          "border-transparent bg-primary text-primary-foreground": variant === "default",
          "border-transparent bg-green-500 text-white": variant === "success",
          "border-transparent bg-yellow-500 text-white": variant === "warning",
          "border-transparent bg-red-500 text-white": variant === "destructive",
        },
        className
      )}
      {...props}
    />
  )
}

export { Badge }

