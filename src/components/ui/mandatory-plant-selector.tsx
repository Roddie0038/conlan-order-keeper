
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
import { Label } from "@/components/ui/label"; // kept for consistency; used for the field label

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
  const triggerBase =
    "w-full h-11 rounded-xl border transition shadow-sm " +
    // backgrounds / text made explicit for dark or image backgrounds
    "bg-slate-900/90 text-slate-100 " +
    // borders & hover
    "border-slate-500/60 hover:bg-slate-900 " +
    // placeholder & value text
    "[&>*]:text-slate-100 placeholder:text-slate-300 " +
    // focus ring
    "focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 " +
    // disabled
    "disabled:opacity-70 disabled:cursor-not-allowed";

  const triggerError = error
    ? " border-red-500 focus:ring-red-400 focus:border-red-500"
    : "";

  return (
    <section className="space-y-4">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-100">
          Destination Plant
        </h3>
      </div>

      {/* High-visibility warning */}
      <div className="flex items-start gap-3 p-4 rounded-xl border bg-amber-900/40 border-amber-500/50">
        <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-300 flex-shrink-0" />
        <p className="text-sm leading-5 text-amber-100">
          <span className="font-semibold">Required:</span> Select the plant this
          order should be routed to. If you’re unsure, contact your warehouse
          manager.
        </p>
      </div>

      {/* Field label */}
      <Label
        htmlFor="destination-plant"
        className="text-sm font-medium text-slate-200"
      >
        Select destination plant
      </Label>

      {/* Select control with strong contrast */}
      <NeoSelect
        value={value}
        onValueChange={onChange}
        disabled={disabled}
      >
        <NeoSelectTrigger
          id="destination-plant"
          aria-invalid={!!error}
          className={triggerBase + triggerError}
        >
          <NeoSelectValue
            placeholder="Choose a plant…"
            // ensure placeholder has contrast
            className="text-slate-300"
          />
        </NeoSelectTrigger>

        <NeoSelectContent
          className="rounded-xl border border-slate-600/60 bg-slate-900/95 backdrop-blur-md
                     text-slate-100 shadow-lg"
        >
          {PLANT_OPTIONS.map((plant) => (
            <NeoSelectItem
              key={plant.value}
              value={plant.value}
              className="data-[highlighted]:bg-slate-800 data-[highlighted]:text-slate-100"
            >
              {plant.label}
            </NeoSelectItem>
          ))}
        </NeoSelectContent>
      </NeoSelect>

      {/* Helper / error text */}
      {error ? (
        <p className="text-sm font-medium text-red-400">{error}</p>
      ) : (
        <p className="text-xs text-slate-300">
          This selection controls routing and notifications.
        </p>
      )}
    </section>
  );
}
