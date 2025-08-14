import { z } from 'zod';

export const PLANTS = [
  'Grand Prairie 097',
  'Romulus 098',
  'Mulberry 099',
] as const;
export type PlantName = typeof PLANTS[number];

const CITY_0XX = /^(?:[A-Za-z]+(?:\s[A-Za-z]+)*)\s0\d{2}$/; // "City 0XX"

export const baseOrderSchema = z.object({
  // legacy destination fields (required in your app; keep as-is if your handler expects them)
  store: z.string().regex(CITY_0XX, 'Destination store must be normalized (City 0XX)'),
  plant: z.string().min(1),

  // new cross-plant (nullable on server for non-elevated)
  ordering_store: z.string().regex(CITY_0XX).nullable().optional(),
  ordering_plant: z.enum(PLANTS).nullable().optional(),
  destination_plant: z.enum(PLANTS).nullable().optional(),

  // passthrough for other fields; refine on your side if you want stricter checks
}).passthrough();

export type OrderPayload = z.infer<typeof baseOrderSchema>;

export function scrubCrossPlantForNonElevated<T extends Record<string, any>>(body: T) {
  return {
    ...body,
    ordering_store: null,
    ordering_plant: null,
    destination_plant: null,
  };
}

export function assertCrossPlantConsistency(p: OrderPayload) {
  // If any cross-plant field is set, all three must be set.
  const anySet = p.ordering_store || p.ordering_plant || p.destination_plant;
  const allSet = !!(p.ordering_store && p.ordering_plant && p.destination_plant);
  if (anySet && !allSet) {
    throw new Error('Cross-plant fields must be provided together (ordering_store, ordering_plant, destination_plant).');
  }
}
