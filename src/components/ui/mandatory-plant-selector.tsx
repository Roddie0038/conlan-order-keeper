
// MandatoryPlantSelector.tsx
import * as React from "react";
import { AlertTriangle } from "lucide-react";
import {
  NeoSelect,
  NeoSelectContent,
  NeoSelectItem,
  NeoSelectTrigger,
  NeoSelectValue,
} from "@/components/ui/NeoSelect";
import { Label } from "@/components/ui/label";

export const PLANT_OPTIONS = [
  { value: "Grand Prairie 097", label: "Grand Prairie 097" },
  { value: "Romulus 098", label: "Romulus 098" },
  { value: "Mulberry 099", label: "Mulberry 099" },
] as const;

export type PlantOption = (typeof PLANT_OPTIONS)[number]["value"];

interface MandatoryPlantSelectorProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

export function MandatoryPlantSelector({
  value,
  onChange,
  error,
  disabled = false,
}: MandatoryPlantSelectorProps) {
  // High-contrast trigger that works on LIGHT backgrounds (white card) and still looks good in dark
  const triggerBase =
    [
      "w-full h-11 rounded-xl border shadow-sm transition",
      // Light default: crisp text on white, with clear border
      "bg-white text-slate-900 border-slate-300",
      "placeholder:text-slate-600",
      "hover:border-slate-400",
      // Focus ring for accessibility / visibility
      "focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500",
      // Dark mode fallback if your page flips themes
      "dark:bg-slate-900 dark:text-slate-100 dark:border-slate-600",
      "dark:hover:border-slate-500 dark:placeholder:text-slate-300",
      "dark:focus:ring-cyan-400 dark:focus:border-cyan-400",
      // Disabled state
      "disabled:opacity-70 disabled:cursor-not-allowed",
    ].join(" ");

  const triggerError = error
    ? " border-red-500 focus:ring-red-500 focus:border-red-500 dark:border-red-500 dark:focus:ring-red-400"
    : "";

  const helperId = "destination-plant-helper";
  const errorId = "destination-plant-error";

  return (
    <section className="space-y-4">
      {/* Section title */}
      <div className="flex items-center gap-2">
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
          Destination Plant
        </h3>
      </div>

      {/* High-visibility warning bar */}
      <div className="flex items-start gap-3 p-4 rounded-xl border bg-amber-100 border-amber-300 text-amber-900 shadow-sm
                      dark:bg-amber-900/40 dark:border-amber-500/50 dark:text-amber-100">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700 dark:text-amber-300" />
        <p className="text-sm leading-5">
          <span className="font-semibold">Required:</span> Select the plant this order
          should be routed to. If you’re unsure, contact your warehouse manager.
        </p>
      </div>

      {/* Field label */}
      <Label
        htmlFor="destination-plant"
        className="text-sm font-medium text-slate-800 dark:text-slate-200"
      >
        Select destination plant
      </Label>

      {/* Select control */}
      <NeoSelect
        value={value}
        onValueChange={onChange}
        disabled={disabled}
      >
        <NeoSelectTrigger
          id="destination-plant"
          aria-invalid={!!error}
          aria-describedby={error ? errorId : helperId}
          className={triggerBase + triggerError}
        >
          {/* Ensure placeholder and value are always visible */}
          <NeoSelectValue
            placeholder="Choose a plant…"
            className="text-slate-900 placeholder:text-slate-600 dark:text-slate-100 dark:placeholder:text-slate-300"
          />
        </NeoSelectTrigger>

        <NeoSelectContent
          className="rounded-xl border bg-white text-slate-900 border-slate-200 shadow-lg
                     dark:bg-slate-900 dark:text-slate-100 dark:border-slate-600"
        >
          {PLANT_OPTIONS.map(({ value, label }) => (
            <NeoSelectItem
              key={value}
              value={value}
              className="data-[highlighted]:bg-slate-100 data-[highlighted]:text-slate-900
                         dark:data-[highlighted]:bg-slate-800 dark:data-[highlighted]:text-slate-100"
            >
              {label}
            </NeoSelectItem>
          ))}
        </NeoSelectContent>
      </NeoSelect>

      {/* Helper / error text with strong contrast */}
      {error ? (
        <p id={errorId} className="text-sm font-medium text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : (
        <p id={helperId} className="text-xs text-slate-600 dark:text-slate-300">
          This selection controls routing and notifications.
        </p>
      )}
    </section>
  );
}
