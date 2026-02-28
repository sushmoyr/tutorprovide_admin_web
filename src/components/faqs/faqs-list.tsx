"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { Pencil, Trash2, Loader2, ExternalLink } from "lucide-react";
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
import { EditFaqDialog } from "@/components/faqs/edit-faq-dialog";
import { useFaqs, useDeleteFaq } from "@/hooks/use-faqs";
import { extractApiError } from "@/lib/api/error";
import type { FAQ } from "@/types";

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  );
}

export function FaqsList() {
  const t = useTranslations("faqs");
  const tc = useTranslations("common");

  const { data, isLoading, error } = useFaqs();
  const deleteMutation = useDeleteFaq();
  const [faqToDelete, setFaqToDelete] = useState<FAQ | null>(null);
  const [faqToEdit, setFaqToEdit] = useState<FAQ | null>(null);

  const handleDelete = async () => {
    if (!faqToDelete) return;

    try {
      await deleteMutation.mutateAsync(faqToDelete.id);
      toast.success(t("deleteSuccess"));
    } catch (err) {
      toast.error(extractApiError(err));
    } finally {
      setFaqToDelete(null);
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

  const faqs = data?.data ?? [];

  if (faqs.length === 0) {
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
              <TableHead>{t("question")}</TableHead>
              <TableHead>{t("answer")}</TableHead>
              <TableHead>{t("link")}</TableHead>
              <TableHead className="hidden sm:table-cell">
                {t("createdAt")}
              </TableHead>
              <TableHead className="w-24 text-right">{t("actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {faqs.map((faq) => (
              <TableRow key={faq.id} className="hover:bg-muted/50">
                <TableCell className="font-medium">{faq.id}</TableCell>
                <TableCell>
                  <span
                    className="line-clamp-2 max-w-[200px] text-sm font-medium"
                    title={faq.question}
                  >
                    {faq.question}
                  </span>
                </TableCell>
                <TableCell>
                  <span
                    className="line-clamp-2 max-w-[250px] text-sm text-muted-foreground"
                    title={faq.answer}
                  >
                    {faq.answer}
                  </span>
                </TableCell>
                <TableCell>
                  {faq.link ? (
                    <a
                      href={faq.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline dark:text-blue-400"
                    >
                      <ExternalLink className="h-3 w-3" />
                      <span className="max-w-[150px] truncate">
                        {faq.link}
                      </span>
                    </a>
                  ) : (
                    <span className="text-sm text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(faq.createdAt), "dd MMM yyyy")}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setFaqToEdit(faq)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => setFaqToDelete(faq)}
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
        open={!!faqToDelete}
        onOpenChange={(open) => !open && setFaqToDelete(null)}
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

      <EditFaqDialog
        faq={faqToEdit}
        open={!!faqToEdit}
        onOpenChange={(open) => !open && setFaqToEdit(null)}
      />
    </>
  );
}
