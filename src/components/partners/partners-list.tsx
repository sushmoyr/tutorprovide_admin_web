"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { Pencil, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePartners, useDeletePartner } from "@/hooks/use-partners";
import { EditPartnerDialog } from "@/components/partners/edit-partner-dialog";
import { extractApiError } from "@/lib/api/error";
import type { Partner } from "@/types";

function PartnerLogo({ logo, name }: { logo: string; name: string }) {
  const [errored, setErrored] = useState(false);

  if (!logo || errored) {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-xs font-medium text-muted-foreground">
        {name.slice(0, 2).toUpperCase()}
      </div>
    );
  }

  return (
    <div className="relative h-10 w-10 overflow-hidden rounded-lg border bg-white p-1">
      <Image
        src={logo}
        alt={name}
        fill
        sizes="40px"
        className="object-contain p-0.5"
        onError={() => setErrored(true)}
      />
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  );
}

export function PartnersList() {
  const t = useTranslations("partners");
  const tc = useTranslations("common");

  const { data, isLoading, error } = usePartners();
  const deleteMutation = useDeletePartner();
  const [partnerToDelete, setPartnerToDelete] = useState<Partner | null>(null);
  const [partnerToEdit, setPartnerToEdit] = useState<Partner | null>(null);

  const handleDelete = async () => {
    if (!partnerToDelete) return;

    try {
      await deleteMutation.mutateAsync(partnerToDelete.id);
      toast.success(t("deleteSuccess"));
    } catch (err) {
      toast.error(extractApiError(err));
    } finally {
      setPartnerToDelete(null);
    }
  };

  if (isLoading) return <TableSkeleton />;

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
        {extractApiError(error)}
      </div>
    );
  }

  const partners = data?.data ?? [];

  if (partners.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
        <p className="text-muted-foreground">{tc("noResults")}</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border bg-card text-card-foreground">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted hover:bg-muted text-muted-foreground">
              <TableHead className="w-16">{t("id")}</TableHead>
              <TableHead className="w-20">{t("logo")}</TableHead>
              <TableHead>{t("name")}</TableHead>
              <TableHead className="hidden sm:table-cell">
                {t("createdAt")}
              </TableHead>
              <TableHead className="hidden sm:table-cell">
                {t("updatedAt")}
              </TableHead>
              <TableHead className="w-24 text-right">{t("actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {partners.map((partner) => (
              <TableRow key={partner.id} className="hover:bg-muted/50">
                <TableCell className="font-medium">{partner.id}</TableCell>
                <TableCell>
                  <PartnerLogo logo={partner.logo} name={partner.name} />
                </TableCell>
                <TableCell>
                  <span className="text-sm font-medium">{partner.name}</span>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(partner.createdAt), "dd MMM yyyy")}
                  </span>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(partner.updatedAt), "dd MMM yyyy")}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setPartnerToEdit(partner)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => setPartnerToDelete(partner)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog
        open={!!partnerToDelete}
        onOpenChange={(open) => !open && setPartnerToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteConfirmDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tc("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {tc("delete")}
                </>
              ) : (
                tc("delete")
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <EditPartnerDialog
        partner={partnerToEdit}
        open={!!partnerToEdit}
        onOpenChange={(open) => !open && setPartnerToEdit(null)}
      />
    </>
  );
}
