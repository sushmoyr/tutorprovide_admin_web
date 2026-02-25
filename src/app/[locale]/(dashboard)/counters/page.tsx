"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CountersList } from "@/components/counters/counters-list";
import { CreateCounterDialog } from "@/components/counters/create-counter-dialog";

export default function CountersPage() {
  const t = useTranslations("counters");
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
      <CountersList />
      <CreateCounterDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
