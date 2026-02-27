"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FaqsList } from "@/components/faqs/faqs-list";
import { CreateFaqDialog } from "@/components/faqs/create-faq-dialog";

export default function FaqsPage() {
  const t = useTranslations("faqs");
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
      <FaqsList />
      <CreateFaqDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
