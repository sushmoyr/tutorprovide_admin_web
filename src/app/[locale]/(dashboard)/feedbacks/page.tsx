"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FeedbacksList } from "@/components/feedbacks/feedbacks-list";
import { CreateFeedbackDialog } from "@/components/feedbacks/create-feedback-dialog";

export default function FeedbacksPage() {
  const t = useTranslations("feedbacks");
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
      <FeedbacksList />
      <CreateFeedbackDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
