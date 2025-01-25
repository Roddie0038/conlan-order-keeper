import { cn } from "@/lib/utils";

interface TireSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "default" | "lg";
}

export function TireSpinner({ className, size = "default", ...props }: TireSpinnerProps) {
  return (
    <div
      className={cn(
        "relative inline-block animate-spin",
        {
          "w-6 h-6": size === "sm",
          "w-8 h-8": size === "default",
          "w-12 h-12": size === "lg",
        },
        className
      )}
      {...props}
    >
      <svg
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Outer tire circle */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          className="text-primary"
        />
        {/* Inner tire pattern */}
        <g className="text-primary/60">
          {[0, 45, 90, 135, 180, 225, 270, 315].map((rotation) => (
            <line
              key={rotation}
              x1="50"
              y1="15"
              x2="50"
              y2="25"
              stroke="currentColor"
              strokeWidth="6"
              strokeLinecap="round"
              transform={`rotate(${rotation} 50 50)`}
            />
          ))}
        </g>
      </svg>
    </div>
  );
}