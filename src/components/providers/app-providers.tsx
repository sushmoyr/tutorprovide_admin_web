"use client";

import type { ReactNode } from "react";
import { ThemeProvider } from "./theme-provider";
import { QueryProvider } from "./query-provider";
import { AbilityProvider } from "./ability-provider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <AbilityProvider>{children}</AbilityProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
