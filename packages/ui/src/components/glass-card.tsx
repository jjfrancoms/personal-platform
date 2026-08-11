import * as React from "react";
import { cn } from "../utils";

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  glow?: boolean;
}

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, hoverable = false, glow = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "backdrop-blur-3xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/[0.18] shadow-[0_24px_64px_-12px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.3)] rounded-[32px] transition-all duration-300 overflow-hidden",
          hoverable && "hover:from-white/[0.12] hover:to-white/[0.04] hover:border-white/[0.28] hover:shadow-[0_32px_80px_-16px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.4)] hover:-translate-y-1",
          glow && "relative before:absolute before:inset-0 before:rounded-[32px] before:bg-radial from-amber-500/10 via-transparent to-transparent before:pointer-events-none before:z-0",
          className
        )}
        {...props}
      >
        <div className="relative z-10 w-full h-full">{children}</div>
      </div>
    );
  }
);

GlassCard.displayName = "GlassCard";
