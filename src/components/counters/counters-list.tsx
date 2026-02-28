"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import {
  Pencil,
  Trash2,
  Loader2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
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
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PageSizeSelector } from "@/components/shared/page-size-selector";
import { EditCounterDialog } from "@/components/counters/edit-counter-dialog";
import { useCounters, useDeleteCounter } from "@/hooks/use-counters";
import { extractApiError } from "@/lib/api/error";
import type { Counter, SortOrder } from "@/types";

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

export function CountersList() {
  const t = useTranslations("counters");
  const tc = useTranslations("common");

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState("updatedAt");
  const [order, setOrder] = useState<SortOrder>("DESC");

  const { data, isLoading, error } = useCounters({ page, size: pageSize, sortBy, order });
  const deleteMutation = useDeleteCounter();
  const [counterToDelete, setCounterToDelete] = useState<Counter | null>(null);
  const [counterToEdit, setCounterToEdit] = useState<Counter | null>(null);

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
    if (!counterToDelete) return;

    try {
      await deleteMutation.mutateAsync(counterToDelete.id);
      toast.success(t("deleteSuccess"));
    } catch (err) {
      toast.error(extractApiError(err));
    } finally {
      setCounterToDelete(null);
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

  const counters = data?.data ?? [];
  const pagination = data?.pagination;

  if (counters.length === 0 && page === 0) {
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
              <TableHead className="w-16">
                <button
                  onClick={() => handleSort("id")}
                  className="inline-flex items-center font-medium"
                >
                  {t("id")}
                  <SortIcon column="id" currentSort={sortBy} currentOrder={order} />
                </button>
              </TableHead>
              <TableHead>
                <button
                  onClick={() => handleSort("counterName")}
                  className="inline-flex items-center font-medium"
                >
                  {t("name")}
                  <SortIcon column="counterName" currentSort={sortBy} currentOrder={order} />
                </button>
              </TableHead>
              <TableHead>
                <button
                  onClick={() => handleSort("value")}
                  className="inline-flex items-center font-medium"
                >
                  {t("value")}
                  <SortIcon column="value" currentSort={sortBy} currentOrder={order} />
                </button>
              </TableHead>
              <TableHead className="hidden sm:table-cell">
                <button
                  onClick={() => handleSort("createdAt")}
                  className="inline-flex items-center font-medium"
                >
                  {t("createdAt")}
                  <SortIcon column="createdAt" currentSort={sortBy} currentOrder={order} />
                </button>
              </TableHead>
              <TableHead className="hidden sm:table-cell">
                <button
                  onClick={() => handleSort("updatedAt")}
                  className="inline-flex items-center font-medium"
                >
                  {t("updatedAt")}
                  <SortIcon column="updatedAt" currentSort={sortBy} currentOrder={order} />
                </button>
              </TableHead>
              <TableHead className="w-24 text-right">
                {t("actions")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {counters.map((counter) => (
              <TableRow key={counter.id} className="hover:bg-muted/50">
                <TableCell className="font-medium">{counter.id}</TableCell>
                <TableCell>
                  <span className="text-sm font-medium">{counter.counterName}</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm font-semibold tabular-nums">
                    {counter.value.toLocaleString()}
                  </span>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(counter.createdAt), "dd MMM yyyy")}
                  </span>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(counter.updatedAt), "dd MMM yyyy")}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setCounterToEdit(counter)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => setCounterToDelete(counter)}
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
                from: pagination.totalElements === 0 ? 0 : page * pagination.pageSize + 1,
                to: Math.min((page + 1) * pagination.pageSize, pagination.totalElements),
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
                {t("pageOf", { current: page + 1, total: pagination.totalPages })}
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

      <AlertDialog
        open={!!counterToDelete}
        onOpenChange={(open) => !open && setCounterToDelete(null)}
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

      <EditCounterDialog
        counter={counterToEdit}
        open={!!counterToEdit}
        onOpenChange={(open) => !open && setCounterToEdit(null)}
      />
    </>
  );
}
