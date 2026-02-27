"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WelcomeGreetingsList } from "@/components/welcome-greetings/welcome-greetings-list";
import { CreateWelcomeGreetingDialog } from "@/components/welcome-greetings/create-welcome-greeting-dialog";

export default function WelcomeGreetingsPage() {
  const t = useTranslations("welcomeGreetings");
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
      <WelcomeGreetingsList />
      <CreateWelcomeGreetingDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
      />
    </div>
  );
}
