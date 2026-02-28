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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EditCurriculumDialog } from "@/components/curriculum/edit-curriculum-dialog";
import { useCurriculums, useDeleteCurriculum } from "@/hooks/use-curriculum";
import { useCategories } from "@/hooks/use-categories";
import { extractApiError } from "@/lib/api/error";
import type { Curriculum } from "@/types";

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}

export function CurriculumList() {
  const t = useTranslations("curriculum");
  const tc = useTranslations("common");

  const [categoryFilter, setCategoryFilter] = useState<number | undefined>(
    undefined
  );

  const { data: categoriesData } = useCategories({ size: 1000 });
  const { data, isLoading, error } = useCurriculums(categoryFilter);
  const deleteMutation = useDeleteCurriculum();
  const [curriculumToDelete, setCurriculumToDelete] =
    useState<Curriculum | null>(null);
  const [curriculumToEdit, setCurriculumToEdit] = useState<Curriculum | null>(
    null
  );

  const handleDelete = async () => {
    if (!curriculumToDelete) return;

    try {
      await deleteMutation.mutateAsync(curriculumToDelete.id);
      toast.success(t("deleteSuccess"));
    } catch (err) {
      toast.error(extractApiError(err));
    } finally {
      setCurriculumToDelete(null);
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

  const curriculums = data?.data ?? [];
  const categories = categoriesData?.data ?? [];

  return (
    <>
      <div className="flex items-center gap-4 pb-4">
        <Select
          value={categoryFilter ? String(categoryFilter) : "all"}
          onValueChange={(val) =>
            setCategoryFilter(val === "all" ? undefined : Number(val))
          }
        >
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder={t("filterByCategory")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allCategories")}</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={String(cat.id)}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {curriculums.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground">{tc("noResults")}</p>
        </div>
      ) : (
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
              {curriculums.map((curriculum, index) => (
                <TableRow key={curriculum.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell>
                    <span className="text-sm font-medium">
                      {curriculum.name}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setCurriculumToEdit(curriculum)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => setCurriculumToDelete(curriculum)}
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
      )}

      <AlertDialog
        open={!!curriculumToDelete}
        onOpenChange={(open) => !open && setCurriculumToDelete(null)}
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

      <EditCurriculumDialog
        curriculum={curriculumToEdit}
        open={!!curriculumToEdit}
        onOpenChange={(open) => !open && setCurriculumToEdit(null)}
      />
    </>
  );
}
