"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Pencil } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EditServiceChargeDialog } from "@/components/settings/edit-service-charge-dialog";
import { useServiceCharges } from "@/hooks/use-service-charges";
import { extractApiError } from "@/lib/api/error";
import type { ServiceCharge } from "@/types";

function formatServiceType(serviceType: string): string {
  return serviceType
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  );
}

export function ServiceChargesList() {
  const t = useTranslations("settings");
  const tc = useTranslations("common");

  const { data, isLoading, error } = useServiceCharges();
  const [chargeToEdit, setChargeToEdit] = useState<ServiceCharge | null>(null);

  if (isLoading) return <TableSkeleton />;

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
        {extractApiError(error)}
      </div>
    );
  }

  const charges = data?.data ?? [];

  if (charges.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
        <p className="text-muted-foreground">{tc("noResults")}</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted hover:bg-muted">
              <TableHead>{t("serviceType")}</TableHead>
              <TableHead>{t("charge")}</TableHead>
              <TableHead className="w-24 text-right">{t("actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {charges.map((charge) => (
              <TableRow key={charge.serviceType} className="hover:bg-muted/50">
                <TableCell className="font-medium">
                  {formatServiceType(charge.serviceType)}
                </TableCell>
                <TableCell>
                  <span className="text-sm">
                    {t("currencyPrefix")}
                    {charge.charge}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setChargeToEdit(charge)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <EditServiceChargeDialog
        serviceCharge={chargeToEdit}
        open={!!chargeToEdit}
        onOpenChange={(open) => !open && setChargeToEdit(null)}
      />
    </>
  );
}
