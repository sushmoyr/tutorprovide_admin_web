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
import { EditVideoTutorialDialog } from "@/components/video-tutorials/edit-video-tutorial-dialog";
import {
  useVideoTutorials,
  useDeleteVideoTutorial,
} from "@/hooks/use-video-tutorials";
import { extractApiError } from "@/lib/api/error";
import type { VideoTutorial } from "@/types";

function truncateUrl(url: string, maxLength = 30): string {
  if (!url) return "-";
  return url.length > maxLength ? url.slice(0, maxLength) + "..." : url;
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

export function VideoTutorialsList() {
  const t = useTranslations("videoTutorials");
  const tc = useTranslations("common");

  const { data, isLoading, error } = useVideoTutorials();
  const deleteMutation = useDeleteVideoTutorial();
  const [tutorialToDelete, setTutorialToDelete] =
    useState<VideoTutorial | null>(null);
  const [tutorialToEdit, setTutorialToEdit] = useState<VideoTutorial | null>(
    null
  );

  const handleDelete = async () => {
    if (!tutorialToDelete) return;

    try {
      await deleteMutation.mutateAsync(tutorialToDelete.id);
      toast.success(t("deleteSuccess"));
    } catch (err) {
      toast.error(extractApiError(err));
    } finally {
      setTutorialToDelete(null);
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

  const tutorials = data?.data ?? [];

  if (tutorials.length === 0) {
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
              <TableHead className="w-16">{t("id")}</TableHead>
              <TableHead>{t("register")}</TableHead>
              <TableHead>{t("guardianTutorRequest")}</TableHead>
              <TableHead>{t("tuitionBoard")}</TableHead>
              <TableHead className="hidden sm:table-cell">
                {t("createdAt")}
              </TableHead>
              <TableHead className="w-24 text-right">{t("actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tutorials.map((tutorial) => (
              <TableRow key={tutorial.id} className="hover:bg-muted/50">
                <TableCell className="font-medium">{tutorial.id}</TableCell>
                <TableCell>
                  <span
                    className="text-sm text-muted-foreground"
                    title={tutorial.register}
                  >
                    {truncateUrl(tutorial.register)}
                  </span>
                </TableCell>
                <TableCell>
                  <span
                    className="text-sm text-muted-foreground"
                    title={tutorial.guardianTutorRequest}
                  >
                    {truncateUrl(tutorial.guardianTutorRequest)}
                  </span>
                </TableCell>
                <TableCell>
                  <span
                    className="text-sm text-muted-foreground"
                    title={tutorial.tuitionBoard}
                  >
                    {truncateUrl(tutorial.tuitionBoard)}
                  </span>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(tutorial.createdAt), "dd MMM yyyy")}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setTutorialToEdit(tutorial)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => setTutorialToDelete(tutorial)}
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
        open={!!tutorialToDelete}
        onOpenChange={(open) => !open && setTutorialToDelete(null)}
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

      <EditVideoTutorialDialog
        tutorial={tutorialToEdit}
        open={!!tutorialToEdit}
        onOpenChange={(open) => !open && setTutorialToEdit(null)}
      />
    </>
  );
}
