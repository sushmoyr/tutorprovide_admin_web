"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import {
  Pencil,
  Trash2,
  ExternalLink,
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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageSizeSelector } from "@/components/shared/page-size-selector";
import { useAds, useDeleteAd, useChangeAdStatus } from "@/hooks/use-ads";
import { EditAdDialog } from "@/components/ads/edit-ad-dialog";
import { extractApiError } from "@/lib/api/error";
import type { Ad, AdStatus, SortOrder } from "@/types";

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "…";
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

function StatusBadge({ status }: { status: AdStatus }) {
  const t = useTranslations("ads");

  const variants: Record<AdStatus, string> = {
    ACTIVE: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    INACTIVE: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
    DELETED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  };

  return (
    <Badge variant="outline" className={variants[status]}>
      {t(`status${status}`)}
    </Badge>
  );
}

export function AdsList() {
  const t = useTranslations("ads");
  const tc = useTranslations("common");

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState("updatedAt");
  const [order, setOrder] = useState<SortOrder>("DESC");

  const { data, isLoading, error } = useAds({ page, size: pageSize, sortBy, order });
  const deleteMutation = useDeleteAd();
  const changeStatusMutation = useChangeAdStatus();
  const [adToDelete, setAdToDelete] = useState<Ad | null>(null);
  const [adToEdit, setAdToEdit] = useState<Ad | null>(null);

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
    if (!adToDelete) return;

    try {
      await deleteMutation.mutateAsync(adToDelete.id);
      toast.success(t("deleteSuccess"));
    } catch (err) {
      toast.error(extractApiError(err));
    } finally {
      setAdToDelete(null);
    }
  };

  const handleStatusChange = async (ad: Ad, newStatus: AdStatus) => {
    if (newStatus === ad.status) return;

    try {
      await changeStatusMutation.mutateAsync({ id: ad.id, status: newStatus });
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

  const ads = data?.data ?? [];
  const pagination = data?.pagination;

  if (ads.length === 0 && page === 0) {
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
                {t("description")}
              </TableHead>
              <TableHead className="hidden lg:table-cell">{t("link")}</TableHead>
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
              <TableHead className="w-24 text-right">
                {t("actions")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ads.map((ad) => (
              <TableRow key={ad.id} className="hover:bg-muted/50">
                <TableCell className="font-medium">{ad.id}</TableCell>
                <TableCell>
                  {ad.imageUrl ? (
                    <img
                      src={ad.imageUrl}
                      alt={ad.title}
                      className="h-10 w-16 rounded object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-16 items-center justify-center rounded bg-muted text-xs text-muted-foreground">
                      N/A
                    </div>
                  )}
                </TableCell>
                <TableCell className="max-w-[200px]">
                  <span className="line-clamp-2 text-sm font-medium">
                    {ad.title}
                  </span>
                </TableCell>
                <TableCell className="hidden max-w-[250px] md:table-cell">
                  <span className="line-clamp-2 text-sm text-muted-foreground">
                    {ad.description ? truncate(ad.description, 100) : "—"}
                  </span>
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  {ad.link ? (
                    <a
                      href={ad.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      <ExternalLink className="h-3 w-3 shrink-0" />
                      <span className="max-w-[150px] truncate">
                        {ad.link.replace(/^https?:\/\//, "")}
                      </span>
                    </a>
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <Select
                    value={ad.status}
                    onValueChange={(value: string) =>
                      handleStatusChange(ad, value as AdStatus)
                    }
                  >
                    <SelectTrigger size="sm" className="h-7 w-[110px] text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">
                        <StatusBadge status="ACTIVE" />
                      </SelectItem>
                      <SelectItem value="INACTIVE">
                        <StatusBadge status="INACTIVE" />
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(ad.createdAt), "dd MMM yyyy")}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setAdToEdit(ad)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => setAdToDelete(ad)}
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
        open={!!adToDelete}
        onOpenChange={(open) => !open && setAdToDelete(null)}
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

      <EditAdDialog
        ad={adToEdit}
        open={!!adToEdit}
        onOpenChange={(open) => !open && setAdToEdit(null)}
      />
    </>
  );
}
