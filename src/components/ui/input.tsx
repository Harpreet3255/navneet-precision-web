import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends React.ComponentProps<"input"> {
  error?: boolean;
  helperText?: string;
  id?: string; // ID is required for a11y linking
}

/**
 * WCAG 2.2 Input Component
 * - aria-invalid: Dynamically alerts screen readers of error states.
 * - aria-describedby: Links the input to helper/error text.
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, helperText, id, ...props }, ref) => {
    // Generate a unique ID if none is provided but helper text exists
    const inputId = id || React.useId();
    const helperId = `${inputId}-helper`;

    return (
      <div className="w-full relative flex flex-col gap-1">
        <input
          id={inputId}
          type={type}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={helperText ? helperId : props["aria-describedby"]}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            error && "border-destructive focus-visible:ring-destructive",
            className
          )}
          ref={ref}
          {...props}
        />
        {helperText && (
          <span 
            id={helperId}
            role={error ? "alert" : "status"}
            aria-live="polite"
            className={cn(
              "text-xs font-medium",
              error ? "text-destructive" : "text-muted-foreground"
            )}
          >
            {helperText}
          </span>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
