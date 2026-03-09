"use client";

import { useTranslations } from "next-intl";
import { VerificationRequestsList } from "@/components/verification-requests/verification-requests-list";

export default function VerificationRequestsPage() {
  const t = useTranslations("verificationRequests");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>
      <VerificationRequestsList />
    </div>
  );
}
