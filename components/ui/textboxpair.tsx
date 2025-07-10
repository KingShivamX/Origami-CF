"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface TextboxpairProps extends React.HTMLAttributes<HTMLDivElement> {
  onFirstInputChange: (e: string) => void;
  onSecondInputChange: (e: string) => void;
}

const Textboxpair = React.forwardRef<HTMLDivElement, TextboxpairProps>(
  (props, ref) => {
    // Destructure the event handlers and other props separately
    const { onFirstInputChange, onSecondInputChange, ...otherProps } = props;

    return (
      <div ref={ref} className="flex gap-1" {...otherProps}>
        <Modded_input
          type="text"
          placeholder="Oldest Round"
          onChange={(e) => onFirstInputChange(e.target.value)}
        />
        <Modded_input
          type="text"
          placeholder="Newest Round"
          onChange={(e) => onSecondInputChange(e.target.value)}
        />
      </div>
    );
  }
);
Textboxpair.displayName = "Textboxpair";

const Modded_input = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<"input">
>(({ className, type, onChange, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      onChange={onChange}
      ref={ref}
      {...props}
    />
  );
});
Modded_input.displayName = "Modded_input";

export { Textboxpair };
