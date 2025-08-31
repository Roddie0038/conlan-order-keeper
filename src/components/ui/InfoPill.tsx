interface InfoPillProps {
  text: string;
  className?: string;
}

export function InfoPill({ text, className = "" }: InfoPillProps) {
  return (
    <div className={`mt-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-neutral-200 ${className}`}>
      {text}
    </div>
  );
}