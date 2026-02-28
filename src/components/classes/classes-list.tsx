"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  Pencil,
  Trash2,
  Loader2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { PageSizeSelector } from "@/components/shared/page-size-selector";
import { EditClassDialog } from "@/components/classes/edit-class-dialog";
import { useClasses, useDeleteClass } from "@/hooks/use-classes";
import { useCategories } from "@/hooks/use-categories";
import { extractApiError } from "@/lib/api/error";
import type { PreferableClass, SortOrder } from "@/types";

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}

function SortIcon({
  column,
  currentSort,
  currentOrder,
}: {
  column: string;
  currentSort: string;
  currentOrder: SortOrder;
}) {
  if (currentSort !== column) {
    return <ArrowUpDown className="ml-1 h-3 w-3 text-muted-foreground/50" />;
  }
  return currentOrder === "ASC" ? (
    <ArrowUp className="ml-1 h-3 w-3" />
  ) : (
    <ArrowDown className="ml-1 h-3 w-3" />
  );
}

export function ClassesList() {
  const t = useTranslations("classes");
  const tc = useTranslations("common");

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState("name");
  const [order, setOrder] = useState<SortOrder>("DESC");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<number | undefined>(
    undefined
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(searchInput);
      setPage(0);
    }, 400);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  const { data: categoriesData } = useCategories({ size: 1000 });
  const { data, isLoading, error } = useClasses({
    page,
    size: pageSize,
    sortBy,
    order,
    search: search || undefined,
    categoryId: categoryFilter,
  });
  const deleteMutation = useDeleteClass();
  const [classToDelete, setClassToDelete] = useState<PreferableClass | null>(
    null
  );
  const [classToEdit, setClassToEdit] = useState<PreferableClass | null>(null);

  const categories = categoriesData?.data ?? [];

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setOrder(order === "ASC" ? "DESC" : "ASC");
    } else {
      setSortBy(column);
      setOrder("DESC");
    }
    setPage(0);
  };

  const handleDelete = async () => {
    if (!classToDelete) return;

    try {
      await deleteMutation.mutateAsync(classToDelete.id);
      toast.success(t("deleteSuccess"));
    } catch (err) {
      toast.error(extractApiError(err));
    } finally {
      setClassToDelete(null);
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

  const classes = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <>
      <div className="flex items-center gap-4 pb-4">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("searchPlaceholder")}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={categoryFilter ? String(categoryFilter) : "all"}
          onValueChange={(val) => {
            setCategoryFilter(val === "all" ? undefined : Number(val));
            setPage(0);
          }}
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

      {classes.length === 0 && page === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground">{tc("noResults")}</p>
        </div>
      ) : (
        <>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted hover:bg-muted">
                  <TableHead className="w-16">{t("sl")}</TableHead>
                  <TableHead>{t("category")}</TableHead>
                  <TableHead>
                    <button
                      onClick={() => handleSort("name")}
                      className="inline-flex items-center font-medium"
                    >
                      {t("name")}
                      <SortIcon
                        column="name"
                        currentSort={sortBy}
                        currentOrder={order}
                      />
                    </button>
                  </TableHead>
                  <TableHead>
                    <button
                      onClick={() => handleSort("numericValue")}
                      className="inline-flex items-center font-medium"
                    >
                      {t("numericValue")}
                      <SortIcon
                        column="numericValue"
                        currentSort={sortBy}
                        currentOrder={order}
                      />
                    </button>
                  </TableHead>
                  <TableHead className="w-24 text-right">
                    {t("actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classes.map((cls, index) => (
                  <TableRow key={cls.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      {page * pageSize + index + 1}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {cls.preferableCategory.name}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium">{cls.name}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-semibold tabular-nums">
                        {cls.numericValue}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setClassToEdit(cls)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => setClassToDelete(cls)}
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

          {pagination && (
            <div className="flex items-center justify-between pt-4">
              <div className="flex items-center gap-4">
                <p className="text-sm text-muted-foreground">
                  {t("showing", {
                    from:
                      pagination.totalElements === 0
                        ? 0
                        : page * pagination.pageSize + 1,
                    to: Math.min(
                      (page + 1) * pagination.pageSize,
                      pagination.totalElements
                    ),
                    total: pagination.totalElements,
                  })}
                </p>
                <PageSizeSelector
                  value={pageSize}
                  onChange={(size) => {
                    setPageSize(size);
                    setPage(0);
                  }}
                />
              </div>
              {pagination.totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 0}
                  >
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    {t("previous")}
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {t("pageOf", {
                      current: page + 1,
                      total: pagination.totalPages,
                    })}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    disabled={!pagination.hasNext}
                  >
                    {t("next")}
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </>
      )}

      <AlertDialog
        open={!!classToDelete}
        onOpenChange={(open) => !open && setClassToDelete(null)}
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

      <EditClassDialog
        prefClass={classToEdit}
        open={!!classToEdit}
        onOpenChange={(open) => !open && setClassToEdit(null)}
      />
    </>
  );
}
