"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { Pencil, Trash2, ExternalLink, Loader2 } from "lucide-react";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useWalkthroughs, useDeleteWalkthrough } from "@/hooks/use-walkthroughs";
import { EditWalkthroughDialog } from "@/components/walkthroughs/edit-walkthrough-dialog";
import { extractApiError } from "@/lib/api/error";
import type { Walkthrough } from "@/types";

function stripHtml(html: string): string {
  if (typeof document !== "undefined") {
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || div.innerText || "";
  }
  return html.replace(/<[^>]*>/g, "");
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "\u2026";
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

export function WalkthroughsList() {
  const t = useTranslations("walkthroughs");
  const tc = useTranslations("common");

  const { data, isLoading, error } = useWalkthroughs();
  const deleteMutation = useDeleteWalkthrough();
  const [walkthroughToDelete, setWalkthroughToDelete] = useState<Walkthrough | null>(null);
  const [walkthroughToEdit, setWalkthroughToEdit] = useState<Walkthrough | null>(null);

  const handleDelete = async () => {
    if (!walkthroughToDelete) return;

    try {
      await deleteMutation.mutateAsync(walkthroughToDelete.key);
      toast.success(t("deleteSuccess"));
    } catch (err) {
      toast.error(extractApiError(err));
    } finally {
      setWalkthroughToDelete(null);
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

  const walkthroughs = data?.data ?? [];

  if (walkthroughs.length === 0) {
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
              <TableHead>{t("key")}</TableHead>
              <TableHead className="w-24">{t("image")}</TableHead>
              <TableHead>{t("titleColumn")}</TableHead>
              <TableHead className="hidden md:table-cell">
                {t("description")}
              </TableHead>
              <TableHead className="hidden lg:table-cell">
                {t("videoUrl")}
              </TableHead>
              <TableHead className="hidden sm:table-cell">
                {t("createdAt")}
              </TableHead>
              <TableHead className="w-24 text-right">
                {t("actions")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {walkthroughs.map((item) => (
              <TableRow key={item.key} className="hover:bg-muted/50">
                <TableCell>
                  <span className="font-mono text-sm font-medium">
                    {item.key}
                  </span>
                </TableCell>
                <TableCell>
                  {item.imageUrl ? (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="h-10 w-16 cursor-pointer rounded object-cover"
                          />
                        </TooltipTrigger>
                        <TooltipContent
                          side="right"
                          sideOffset={8}
                          className="overflow-hidden rounded-lg border bg-background p-1 shadow-lg"
                        >
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="h-48 w-72 rounded object-cover"
                          />
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : (
                    <div className="flex h-10 w-16 items-center justify-center rounded bg-muted text-xs text-muted-foreground">
                      N/A
                    </div>
                  )}
                </TableCell>
                <TableCell className="max-w-[200px]">
                  <span className="line-clamp-2 text-sm font-medium">
                    {item.title}
                  </span>
                </TableCell>
                <TableCell className="hidden max-w-[250px] md:table-cell">
                  <span className="line-clamp-2 text-sm text-muted-foreground">
                    {truncate(stripHtml(item.description), 100)}
                  </span>
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  {item.videoUrl ? (
                    <a
                      href={item.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      <ExternalLink className="h-3 w-3 shrink-0" />
                      <span className="max-w-[150px] truncate">
                        {item.videoUrl.replace(/^https?:\/\//, "")}
                      </span>
                    </a>
                  ) : (
                    <span className="text-sm text-muted-foreground">&mdash;</span>
                  )}
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(item.createdAt), "dd MMM yyyy")}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setWalkthroughToEdit(item)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => setWalkthroughToDelete(item)}
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
        open={!!walkthroughToDelete}
        onOpenChange={(open) => !open && setWalkthroughToDelete(null)}
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

      <EditWalkthroughDialog
        walkthrough={walkthroughToEdit}
        open={!!walkthroughToEdit}
        onOpenChange={(open) => !open && setWalkthroughToEdit(null)}
      />
    </>
  );
}
