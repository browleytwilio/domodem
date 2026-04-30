import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import type { Persona } from "@/lib/segment/personas";
import type { analytics } from "@/lib/segment/bus";

export type AdventureId =
  | "meet-sarah"
  | "build-audience"
  | "tracking-plan"
  | "cart-rescue";

export type SurfaceId = "web" | "mobile" | "kiosk";

export type BeatAdvance = "click" | "auto" | { onEvent: string };

export interface TourContext {
  router: Pick<AppRouterInstance, "push" | "replace">;
  analytics: typeof analytics;
  findPersona: (id: string) => Persona | undefined;
}

export type Beat =
  | { kind: "narrate"; copy: string; advance: "click" }
  | {
      kind: "spotlight";
      target: string;
      copy: string;
      advance: BeatAdvance;
    }
  | {
      kind: "action";
      do: (ctx: TourContext) => Promise<void>;
      copy: string;
      advance: "auto";
    }
  | {
      kind: "multi-surface";
      focus: SurfaceId;
      copy: string;
      advance: BeatAdvance;
    }
  | {
      kind: "recap";
      bullets: string[];
      ctas: Array<{ label: string; href: string; external?: boolean }>;
    };

export interface Adventure {
  id: AdventureId;
  title: string;
  tagline: string;
  estMinutes: number;
  difficulty: "foundational" | "advanced";
  icon: "identity" | "audience" | "tracking" | "rescue";
  beats: Beat[];
}
