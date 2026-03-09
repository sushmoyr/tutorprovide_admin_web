"use client";

import { useTranslations } from "next-intl";
import { GuardiansList } from "@/components/guardians/guardians-list";

export default function GuardiansPage() {
  const t = useTranslations("guardians");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>
      <GuardiansList />
    </div>
  );
}
