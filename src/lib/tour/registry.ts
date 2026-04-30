import { ADVENTURES } from "./adventures";
import type { Adventure, AdventureId } from "./types";

export function findAdventure(id: AdventureId | string): Adventure | undefined {
  return ADVENTURES.find((a) => a.id === id);
}

export function allAdventures(): Adventure[] {
  return ADVENTURES;
}
