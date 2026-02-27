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
  Send,
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PageSizeSelector } from "@/components/shared/page-size-selector";
import { useNotices, useDeleteNotice, usePublishNotice } from "@/hooks/use-notices";
import { EditNoticeDialog } from "@/components/notices/edit-notice-dialog";
import { extractApiError } from "@/lib/api/error";
import type { Announcement, AnnouncementStatus, SortOrder } from "@/types";

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
  return text.slice(0, maxLength) + "...";
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

export function NoticesList() {
  const t = useTranslations("notices");
  const tc = useTranslations("common");

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState("updatedAt");
  const [order, setOrder] = useState<SortOrder>("DESC");
  const [statusFilter, setStatusFilter] = useState<AnnouncementStatus | "ALL">("ALL");

  const { data, isLoading, error } = useNotices({
    page,
    size: pageSize,
    sortBy,
    order,
    ...(statusFilter !== "ALL" && { status: statusFilter }),
  });
  const deleteMutation = useDeleteNotice();
  const publishMutation = usePublishNotice();
  const [noticeToDelete, setNoticeToDelete] = useState<Announcement | null>(null);
  const [noticeToEdit, setNoticeToEdit] = useState<Announcement | null>(null);

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
    if (!noticeToDelete) return;

    try {
      await deleteMutation.mutateAsync(noticeToDelete.id);
      toast.success(t("deleteSuccess"));
    } catch (err) {
      toast.error(extractApiError(err));
    } finally {
      setNoticeToDelete(null);
    }
  };

  const handlePublish = async (notice: Announcement) => {
    try {
      await publishMutation.mutateAsync(notice.id);
      toast.success(t("publishSuccess"));
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

  const notices = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <>
      {/* Status filter */}
      <div className="flex items-center gap-3">
        <Select
          value={statusFilter}
          onValueChange={(val) => {
            setStatusFilter(val as AnnouncementStatus | "ALL");
            setPage(0);
          }}
        >
          <SelectTrigger className="w-[160px]" size="sm">
            <SelectValue placeholder={t("filterByStatus")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{t("statusAll")}</SelectItem>
            <SelectItem value="DRAFT">{t("statusDraft")}</SelectItem>
            <SelectItem value="PUBLISHED">{t("statusPublished")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {notices.length === 0 && page === 0 ? (
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
                  <TableHead className="w-24">{t("image")}</TableHead>
                  <TableHead>
                    <button
                      onClick={() => handleSort("title")}
                      className="inline-flex items-center font-medium"
                    >
                      {t("titleColumn")}
                      <SortIcon column="title" currentSort={sortBy} currentOrder={order} />
                    </button>
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                    {t("details")}
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">
                    {t("recipients")}
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">
                    {t("channels")}
                  </TableHead>
                  <TableHead>{t("status")}</TableHead>
                  <TableHead className="hidden sm:table-cell">
                    <button
                      onClick={() => handleSort("createdAt")}
                      className="inline-flex items-center font-medium"
                    >
                      {t("createdAt")}
                      <SortIcon column="createdAt" currentSort={sortBy} currentOrder={order} />
                    </button>
                  </TableHead>
                  <TableHead className="w-28 text-right">
                    {t("actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notices.map((notice) => (
                  <TableRow key={notice.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{notice.id}</TableCell>
                    <TableCell>
                      {notice.imageUrl ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <img
                                src={notice.imageUrl}
                                alt={notice.title}
                                className="h-12 w-20 cursor-pointer rounded object-cover"
                              />
                            </TooltipTrigger>
                            <TooltipContent
                              side="right"
                              sideOffset={8}
                              className="overflow-hidden rounded-lg border bg-background p-1 shadow-lg"
                            >
                              <img
                                src={notice.imageUrl}
                                alt={notice.title}
                                className="h-48 w-72 rounded object-cover"
                              />
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        <div className="flex h-12 w-20 items-center justify-center rounded bg-muted text-xs text-muted-foreground">
                          N/A
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="max-w-[200px]">
                      <span className="line-clamp-2 text-sm font-medium">
                        {notice.title}
                      </span>
                    </TableCell>
                    <TableCell className="hidden max-w-[250px] md:table-cell">
                      <span className="line-clamp-2 text-sm text-muted-foreground">
                        {truncate(stripHtml(notice.details), 100)}
                      </span>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {notice.recipientGroup.map((r) => (
                          <Badge
                            key={r}
                            variant="secondary"
                            className="text-[10px]"
                          >
                            {t(`recipient_${r}`)}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {notice.channels.map((c) => (
                          <Badge
                            key={c}
                            variant="outline"
                            className="text-[10px]"
                          >
                            {t(`channel_${c}`)}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          notice.status === "PUBLISHED"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                        }
                      >
                        {t(`status_${notice.status}`)}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(notice.createdAt), "dd MMM yyyy")}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {notice.status === "DRAFT" && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-green-600 hover:text-green-700"
                                  onClick={() => handlePublish(notice)}
                                  disabled={publishMutation.isPending}
                                >
                                  {publishMutation.isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Send className="h-4 w-4" />
                                  )}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>{t("publish")}</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setNoticeToEdit(notice)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => setNoticeToDelete(notice)}
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
        open={!!noticeToDelete}
        onOpenChange={(open) => !open && setNoticeToDelete(null)}
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

      <EditNoticeDialog
        notice={noticeToEdit}
        open={!!noticeToEdit}
        onOpenChange={(open) => !open && setNoticeToEdit(null)}
      />
    </>
  );
}
