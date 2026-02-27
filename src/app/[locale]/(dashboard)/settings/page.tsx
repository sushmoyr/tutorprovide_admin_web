"use client";

import { useTranslations } from "next-intl";
import { ServiceChargesList } from "@/components/settings/service-charges-list";

export default function SettingsPage() {
  const t = useTranslations("settings");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>
      <ServiceChargesList />
    </div>
  );
}
