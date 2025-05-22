import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { ChevronDownIcon, ChevronUpIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";

export const Select = SelectPrimitive.Root;

export const SelectTrigger = React.forwardRef(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500",
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon>
      <ChevronDownIcon className="ml-2 h-4 w-4" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));

export const SelectValue = SelectPrimitive.Value;

export const SelectContent = React.forwardRef(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        "z-50 overflow-hidden rounded-md border border-gray-200 bg-white shadow-md",
        className
      )}
      {...props}
    >
      <SelectPrimitive.ScrollUpButton className="flex items-center justify-center py-1">
        <ChevronUpIcon />
      </SelectPrimitive.ScrollUpButton>
      <SelectPrimitive.Viewport className="p-1">{children}</SelectPrimitive.Viewport>
      <SelectPrimitive.ScrollDownButton className="flex items-center justify-center py-1">
        <ChevronDownIcon />
      </SelectPrimitive.ScrollDownButton>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));

export const SelectItem = React.forwardRef(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex items-center rounded-sm px-3 py-2 text-sm outline-none cursor-pointer hover:bg-blue-100",
      className
    )}
    {...props}
  >
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
