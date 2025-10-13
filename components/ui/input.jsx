"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { getInputValidationProps } from "@/lib/utils/validation";

const Input = React.forwardRef(
  (
    {
      className,
      type = "text",
      validationKey,
      name,
      id,
      onChange,
      required,
      maxLength,
      ...props
    },
    ref
  ) => {
    const fieldKey = validationKey ?? name ?? id ?? "";

    const { attributes, sanitize } = React.useMemo(
      () =>
        getInputValidationProps(fieldKey, {
          type,
          required: Boolean(required),
          name,
          maxLength,
        }),
      [fieldKey, type, required, name, maxLength]
    );

    const handleChange = React.useCallback(
      (event) => {
        if (typeof sanitize === "function") {
          const nextValue = sanitize(event.target.value);
          if (nextValue !== event.target.value) {
            const cursor = event.target.selectionStart;
            event.target.value = nextValue;
            if (typeof cursor === "number") {
              const newPosition = Math.min(nextValue.length, cursor);
              try {
                event.target.setSelectionRange(newPosition, newPosition);
              } catch (_error) {
                // Some input types (like number) do not support setSelectionRange.
              }
            }
          }
        }
        onChange?.(event);
      },
      [onChange, sanitize]
    );

    return (
      <input
        type={type}
        {...attributes}
        {...props}
        name={name ?? attributes.name}
        required={required}
        maxLength={maxLength ?? attributes.maxLength}
        pattern={props.pattern ?? attributes.pattern}
        inputMode={props.inputMode ?? attributes.inputMode}
        autoComplete={props.autoComplete ?? attributes.autoComplete}
        title={props.title ?? attributes.title}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        onChange={handleChange}
        ref={ref}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
