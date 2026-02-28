"use client";

import { useState } from "react";
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
import { EditTermDialog } from "@/components/terms/edit-term-dialog";
import { useTerms, useDeleteTerm } from "@/hooks/use-terms";
import { extractApiError } from "@/lib/api/error";
import type { Term } from "@/types";

function stripHtml(html: string): string {
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.textContent || "";
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

export function TermsList() {
  const t = useTranslations("terms");
  const tc = useTranslations("common");

  const { data, isLoading, error } = useTerms();
  const deleteMutation = useDeleteTerm();
  const [termToDelete, setTermToDelete] = useState<Term | null>(null);
  const [termToEdit, setTermToEdit] = useState<Term | null>(null);

  const handleDelete = async () => {
    if (!termToDelete) return;

    try {
      await deleteMutation.mutateAsync(termToDelete.id);
      toast.success(t("deleteSuccess"));
    } catch (err) {
      toast.error(extractApiError(err));
    } finally {
      setTermToDelete(null);
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

  const terms = data?.data ?? [];

  if (terms.length === 0) {
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
              <TableHead>{t("content")}</TableHead>
              <TableHead className="hidden sm:table-cell">
                {t("createdAt")}
              </TableHead>
              <TableHead className="w-24 text-right">{t("actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {terms.map((term) => {
              const plainText = stripHtml(term.terms);
              const truncated =
                plainText.length > 100
                  ? plainText.slice(0, 100) + "..."
                  : plainText;

              return (
                <TableRow key={term.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">{term.id}</TableCell>
                  <TableCell>
                    <span
                      className="line-clamp-2 max-w-[400px] text-sm text-muted-foreground"
                      title={plainText}
                    >
                      {truncated}
                    </span>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(term.createdAt), "dd MMM yyyy")}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setTermToEdit(term)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => setTermToDelete(term)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <AlertDialog
        open={!!termToDelete}
        onOpenChange={(open) => !open && setTermToDelete(null)}
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

      <EditTermDialog
        term={termToEdit}
        open={!!termToEdit}
        onOpenChange={(open) => !open && setTermToEdit(null)}
      />
    </>
  );
}
