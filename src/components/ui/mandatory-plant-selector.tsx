
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
  { value: "Grand Prairie 097", label: "Grand Prairie 097", color: "text-blue-600 dark:text-blue-400" },
  { value: "Romulus 098", label: "Romulus 098", color: "text-green-600 dark:text-green-400" },
  { value: "Mulberry 099", label: "Mulberry 099", color: "text-purple-600 dark:text-purple-400" },
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
  const triggerBase = [
    "w-full h-11 rounded-xl border shadow-sm transition",
    "bg-white text-slate-900 border-slate-300",
    "placeholder:text-slate-600 hover:border-slate-400",
    "focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500",
    "dark:bg-slate-900 dark:text-slate-100 dark:border-slate-600",
    "dark:hover:border-slate-500 dark:placeholder:text-slate-300",
    "dark:focus:ring-cyan-400 dark:focus:border-cyan-400",
    "disabled:opacity-70 disabled:cursor-not-allowed",
  ].join(" ");

  const triggerError = error
    ? " border-red-500 focus:ring-red-500 focus:border-red-500 dark:border-red-500 dark:focus:ring-red-400"
    : "";

  const helperId = "destination-plant-helper";
  const errorId = "destination-plant-error";

  // Look up the selected plant color to apply it in the trigger
  const selectedPlant = PLANT_OPTIONS.find((p) => p.value === value);

  return (
    <section className="space-y-4">
      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
        Destination Plant
      </h3>

      <div className="flex items-start gap-3 p-4 rounded-xl border bg-amber-100 border-amber-300 text-amber-900 shadow-sm
                      dark:bg-amber-900/40 dark:border-amber-500/50 dark:text-amber-100">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700 dark:text-amber-300" />
        <p className="text-sm leading-5">
          <span className="font-semibold">Required:</span> Select the plant this order
          should be routed to. If you’re unsure, contact your warehouse manager.
        </p>
      </div>

      <Label
        htmlFor="destination-plant"
        className="text-sm font-medium text-slate-800 dark:text-slate-200"
      >
        Select destination plant
      </Label>

      <NeoSelect value={value} onValueChange={onChange} disabled={disabled}>
        <NeoSelectTrigger
          id="destination-plant"
          aria-invalid={!!error}
          aria-describedby={error ? errorId : helperId}
          className={triggerBase + triggerError}
        >
          <NeoSelectValue
            placeholder="Choose a plant…"
            className={selectedPlant ? selectedPlant.color : "text-slate-900 dark:text-slate-100"}
          />
        </NeoSelectTrigger>

        <NeoSelectContent
          className="rounded-xl border bg-white border-slate-200 shadow-lg
                     dark:bg-slate-900 dark:border-slate-600"
        >
          {PLANT_OPTIONS.map(({ value, label, color }) => (
            <NeoSelectItem
              key={value}
              value={value}
              className={`${color} font-medium
                          data-[highlighted]:bg-slate-100 dark:data-[highlighted]:bg-slate-800`}
            >
              {label}
            </NeoSelectItem>
          ))}
        </NeoSelectContent>
      </NeoSelect>

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
