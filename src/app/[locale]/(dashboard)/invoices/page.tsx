"use client";

import { useTranslations } from "next-intl";
import { InvoicesList } from "@/components/invoices/invoices-list";

export default function InvoicesPage() {
  const t = useTranslations("invoices");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>
      <InvoicesList />
    </div>
  );
}
