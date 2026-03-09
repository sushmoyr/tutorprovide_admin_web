"use client";

import { useTranslations } from "next-intl";
import { GuardiansList } from "@/components/guardians/guardians-list";

export default function MaleGuardiansPage() {
  const t = useTranslations("guardians");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("maleGuardiansTitle")}</h1>
        <p className="text-muted-foreground">{t("maleGuardiansSubtitle")}</p>
      </div>
      <GuardiansList gender="MALE" />
    </div>
  );
}
