"use client";

import { useTranslations } from "next-intl";
import { useAuthStore } from "@/stores/auth-store";

export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const user = useAuthStore((state) => state.user);

  return (
    <div>
      <h1 className="text-2xl font-bold">{t("title")}</h1>
      <p className="text-muted-foreground mt-1">
        {t("welcome")}, {user?.name ?? "Admin"}
      </p>
    </div>
  );
}
