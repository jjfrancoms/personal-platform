import * as React from "react";
import { cn } from "../utils";

export interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "success";
  size?: "sm" | "md" | "lg";
}

export const GlassButton = React.forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ className, variant = "secondary", size = "md", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-semibold rounded-full transition-all duration-200 active:scale-[0.97] outline-none disabled:opacity-50 disabled:pointer-events-none select-none backdrop-blur-xl",
          // Sizes
          size === "sm" && "px-3.5 py-1.5 text-xs gap-1.5",
          size === "md" && "px-5 py-2 text-xs gap-2",
          size === "lg" && "px-6 py-2.5 text-sm gap-2.5",
          // Variants
          variant === "primary" && "bg-gradient-to-r from-amber-500/90 to-orange-500/90 hover:from-amber-400 hover:to-orange-400 text-white border border-amber-300/40 shadow-[0_8px_20px_rgba(245,158,11,0.35),inset_0_1px_1px_rgba(255,255,255,0.4)]",
          variant === "secondary" && "bg-white/[0.07] hover:bg-white/[0.14] text-slate-100 border border-white/[0.18] hover:border-white/[0.3] shadow-[0_8px_20px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.25)]",
          variant === "ghost" && "text-slate-300 hover:bg-white/[0.08] hover:text-white border border-transparent",
          variant === "danger" && "bg-red-500/20 hover:bg-red-500/35 text-red-200 border border-red-500/40 shadow-[0_8px_20px_rgba(239,68,68,0.2)]",
          variant === "success" && "bg-emerald-500/20 hover:bg-emerald-500/35 text-emerald-200 border border-emerald-500/40 shadow-[0_8px_20px_rgba(16,185,129,0.2)]",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

GlassButton.displayName = "GlassButton";
