"use client";

import { useTranslations } from "next-intl";
import { TuitionsList } from "@/components/tuitions/tuitions-list";

export default function TuitionsPage() {
  const t = useTranslations("tuitions");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>
      <TuitionsList />
    </div>
  );
}
