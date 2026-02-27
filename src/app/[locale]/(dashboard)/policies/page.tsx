"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PoliciesList } from "@/components/policies/policies-list";
import { CreatePolicyDialog } from "@/components/policies/create-policy-dialog";

export default function PoliciesPage() {
  const t = useTranslations("policies");
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {t("addNew")}
        </Button>
      </div>
      <PoliciesList />
      <CreatePolicyDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
