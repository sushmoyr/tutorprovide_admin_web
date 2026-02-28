"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
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
import { EditDivisionDialog } from "@/components/divisions/edit-division-dialog";
import { useDivisions, useDeleteDivision } from "@/hooks/use-divisions";
import { extractApiError } from "@/lib/api/error";
import type { Division } from "@/types";

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}

export function DivisionsList() {
  const t = useTranslations("divisions");
  const tc = useTranslations("common");

  const { data, isLoading, error } = useDivisions();
  const deleteMutation = useDeleteDivision();
  const [divisionToDelete, setDivisionToDelete] = useState<Division | null>(null);
  const [divisionToEdit, setDivisionToEdit] = useState<Division | null>(null);

  const handleDelete = async () => {
    if (!divisionToDelete) return;

    try {
      await deleteMutation.mutateAsync(divisionToDelete.id);
      toast.success(t("deleteSuccess"));
    } catch (err) {
      toast.error(extractApiError(err));
    } finally {
      setDivisionToDelete(null);
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

  const divisions = data?.data ?? [];

  if (divisions.length === 0) {
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
              <TableHead className="w-16">{t("sl")}</TableHead>
              <TableHead>{t("name")}</TableHead>
              <TableHead className="w-24 text-right">
                {t("actions")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {divisions.map((division, index) => (
              <TableRow key={division.id} className="hover:bg-muted/50">
                <TableCell className="font-medium">{index + 1}</TableCell>
                <TableCell>
                  <span className="text-sm font-medium">{division.name}</span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setDivisionToEdit(division)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => setDivisionToDelete(division)}
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
        open={!!divisionToDelete}
        onOpenChange={(open) => !open && setDivisionToDelete(null)}
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

      <EditDivisionDialog
        division={divisionToEdit}
        open={!!divisionToEdit}
        onOpenChange={(open) => !open && setDivisionToEdit(null)}
      />
    </>
  );
}
