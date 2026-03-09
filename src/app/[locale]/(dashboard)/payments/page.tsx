"use client";

import { useTranslations } from "next-intl";
import { PaymentsList } from "@/components/payments/payments-list";

export default function PaymentsPage() {
  const t = useTranslations("payments");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>
      <PaymentsList />
    </div>
  );
}
