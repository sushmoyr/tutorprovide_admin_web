"use client";

import { useTranslations } from "next-intl";
import { CalendarDays, Sparkles } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";

export function WelcomeBanner() {
  const t = useTranslations("dashboard");
  const user = useAuthStore((s) => s.user);

  const now = new Date();
  const hour = now.getHours();
  const timeGreeting =
    hour < 12 ? t("goodMorning") : hour < 17 ? t("goodAfternoon") : t("goodEvening");

  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-primary via-brand-primary/90 to-brand-secondary p-6 md:px-8 md:py-7 text-white">
      {/* Decorative shapes */}
      <div className="absolute -top-12 -right-12 h-48 w-48 rounded-full bg-white/10 blur-sm" />
      <div className="absolute top-8 right-20 h-24 w-24 rounded-full bg-white/5" />
      <div className="absolute -bottom-8 -left-8 h-36 w-36 rounded-full bg-white/[0.07]" />
      <div className="absolute bottom-4 left-1/3 h-14 w-14 rounded-full bg-white/5" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Sparkles className="h-4 w-4 text-yellow-300" />
            <span className="text-sm font-medium text-white/80">{timeGreeting}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            {t("welcomeBack")}, {user?.name ?? "Admin"}
          </h1>
          <p className="mt-1.5 text-sm text-white/60 max-w-lg">
            {t("bannerSubtitle")}
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-white/10 backdrop-blur-sm px-4 py-2.5 text-sm shrink-0 self-start">
          <CalendarDays className="h-4 w-4 text-white/70" />
          <span className="text-white/90 font-medium">{dateStr}</span>
        </div>
      </div>
    </div>
  );
}
