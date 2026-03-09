"use client";

import { useTranslations } from "next-intl";
import { TutorsList } from "@/components/tutors/tutors-list";

export default function FemaleTutorsPage() {
  const t = useTranslations("tutors");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("femaleTutorsTitle")}</h1>
        <p className="text-muted-foreground">{t("femaleTutorsSubtitle")}</p>
      </div>
      <TutorsList gender="FEMALE" />
    </div>
  );
}
