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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PageSizeSelector } from "@/components/shared/page-size-selector";
import { useBanners, useDeleteBanner } from "@/hooks/use-banners";
import { EditBannerDialog } from "@/components/banners/edit-banner-dialog";
import { extractApiError } from "@/lib/api/error";
import type { Banner, SortOrder } from "@/types";

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

export function BannersList() {
  const t = useTranslations("banners");
  const tc = useTranslations("common");

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState("updatedAt");
  const [order, setOrder] = useState<SortOrder>("DESC");

  const { data, isLoading, error } = useBanners({ page, size: pageSize, sortBy, order });
  const deleteMutation = useDeleteBanner();
  const [bannerToDelete, setBannerToDelete] = useState<Banner | null>(null);
  const [bannerToEdit, setBannerToEdit] = useState<Banner | null>(null);

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
    if (!bannerToDelete) return;

    try {
      await deleteMutation.mutateAsync(bannerToDelete.id);
      toast.success(t("deleteSuccess"));
    } catch (err) {
      toast.error(extractApiError(err));
    } finally {
      setBannerToDelete(null);
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

  const banners = data?.data ?? [];
  const pagination = data?.pagination;

  if (banners.length === 0 && page === 0) {
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
              <TableHead className="w-24">{t("image")}</TableHead>
              <TableHead className="hidden lg:table-cell">{t("link")}</TableHead>
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
            {banners.map((banner) => (
              <TableRow key={banner.id} className="hover:bg-muted/50">
                <TableCell className="font-medium">{banner.id}</TableCell>
                <TableCell className="max-w-[200px]">
                  <span className="line-clamp-2 text-sm font-medium">
                    {banner.title}
                  </span>
                </TableCell>
                <TableCell className="hidden max-w-[250px] md:table-cell">
                  <span className="line-clamp-2 text-sm text-muted-foreground">
                    {truncate(stripHtml(banner.description), 100)}
                  </span>
                </TableCell>
                <TableCell>
                  {banner.imageUrl ? (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <img
                            src={banner.imageUrl}
                            alt={banner.title}
                            className="h-12 w-20 cursor-pointer rounded object-cover"
                          />
                        </TooltipTrigger>
                        <TooltipContent
                          side="right"
                          sideOffset={8}
                          className="overflow-hidden rounded-lg border bg-background p-1 shadow-lg"
                        >
                          <img
                            src={banner.imageUrl}
                            alt={banner.title}
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
                <TableCell className="hidden lg:table-cell">
                  {banner.link ? (
                    <a
                      href={banner.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      <ExternalLink className="h-3 w-3 shrink-0" />
                      <span className="max-w-[150px] truncate">
                        {banner.link.replace(/^https?:\/\//, "")}
                      </span>
                    </a>
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(banner.createdAt), "dd MMM yyyy")}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setBannerToEdit(banner)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => setBannerToDelete(banner)}
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
        open={!!bannerToDelete}
        onOpenChange={(open) => !open && setBannerToDelete(null)}
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

      <EditBannerDialog
        banner={bannerToEdit}
        open={!!bannerToEdit}
        onOpenChange={(open) => !open && setBannerToEdit(null)}
      />
    </>
  );
}
