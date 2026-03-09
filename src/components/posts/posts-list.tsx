"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { PageSizeSelector } from "@/components/shared/page-size-selector";
import { usePosts } from "@/hooks/use-posts";
import { extractApiError } from "@/lib/api/error";
import type { TuitionStatus, TuitionUrgency, SortOrder } from "@/types";

function getStatusColor(status: TuitionStatus): string {
  switch (status) {
    case "PENDING":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
    case "LIVE":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
    case "CONFIRMED":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    case "CANCELLED":
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
  }
}

function getUrgencyColor(urgency: TuitionUrgency): string {
  switch (urgency) {
    case "URGENT":
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
    case "REGULAR":
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
  }
}

function formatLocation(location?: {
  name: string;
  area?: {
    name: string;
    district?: {
      name: string;
      division?: { name: string };
    };
  };
}): string {
  if (!location) return "-";
  const parts = [location.name];
  if (location.area) {
    parts.push(location.area.name);
    if (location.area.district) {
      parts.push(location.area.district.name);
    }
  }
  return parts.join(", ");
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

export function PostsList() {
  const t = useTranslations("posts");
  const tc = useTranslations("common");

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState("updatedAt");
  const [order, setOrder] = useState<SortOrder>("DESC");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [tuitionCode, setTuitionCode] = useState("");
  const [debouncedTuitionCode, setDebouncedTuitionCode] = useState("");

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(0);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Debounce tuition code filter
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTuitionCode(tuitionCode);
      setPage(0);
    }, 400);
    return () => clearTimeout(timer);
  }, [tuitionCode]);

  const { data, isLoading, error } = usePosts({
    page,
    size: pageSize,
    sortBy,
    order,
    search: debouncedSearch || undefined,
    tuitionCode: debouncedTuitionCode || undefined,
  });

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setOrder(order === "ASC" ? "DESC" : "ASC");
    } else {
      setSortBy(column);
      setOrder("DESC");
    }
    setPage(0);
  };

  if (isLoading) return <TableSkeleton />;

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
        {extractApiError(error)}
      </div>
    );
  }

  const posts = data?.data ?? [];
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
        <Input
          placeholder={t("tuitionCodePlaceholder")}
          value={tuitionCode}
          onChange={(e) => setTuitionCode(e.target.value)}
          className="w-[180px]"
        />
      </div>

      {posts.length === 0 && page === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground">{tc("noResults")}</p>
        </div>
      ) : (
        <>
          <div className="rounded-lg border bg-card text-card-foreground">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted hover:bg-muted text-muted-foreground">
                  <TableHead>{t("tuitionCode")}</TableHead>
                  <TableHead className="w-28">
                    {t("appliedTutors")}
                  </TableHead>
                  <TableHead className="w-28">
                    {t("suggestions")}
                  </TableHead>
                  <TableHead>{t("guardianPhone")}</TableHead>
                  <TableHead className="hidden lg:table-cell">
                    {t("location")}
                  </TableHead>
                  <TableHead>{t("status")}</TableHead>
                  <TableHead className="hidden md:table-cell">
                    {t("urgency")}
                  </TableHead>
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
                  <TableHead className="hidden sm:table-cell">
                    <button
                      onClick={() => handleSort("updatedAt")}
                      className="inline-flex items-center font-medium"
                    >
                      {t("updatedAt")}
                      <SortIcon
                        column="updatedAt"
                        currentSort={sortBy}
                        currentOrder={order}
                      />
                    </button>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((post) => (
                  <TableRow key={post.id} className="hover:bg-muted/50">
                    <TableCell className="font-mono text-sm font-medium">
                      {post.tuitionCode || `J-${post.id}`}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {post.appliedTutors}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {post.suggestedTutors}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{post.guardianPhone}</span>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <span className="text-sm text-muted-foreground">
                        {formatLocation(post.livingLocation)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={getStatusColor(post.status)}
                      >
                        {post.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge
                        variant="outline"
                        className={getUrgencyColor(post.urgency)}
                      >
                        {post.urgency}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(post.createdAt), "dd MMM yyyy")}
                      </span>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(post.updatedAt), "dd MMM yyyy")}
                      </span>
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
    </>
  );
}
