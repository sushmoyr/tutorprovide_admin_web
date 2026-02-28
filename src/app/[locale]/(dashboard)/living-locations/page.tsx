"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LivingLocationsList } from "@/components/living-locations/living-locations-list";
import { CreateLivingLocationDialog } from "@/components/living-locations/create-living-location-dialog";

export default function LivingLocationsPage() {
  const t = useTranslations("livingLocations");
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
      <LivingLocationsList />
      <CreateLivingLocationDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
