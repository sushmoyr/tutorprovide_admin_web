"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import {
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { PageSizeSelector } from "@/components/shared/page-size-selector";
import { useTuitions, useDeleteTuition } from "@/hooks/use-tuitions";
import { extractApiError } from "@/lib/api/error";
import type { TuitionSummary, TuitionStatus, TuitionUrgency, TuitionStatusFilter, SortOrder } from "@/types";

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

function getStatusColor(status: TuitionStatus): string {
  switch (status) {
    case "PENDING":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
    case "LIVE":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    case "CONFIRMED":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
    case "CANCELLED":
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
  }
}

function getUrgencyColor(urgency: TuitionUrgency): string {
  switch (urgency) {
    case "URGENT":
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
    case "REGULAR":
      return "";
  }
}

function formatLocation(location?: TuitionSummary["livingLocation"]): string {
  if (!location) return "—";
  const parts: string[] = [location.name];
  if (location.area) {
    parts.push(location.area.name);
    if (location.area.district) {
      parts.push(location.area.district.name);
    }
  }
  return parts.join(", ");
}

interface TuitionsListProps {
  status?: TuitionStatusFilter;
}

export function TuitionsList({ status }: TuitionsListProps) {
  const t = useTranslations("tuitions");
  const tc = useTranslations("common");

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState("updatedAt");
  const [order, setOrder] = useState<SortOrder>("DESC");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(0);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading, error } = useTuitions({
    page,
    size: pageSize,
    sortBy,
    order,
    status,
    search: debouncedSearch || undefined,
  });
  const deleteMutation = useDeleteTuition();
  const [tuitionToDelete, setTuitionToDelete] = useState<TuitionSummary | null>(null);

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
    if (!tuitionToDelete) return;

    try {
      await deleteMutation.mutateAsync(tuitionToDelete.id);
      toast.success(t("deleteSuccess"));
    } catch (err) {
      toast.error(extractApiError(err));
    } finally {
      setTuitionToDelete(null);
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

  const tuitions = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <>
      {/* Search filter */}
      <div className="flex flex-wrap items-center gap-3 pb-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={tc("search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {tuitions.length === 0 && page === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground">{tc("noResults")}</p>
        </div>
      ) : (
        <>
          <div className="rounded-lg border bg-card text-card-foreground">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted hover:bg-muted text-muted-foreground">
                  <TableHead>
                    <button
                      onClick={() => handleSort("tuitionCode")}
                      className="inline-flex items-center font-medium"
                    >
                      {t("tuitionCode")}
                      <SortIcon column="tuitionCode" currentSort={sortBy} currentOrder={order} />
                    </button>
                  </TableHead>
                  <TableHead className="text-center">{t("appliedTutors")}</TableHead>
                  <TableHead className="text-center">{t("suggestedTutors")}</TableHead>
                  <TableHead className="text-center">{t("assignedEmployees")}</TableHead>
                  <TableHead>{t("guardianPhone")}</TableHead>
                  <TableHead className="hidden lg:table-cell">{t("location")}</TableHead>
                  <TableHead>{t("urgency")}</TableHead>
                  {!status && <TableHead>{t("status")}</TableHead>}
                  <TableHead className="hidden sm:table-cell">
                    <button
                      onClick={() => handleSort("createdAt")}
                      className="inline-flex items-center font-medium"
                    >
                      {t("createdAt")}
                      <SortIcon column="createdAt" currentSort={sortBy} currentOrder={order} />
                    </button>
                  </TableHead>
                  <TableHead className="w-20 text-right">{t("actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tuitions.map((tuition) => (
                  <TableRow key={tuition.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      {tuition.tuitionCode || `J-${tuition.id}`}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">{tuition.appliedTutors}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">{tuition.suggestedTutors}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">{tuition.assignedEmployees}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{tuition.guardianPhone}</span>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <span className="text-sm text-muted-foreground">
                        {formatLocation(tuition.livingLocation)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getUrgencyColor(tuition.urgency)}>
                        {t(`urgency${tuition.urgency}`)}
                      </Badge>
                    </TableCell>
                    {!status && (
                      <TableCell>
                        <Badge variant="outline" className={getStatusColor(tuition.status)}>
                          {t(`status${tuition.status}`)}
                        </Badge>
                      </TableCell>
                    )}
                    <TableCell className="hidden sm:table-cell">
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(tuition.createdAt), "dd MMM yyyy")}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => setTuitionToDelete(tuition)}
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
        </>
      )}

      <AlertDialog
        open={!!tuitionToDelete}
        onOpenChange={(open) => !open && setTuitionToDelete(null)}
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
    </>
  );
}
