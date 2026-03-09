"use client";

import { useTranslations } from "next-intl";
import { TuitionsList } from "@/components/tuitions/tuitions-list";

export default function ConfirmedTuitionsPage() {
  const t = useTranslations("tuitions");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("confirmedTitle")}</h1>
        <p className="text-muted-foreground">{t("confirmedSubtitle")}</p>
      </div>
      <TuitionsList status="CONFIRMED_TUITION" />
    </div>
  );
}
