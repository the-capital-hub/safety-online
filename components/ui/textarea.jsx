import * as React from "react";

import { cn } from "@/lib/utils";
import { getInputValidationProps } from "@/lib/utils/validation";

const Textarea = React.forwardRef(
  (
    {
      className,
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
          type: "textarea",
          required: Boolean(required),
          name,
          maxLength,
        }),
      [fieldKey, required, name, maxLength]
    );

    const handleChange = React.useCallback(
      (event) => {
        if (typeof sanitize === "function") {
          const nextValue = sanitize(event.target.value);
          if (nextValue !== event.target.value) {
            event.target.value = nextValue;
          }
        }
        onChange?.(event);
      },
      [onChange, sanitize]
    );

    return (
      <textarea
        {...attributes}
        {...props}
        name={name ?? attributes.name}
        required={required}
        maxLength={maxLength ?? attributes.maxLength}
        className={cn(
          "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        onChange={handleChange}
        ref={ref}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
