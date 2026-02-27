"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WalkthroughsList } from "@/components/walkthroughs/walkthroughs-list";
import { CreateWalkthroughDialog } from "@/components/walkthroughs/create-walkthrough-dialog";

export default function WalkthroughsPage() {
  const t = useTranslations("walkthroughs");
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
      <WalkthroughsList />
      <CreateWalkthroughDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
