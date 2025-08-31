import { ReactNode } from "react";

interface StickyBarProps {
  children: ReactNode;
}

export function StickyBar({ children }: StickyBarProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-neutral-950/70 backdrop-blur supports-[backdrop-filter]:bg-neutral-950/50">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-end gap-3 px-4 py-3">
        {children}
      </div>
    </div>
  );
}