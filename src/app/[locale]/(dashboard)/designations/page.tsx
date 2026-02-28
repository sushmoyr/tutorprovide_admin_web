"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DesignationsList } from "@/components/designations/designations-list";
import { CreateDesignationDialog } from "@/components/designations/create-designation-dialog";

export default function DesignationsPage() {
  const t = useTranslations("designations");
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
      <DesignationsList />
      <CreateDesignationDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
