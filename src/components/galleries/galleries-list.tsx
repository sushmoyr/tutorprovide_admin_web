"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
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
import { EditGalleryDialog } from "@/components/galleries/edit-gallery-dialog";
import { useGalleries, useDeleteGallery } from "@/hooks/use-galleries";
import { extractApiError } from "@/lib/api/error";
import type { Gallery } from "@/types";

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "");
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

export function GalleriesList() {
  const t = useTranslations("galleries");
  const tc = useTranslations("common");

  const { data, isLoading, error } = useGalleries();
  const deleteMutation = useDeleteGallery();
  const [galleryToDelete, setGalleryToDelete] = useState<Gallery | null>(null);
  const [galleryToEdit, setGalleryToEdit] = useState<Gallery | null>(null);

  const handleDelete = async () => {
    if (!galleryToDelete) return;

    try {
      await deleteMutation.mutateAsync(galleryToDelete.id);
      toast.success(t("deleteSuccess"));
    } catch (err) {
      toast.error(extractApiError(err));
    } finally {
      setGalleryToDelete(null);
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

  const galleries = data?.data ?? [];

  if (galleries.length === 0) {
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
              <TableHead>{t("images")}</TableHead>
              <TableHead>{t("titleColumn")}</TableHead>
              <TableHead>{t("description")}</TableHead>
              <TableHead>{t("actionLink")}</TableHead>
              <TableHead>{t("videoUrl")}</TableHead>
              <TableHead>{t("sortOrder")}</TableHead>
              <TableHead>{t("videoOnly")}</TableHead>
              <TableHead className="w-24 text-right">{t("actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {galleries.map((gallery) => (
              <TableRow key={gallery.id} className="hover:bg-muted/50">
                <TableCell className="font-medium">{gallery.id}</TableCell>
                <TableCell>
                  {gallery.images?.[0] ? (
                    <img
                      src={gallery.images[0]}
                      alt={gallery.title}
                      className="h-10 w-16 rounded object-cover"
                    />
                  ) : (
                    <span className="text-sm text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <span
                    className="line-clamp-2 max-w-[150px] text-sm font-medium"
                    title={gallery.title}
                  >
                    {gallery.title}
                  </span>
                </TableCell>
                <TableCell>
                  <span
                    className="line-clamp-2 max-w-[200px] text-sm text-muted-foreground"
                    title={stripHtml(gallery.description)}
                  >
                    {stripHtml(gallery.description)}
                  </span>
                </TableCell>
                <TableCell>
                  {gallery.actionLink ? (
                    <a
                      href={gallery.actionLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline dark:text-blue-400"
                    >
                      <ExternalLink className="h-3 w-3" />
                      <span className="max-w-[120px] truncate">
                        {gallery.actionLink}
                      </span>
                    </a>
                  ) : (
                    <span className="text-sm text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {gallery.videoUrl ? (
                    <a
                      href={gallery.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline dark:text-blue-400"
                    >
                      <ExternalLink className="h-3 w-3" />
                      <span className="max-w-[120px] truncate">
                        {gallery.videoUrl}
                      </span>
                    </a>
                  ) : (
                    <span className="text-sm text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <span className="text-sm">{gallery.sortOrder}</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm">
                    {gallery.videoOnly ? tc("yes") : tc("no")}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setGalleryToEdit(gallery)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => setGalleryToDelete(gallery)}
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
        open={!!galleryToDelete}
        onOpenChange={(open) => !open && setGalleryToDelete(null)}
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

      <EditGalleryDialog
        gallery={galleryToEdit}
        open={!!galleryToEdit}
        onOpenChange={(open) => !open && setGalleryToEdit(null)}
      />
    </>
  );
}
