"use client";

import { useTranslations } from "next-intl";
import { TuitionApplicationsList } from "@/components/tuition-applications/tuition-applications-list";

export default function UpdatesPage() {
  const t = useTranslations("tuitionApplications");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>
      <TuitionApplicationsList />
    </div>
  );
}
