"use client";

import { useTranslations } from "next-intl";
import { TuitionsList } from "@/components/tuitions/tuitions-list";

export default function PendingTuitionsPage() {
  const t = useTranslations("tuitions");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("pendingTitle")}</h1>
        <p className="text-muted-foreground">{t("pendingSubtitle")}</p>
      </div>
      <TuitionsList status="PENDING_TUITION" />
    </div>
  );
}
