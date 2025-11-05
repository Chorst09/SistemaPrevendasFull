import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const inputVariants = cva(
  "flex h-10 w-full rounded-md px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm transition-all duration-200",
  {
    variants: {
      variant: {
        default: "border border-input bg-background focus-visible:ring-2 focus-visible:ring-accent-cyan focus-visible:ring-offset-2 focus-visible:border-accent-cyan/50",
        success: "border border-success bg-background focus-visible:ring-2 focus-visible:ring-success focus-visible:ring-offset-2 focus-visible:border-success/50",
        error: "border border-destructive bg-background focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-2 focus-visible:border-destructive/50",
        warning: "border border-warning bg-background focus-visible:ring-2 focus-visible:ring-warning focus-visible:ring-offset-2 focus-visible:border-warning/50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface InputProps
  extends React.ComponentProps<"input">,
    VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(inputVariants({ variant, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input, inputVariants }
