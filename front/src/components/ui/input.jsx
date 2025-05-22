import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef(({ className, type = "text", ...props }, ref) => (
  <input
    type={type}
    ref={ref}
    className={cn(
      "flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500",
      className
    )}
    {...props}
  />
));
Input.displayName = "Input";
