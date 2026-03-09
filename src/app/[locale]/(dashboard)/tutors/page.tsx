"use client";

import { useTranslations } from "next-intl";
import { TutorsList } from "@/components/tutors/tutors-list";

export default function TutorsPage() {
  const t = useTranslations("tutors");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>
      <TutorsList />
    </div>
  );
}
