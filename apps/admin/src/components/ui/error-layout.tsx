"use client";

import { cn } from "@repo/ui/lib/utils";

interface ErrorLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function ErrorLayout({ children, className }: ErrorLayoutProps) {
  return (
    <div className={cn(
      "min-h-screen flex items-center justify-center bg-muted/30 px-4",
      className
    )}>
      {children}
    </div>
  );
}