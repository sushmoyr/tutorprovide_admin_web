"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PageSizeSelector } from "@/components/shared/page-size-selector";
import { useVerificationRequests } from "@/hooks/use-verification-requests";
import { extractApiError } from "@/lib/api/error";
import type { SortOrder } from "@/types";
import type { ApplicationReviewStatus } from "@/types/premium-request";

const STATUS_OPTIONS: ApplicationReviewStatus[] = [
  "PENDING",
  "IN_REVIEW",
  "PENDING_PAYMENT",
  "APPROVED",
  "REJECTED",
];

function getStatusColor(status: ApplicationReviewStatus): string {
  switch (status) {
    case "APPROVED":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    case "REJECTED":
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
    case "PENDING":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
    case "IN_REVIEW":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
    case "PENDING_PAYMENT":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
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

export function VerificationRequestsList() {
  const t = useTranslations("verificationRequests");
  const tc = useTranslations("common");

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState("updatedAt");
  const [order, setOrder] = useState<SortOrder>("DESC");
  const [statusFilter, setStatusFilter] = useState<ApplicationReviewStatus | undefined>(undefined);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(searchInput);
      setPage(0);
    }, 400);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  const { data, isLoading, error } = useVerificationRequests({
    page,
    size: pageSize,
    sortBy,
    order,
    status: statusFilter,
    search: search || undefined,
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

  const requests = data?.data ?? [];
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
          value={statusFilter ?? "ALL"}
          onValueChange={(value) => {
            setStatusFilter(value === "ALL" ? undefined : (value as ApplicationReviewStatus));
            setPage(0);
          }}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder={t("filterByStatus")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{t("allStatuses")}</SelectItem>
            {STATUS_OPTIONS.map((status) => (
              <SelectItem key={status} value={status}>
                {t(`status_${status}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {requests.length === 0 && page === 0 ? (
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
                  <TableHead>{t("tutorId")}</TableHead>
                  <TableHead>{t("status")}</TableHead>
                  <TableHead>{t("description")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{request.id}</TableCell>
                    <TableCell>
                      <span className="text-sm font-medium">T-{request.tutorId}</span>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(request.status)}>
                        {t(`status_${request.status}`)}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[400px]">
                      <span className="text-sm text-muted-foreground">
                        {request.description ? truncate(request.description, 80) : "\u2014"}
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
    </>
  );
}
