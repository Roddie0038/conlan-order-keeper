import { ReactNode } from "react";

interface SectionBoxProps {
  title: string;
  children: ReactNode;
  tone?: "cyan" | "amber" | "green" | "purple" | "fuchsia" | "blue";
}

export function SectionBox({
  title,
  children,
  tone = "cyan",
}: SectionBoxProps) {
  const toneMap: Record<string, string> = {
    cyan: "ring-cyan-400/40 bg-cyan-500/5",
    amber: "ring-amber-400/40 bg-amber-500/5",
    green: "ring-emerald-400/40 bg-emerald-500/5",
    purple: "ring-violet-400/40 bg-violet-500/5",
    fuchsia: "ring-fuchsia-400/40 bg-fuchsia-500/5",
    blue: "ring-sky-400/40 bg-sky-500/5",
  };

  return (
    <section
      className={`rounded-[22px] border border-white/10 ring-1 ${toneMap[tone]} p-5 shadow-[0_10px_40px_-12px_rgba(0,0,0,0.6)]`}
    >
      <div className="mb-4">
        <h2 className="inline-block rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-sm font-semibold tracking-wide text-white">
          {title.toUpperCase()}
        </h2>
      </div>
      {children}
    </section>
  );
}