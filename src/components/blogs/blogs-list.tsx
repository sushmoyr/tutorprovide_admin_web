"use client";

import { useState, useEffect } from "react";
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
  Search,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

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
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { PageSizeSelector } from "@/components/shared/page-size-selector";
import {
  useBlogs,
  useDeleteBlog,
  useChangeBlogStatus,
  useBlogCategories,
} from "@/hooks/use-blogs";
import { extractApiError } from "@/lib/api/error";
import type { BlogListItem, BlogStatus, SortOrder } from "@/types";

const STATUS_OPTIONS: BlogStatus[] = ["DRAFT", "PUBLISHED", "ARCHIVED"];

function getStatusColor(status: BlogStatus): string {
  switch (status) {
    case "PUBLISHED":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    case "DRAFT":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
    case "ARCHIVED":
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
  }
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

function StatusBadge({ status }: { status: BlogStatus }) {
  const t = useTranslations("blogs");
  return (
    <Badge variant="outline" className={getStatusColor(status)}>
      {t(`status${status}`)}
    </Badge>
  );
}

export function BlogsList() {
  const t = useTranslations("blogs");
  const tc = useTranslations("common");

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState("updatedAt");
  const [order, setOrder] = useState<SortOrder>("DESC");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<number | undefined>(
    undefined
  );

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(0);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading, error } = useBlogs({
    page,
    size: pageSize,
    sortBy,
    order,
    search: debouncedSearch || undefined,
    categoryId: categoryFilter,
  });
  const { data: categoriesData } = useBlogCategories();
  const deleteMutation = useDeleteBlog();
  const changeStatusMutation = useChangeBlogStatus();
  const [blogToDelete, setBlogToDelete] = useState<BlogListItem | null>(null);

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
    if (!blogToDelete) return;

    try {
      await deleteMutation.mutateAsync(blogToDelete.slug);
      toast.success(t("deleteSuccess"));
    } catch (err) {
      toast.error(extractApiError(err));
    } finally {
      setBlogToDelete(null);
    }
  };

  const handleStatusChange = async (
    blog: BlogListItem,
    newStatus: BlogStatus
  ) => {
    if (newStatus === blog.status) return;

    try {
      await changeStatusMutation.mutateAsync({
        slug: blog.slug,
        status: newStatus,
      });
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

  const blogs = data?.data?.blogs ?? [];
  const pagination = data?.pagination;

  return (
    <>
      {/* Filters row */}
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
        <Select
          value={categoryFilter ? String(categoryFilter) : "ALL"}
          onValueChange={(value) => {
            setCategoryFilter(value === "ALL" ? undefined : Number(value));
            setPage(0);
          }}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder={t("filterByCategory")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{t("allCategories")}</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={String(cat.id)}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {blogs.length === 0 && page === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground">{tc("noResults")}</p>
        </div>
      ) : (
        <>
          <div className="rounded-lg border bg-card text-card-foreground">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted hover:bg-muted text-muted-foreground">
                  <TableHead className="w-20">{t("coverImage")}</TableHead>
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
                    {t("category")}
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">
                    {t("tags")}
                  </TableHead>
                  <TableHead>{t("status")}</TableHead>
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
                {blogs.map((blog) => (
                  <TableRow key={blog.id} className="hover:bg-muted/50">
                    <TableCell>
                      {blog.coverImage ? (
                        <img
                          src={blog.coverImage}
                          alt={blog.title}
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
                        {blog.title}
                      </span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant="secondary">{blog.category.name}</Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {blog.tags.slice(0, 3).map((tag) => (
                          <Badge
                            key={tag.slug}
                            variant="outline"
                            className="text-xs"
                          >
                            {tag.name}
                          </Badge>
                        ))}
                        {blog.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{blog.tags.length - 3} {t("more")}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={blog.status}
                        onValueChange={(value: string) =>
                          handleStatusChange(blog, value as BlogStatus)
                        }
                      >
                        <SelectTrigger
                          size="sm"
                          className="h-7 w-[120px] text-xs"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUS_OPTIONS.map((status) => (
                            <SelectItem key={status} value={status}>
                              <StatusBadge status={status} />
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(blog.createdAt), "dd MMM yyyy")}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          asChild
                        >
                          <Link href={`/blogs/${blog.slug}/edit`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => setBlogToDelete(blog)}
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
        open={!!blogToDelete}
        onOpenChange={(open) => !open && setBlogToDelete(null)}
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
