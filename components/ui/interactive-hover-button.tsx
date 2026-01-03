import React from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface InteractiveHoverButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
}

const InteractiveHoverButton = React.forwardRef<
  HTMLButtonElement,
  InteractiveHoverButtonProps
>(({ text = "Button", className, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        "group relative cursor-pointer overflow-hidden rounded-full border border-border bg-background px-6 py-3 text-center font-semibold text-foreground transition-all duration-300 hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed",
        className,
      )}
      {...props}
    >
      <span className="relative z-10 inline-block translate-x-0 transition-all duration-300 group-hover:-translate-x-12 group-hover:opacity-0">
        {text}
      </span>
      <div className="absolute top-0 z-10 flex h-full w-full translate-x-12 items-center justify-center gap-2 text-primary-foreground opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
        <span>{text}</span>
        <ArrowRight className="w-4 h-4" />
      </div>
      <div className="absolute left-[50%] top-[50%] h-0 w-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary transition-all duration-300 group-hover:left-[50%] group-hover:top-[50%] group-hover:h-full group-hover:w-full group-hover:scale-[1.5]"></div>
    </button>
  );
});

InteractiveHoverButton.displayName = "InteractiveHoverButton";

export { InteractiveHoverButton };

