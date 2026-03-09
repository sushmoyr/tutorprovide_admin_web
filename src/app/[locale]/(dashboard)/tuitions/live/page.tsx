"use client";

import { useTranslations } from "next-intl";
import { TuitionsList } from "@/components/tuitions/tuitions-list";

export default function LiveTuitionsPage() {
  const t = useTranslations("tuitions");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("liveTitle")}</h1>
        <p className="text-muted-foreground">{t("liveSubtitle")}</p>
      </div>
      <TuitionsList status="PROCESSING_TUITION" />
    </div>
  );
}
