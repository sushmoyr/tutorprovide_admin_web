"use client";

import { useTranslations } from "next-intl";
import { TutorsList } from "@/components/tutors/tutors-list";

export default function MaleTutorsPage() {
  const t = useTranslations("tutors");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("maleTutorsTitle")}</h1>
        <p className="text-muted-foreground">{t("maleTutorsSubtitle")}</p>
      </div>
      <TutorsList gender="MALE" />
    </div>
  );
}
