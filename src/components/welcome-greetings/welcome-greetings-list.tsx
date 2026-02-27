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
import { EditWelcomeGreetingDialog } from "@/components/welcome-greetings/edit-welcome-greeting-dialog";
import {
  useWelcomeGreetings,
  useDeleteWelcomeGreeting,
} from "@/hooks/use-welcome-greetings";
import { extractApiError } from "@/lib/api/error";
import type { WelcomeGreeting, WelcomeGreetingType, SortOrder } from "@/types";

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

export function WelcomeGreetingsList() {
  const t = useTranslations("welcomeGreetings");
  const tc = useTranslations("common");

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState("updatedAt");
  const [order, setOrder] = useState<SortOrder>("DESC");
  const [typeFilter, setTypeFilter] = useState<WelcomeGreetingType | "ALL">(
    "ALL"
  );

  const { data, isLoading, error } = useWelcomeGreetings({
    page,
    size: pageSize,
    sortBy,
    order,
    type: typeFilter === "ALL" ? undefined : typeFilter,
  });
  const deleteMutation = useDeleteWelcomeGreeting();
  const [itemToDelete, setItemToDelete] = useState<WelcomeGreeting | null>(
    null
  );
  const [itemToEdit, setItemToEdit] = useState<WelcomeGreeting | null>(null);

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
    if (!itemToDelete) return;

    try {
      await deleteMutation.mutateAsync(itemToDelete.id);
      toast.success(t("deleteSuccess"));
    } catch (err) {
      toast.error(extractApiError(err));
    } finally {
      setItemToDelete(null);
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

  const items = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <>
      {/* Type filter */}
      <div className="flex items-center gap-3">
        <Select
          value={typeFilter}
          onValueChange={(val) => {
            setTypeFilter(val as WelcomeGreetingType | "ALL");
            setPage(0);
          }}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder={t("filterByType")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{t("allTypes")}</SelectItem>
            <SelectItem value="ADMIN">{t("typeAdmin")}</SelectItem>
            <SelectItem value="USER">{t("typeUser")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {items.length === 0 && page === 0 ? (
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
                      <SortIcon
                        column="id"
                        currentSort={sortBy}
                        currentOrder={order}
                      />
                    </button>
                  </TableHead>
                  <TableHead className="w-24">{t("image")}</TableHead>
                  <TableHead>
                    <button
                      onClick={() => handleSort("title")}
                      className="inline-flex items-center font-medium"
                    >
                      {t("titleColumn")}
                      <SortIcon
                        column="title"
                        currentSort={sortBy}
                        currentOrder={order}
                      />
                    </button>
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                    {t("description")}
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">
                    {t("link")}
                  </TableHead>
                  <TableHead>{t("type")}</TableHead>
                  <TableHead className="hidden sm:table-cell">
                    <button
                      onClick={() => handleSort("createdAt")}
                      className="inline-flex items-center font-medium"
                    >
                      {t("createdAt")}
                      <SortIcon
                        column="createdAt"
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
                {items.map((item) => (
                  <TableRow key={item.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{item.id}</TableCell>
                    <TableCell>
                      {item.imageUrl ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <img
                                src={item.imageUrl}
                                alt={item.title}
                                className="h-10 w-16 cursor-pointer rounded object-cover"
                              />
                            </TooltipTrigger>
                            <TooltipContent
                              side="right"
                              sideOffset={8}
                              className="overflow-hidden rounded-lg border bg-background p-1 shadow-lg"
                            >
                              <img
                                src={item.imageUrl}
                                alt={item.title}
                                className="h-48 w-72 rounded object-cover"
                              />
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        <div className="flex h-10 w-16 items-center justify-center rounded bg-muted text-xs text-muted-foreground">
                          N/A
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="max-w-[200px]">
                      <span className="line-clamp-2 text-sm font-medium">
                        {item.title}
                      </span>
                    </TableCell>
                    <TableCell className="hidden max-w-[250px] md:table-cell">
                      <span className="line-clamp-2 text-sm text-muted-foreground">
                        {item.description
                          ?.replace(/<[^>]*>/g, "")
                          .slice(0, 80)}
                      </span>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {item.link ? (
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                        >
                          <ExternalLink className="h-3 w-3 shrink-0" />
                          <span className="max-w-[150px] truncate">
                            {item.link.replace(/^https?:\/\//, "")}
                          </span>
                        </a>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          —
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          item.type === "ADMIN" ? "default" : "secondary"
                        }
                      >
                        {item.type === "ADMIN"
                          ? t("typeAdmin")
                          : t("typeUser")}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(item.createdAt), "dd MMM yyyy")}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setItemToEdit(item)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => setItemToDelete(item)}
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
        open={!!itemToDelete}
        onOpenChange={(open) => !open && setItemToDelete(null)}
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

      <EditWelcomeGreetingDialog
        greeting={itemToEdit}
        open={!!itemToEdit}
        onOpenChange={(open) => !open && setItemToEdit(null)}
      />
    </>
  );
}
