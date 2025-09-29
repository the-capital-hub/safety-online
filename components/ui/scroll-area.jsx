import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export const ScrollArea = forwardRef(function ScrollArea(
        { className, children, orientation = "vertical", ...props },
        ref
) {
        const orientationClasses =
                orientation === "horizontal"
                        ? "overflow-x-auto whitespace-nowrap"
                        : "overflow-y-auto";

        return (
                <div
                        ref={ref}
                        className={cn("relative", orientationClasses, className)}
                        {...props}
                >
                        {children}
                </div>
        );
});
