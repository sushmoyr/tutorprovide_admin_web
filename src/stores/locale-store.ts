"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type Locale = "en" | "bn";

interface LocaleState {
  locale: Locale;
  locales: Record<Locale, string>;
  setLocale: (locale: Locale) => void;
}

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      locale: "en",
      locales: { en: "English", bn: "বাংলা" },
      setLocale: (locale) => {
        document.cookie = `locale=${locale};path=/;max-age=31536000`;
        set({ locale });
      },
    }),
    {
      name: "locale-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ locale: state.locale }),
    }
  )
);
