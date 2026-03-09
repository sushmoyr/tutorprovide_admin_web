"use client";

import { useTranslations } from "next-intl";
import { PremiumRequestsList } from "@/components/premium-requests/premium-requests-list";

export default function PremiumRequestsPage() {
  const t = useTranslations("premiumRequests");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>
      <PremiumRequestsList />
    </div>
  );
}
