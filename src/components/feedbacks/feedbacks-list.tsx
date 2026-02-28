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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PageSizeSelector } from "@/components/shared/page-size-selector";
import { EditFeedbackDialog } from "@/components/feedbacks/edit-feedback-dialog";
import {
  useFeedbacks,
  useDeleteFeedback,
  useChangeFeedbackStatus,
} from "@/hooks/use-feedbacks";
import { extractApiError } from "@/lib/api/error";
import type { Feedback, FeedbackStatus, SortOrder } from "@/types";

const STATUS_OPTIONS: FeedbackStatus[] = ["PENDING", "LIVE", "CANCELLED"];

function getStatusColor(status: FeedbackStatus): string {
  switch (status) {
    case "PENDING":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
    case "LIVE":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    case "CANCELLED":
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
  }
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "\u2026";
}

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

export function FeedbacksList() {
  const t = useTranslations("feedbacks");
  const tc = useTranslations("common");

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState("updatedAt");
  const [order, setOrder] = useState<SortOrder>("DESC");
  const [statusFilter, setStatusFilter] = useState<FeedbackStatus | undefined>(undefined);

  const { data, isLoading, error } = useFeedbacks({
    page,
    size: pageSize,
    sortBy,
    order,
    status: statusFilter,
  });
  const deleteMutation = useDeleteFeedback();
  const statusMutation = useChangeFeedbackStatus();
  const [feedbackToDelete, setFeedbackToDelete] = useState<Feedback | null>(null);
  const [feedbackToEdit, setFeedbackToEdit] = useState<Feedback | null>(null);

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
    if (!feedbackToDelete) return;

    try {
      await deleteMutation.mutateAsync(feedbackToDelete.id);
      toast.success(t("deleteSuccess"));
    } catch (err) {
      toast.error(extractApiError(err));
    } finally {
      setFeedbackToDelete(null);
    }
  };

  const handleStatusChange = async (feedbackId: number, newStatus: FeedbackStatus) => {
    try {
      await statusMutation.mutateAsync({ id: feedbackId, status: newStatus });
      toast.success(t("statusChangeSuccess"));
    } catch (err) {
      toast.error(extractApiError(err));
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

  const feedbacks = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <>
      <div className="flex items-center gap-4 pb-4">
        <Select
          value={statusFilter ?? "ALL"}
          onValueChange={(value) => {
            setStatusFilter(value === "ALL" ? undefined : (value as FeedbackStatus));
            setPage(0);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t("filterByStatus")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{t("allStatuses")}</SelectItem>
            {STATUS_OPTIONS.map((status) => (
              <SelectItem key={status} value={status}>
                {t(`status.${status}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {feedbacks.length === 0 && page === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground">{tc("noResults")}</p>
        </div>
      ) : (
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
                    {t("createdBy")}
                  </TableHead>
                  <TableHead className="w-28">
                    <button
                      onClick={() => handleSort("rating")}
                      className="inline-flex items-center font-medium"
                    >
                      {t("rating")}
                      <SortIcon column="rating" currentSort={sortBy} currentOrder={order} />
                    </button>
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                    {t("details")}
                  </TableHead>
                  <TableHead className="w-40">
                    {t("statusColumn")}
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
                  <TableHead className="w-24 text-right">
                    {t("actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {feedbacks.map((feedback) => (
                  <TableRow key={feedback.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{feedback.id}</TableCell>
                    <TableCell>
                      <span className="text-sm font-medium">
                        {feedback.createdBy.name}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-yellow-500">
                        {"\u2605".repeat(feedback.rating)}
                      </span>
                      <span className="text-sm text-muted-foreground/30">
                        {"\u2605".repeat(5 - feedback.rating)}
                      </span>
                    </TableCell>
                    <TableCell className="hidden max-w-[300px] md:table-cell">
                      <span className="text-sm text-muted-foreground">
                        {truncate(feedback.details, 80)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={feedback.status}
                        onValueChange={(value) =>
                          handleStatusChange(feedback.id, value as FeedbackStatus)
                        }
                      >
                        <SelectTrigger size="sm" className="h-7 w-[130px]">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(feedback.status)}`}
                          >
                            <SelectValue />
                          </span>
                        </SelectTrigger>
                        <SelectContent>
                          {STATUS_OPTIONS.map((status) => (
                            <SelectItem key={status} value={status}>
                              <span
                                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(status)}`}
                              >
                                {t(`status.${status}`)}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(feedback.createdAt), "dd MMM yyyy")}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setFeedbackToEdit(feedback)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => setFeedbackToDelete(feedback)}
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
        open={!!feedbackToDelete}
        onOpenChange={(open) => !open && setFeedbackToDelete(null)}
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

      <EditFeedbackDialog
        feedback={feedbackToEdit}
        open={!!feedbackToEdit}
        onOpenChange={(open) => !open && setFeedbackToEdit(null)}
      />
    </>
  );
}
