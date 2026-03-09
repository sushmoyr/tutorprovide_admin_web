"use client";

import { useTranslations } from "next-intl";
import { EmployeesList } from "@/components/employees/employees-list";

export default function EmployeesPage() {
  const t = useTranslations("employees");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>
      </div>
      <EmployeesList />
    </div>
  );
}
