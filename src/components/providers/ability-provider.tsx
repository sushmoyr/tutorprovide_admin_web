"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { createContextualCan } from "@casl/react";
import {
  defaultAbility,
  buildAbilityFor,
  type AppAbility,
} from "@/lib/auth/ability";
import { useAuthStore } from "@/stores/auth-store";

const AbilityContext = createContext<AppAbility>(defaultAbility);

export const Can = createContextualCan(AbilityContext.Consumer);

export function AbilityProvider({ children }: { children: ReactNode }) {
  const [ability, setAbility] = useState<AppAbility>(defaultAbility);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (user?.permissions) {
      setAbility(buildAbilityFor(user.permissions));
    } else {
      setAbility(defaultAbility);
    }
  }, [user]);

  return (
    <AbilityContext value={ability}>{children}</AbilityContext>
  );
}

export function useAbility() {
  return useContext(AbilityContext);
}
