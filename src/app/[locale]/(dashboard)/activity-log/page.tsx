"use client";

import { useTranslations } from "next-intl";
import { ActivityLogList } from "@/components/activity-log/activity-log-list";

export default function ActivityLogPage() {
  const t = useTranslations("activityLog");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>
      <ActivityLogList />
    </div>
  );
}
