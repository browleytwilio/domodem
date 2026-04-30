"use client";

import { authClient } from "@/lib/auth-client";
import { useSegmentStore } from "@/stores/segment-store";
import { PERSONAS } from "@/lib/segment/personas";

export interface AccountUser {
  id: string;
  email: string;
  name: string;
  source: "session" | "persona";
}

export function useAccountUser(): {
  user: AccountUser | null;
  isPending: boolean;
} {
  const { data: session, isPending } = authClient.useSession();
  const personaUserId = useSegmentStore((s) => s.userId);
  const personaTraits = useSegmentStore((s) => s.traits);

  if (session?.user) {
    return {
      user: {
        id: session.user.id,
        email: session.user.email ?? "",
        name: session.user.name ?? "",
        source: "session",
      },
      isPending,
    };
  }

  if (personaUserId) {
    const persona = PERSONAS.find((p) => p.userId === personaUserId);
    if (persona) {
      const traitEmail =
        typeof personaTraits.email === "string" ? personaTraits.email : undefined;
      const traitName =
        typeof personaTraits.name === "string" ? personaTraits.name : undefined;
      return {
        user: {
          id: persona.userId,
          email: traitEmail ?? persona.email,
          name: traitName ?? persona.name,
          source: "persona",
        },
        isPending,
      };
    }
  }

  return { user: null, isPending };
}
