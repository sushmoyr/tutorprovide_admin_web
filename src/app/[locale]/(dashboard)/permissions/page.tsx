"use client";

import { useTranslations } from "next-intl";
import { PermissionsList } from "@/components/permissions/permissions-list";

export default function PermissionsPage() {
  const t = useTranslations("permissions");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>
      <PermissionsList />
    </div>
  );
}
