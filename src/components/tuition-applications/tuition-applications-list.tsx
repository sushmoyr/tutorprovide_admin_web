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
import { useTuitionApplications } from "@/hooks/use-tuition-applications";
import { extractApiError } from "@/lib/api/error";
import type { SortOrder } from "@/types";
import type { ApplicationStatus, ApplicationUpdateType } from "@/types/tuition-application";

const UPDATE_TYPE_OPTIONS: ApplicationUpdateType[] = [
  "CONFIRM_TUITION",
  "APPOINTED_TUITION",
  "DEMO_CLASS",
  "DUE_PAYMENT",
  "REPOSTED_TUITION",
];

function getStatusColor(status: ApplicationStatus): string {
  switch (status) {
    case "APPLIED":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
    case "SHORTLISTED":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
    case "APPOINTED":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
    case "CONFIRMED":
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

export function TuitionApplicationsList() {
  const t = useTranslations("tuitionApplications");
  const tc = useTranslations("common");

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState("updatedAt");
  const [order, setOrder] = useState<SortOrder>("DESC");
  const [updateTypeFilter, setUpdateTypeFilter] = useState<ApplicationUpdateType | undefined>(
    undefined
  );
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(searchInput);
      setPage(0);
    }, 400);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  const { data, isLoading, error } = useTuitionApplications({
    page,
    size: pageSize,
    sortBy,
    order,
    updateType: updateTypeFilter,
    tuitionCode: search || undefined,
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

  const applications = data?.data ?? [];
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
          value={updateTypeFilter ?? "ALL"}
          onValueChange={(value) => {
            setUpdateTypeFilter(value === "ALL" ? undefined : (value as ApplicationUpdateType));
            setPage(0);
          }}
        >
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder={t("filterByUpdateType")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{t("allUpdateTypes")}</SelectItem>
            {UPDATE_TYPE_OPTIONS.map((type) => (
              <SelectItem key={type} value={type}>
                {t(`updateType_${type}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {applications.length === 0 && page === 0 ? (
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
                  <TableHead>{t("tuitionCode")}</TableHead>
                  <TableHead>{t("tutorName")}</TableHead>
                  <TableHead>{t("tutorPhone")}</TableHead>
                  <TableHead className="hidden md:table-cell">{t("address")}</TableHead>
                  <TableHead>{t("status")}</TableHead>
                  <TableHead>{t("assignedEmployees")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((application) => (
                  <TableRow key={application.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{application.id}</TableCell>
                    <TableCell>
                      <span className="text-sm font-medium">{application.tuitionCode}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{application.tutorName}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {application.tutorPhone}
                      </span>
                    </TableCell>
                    <TableCell className="hidden max-w-[200px] md:table-cell">
                      <span className="text-sm text-muted-foreground">
                        {application.tuitionAddress
                          ? truncate(application.tuitionAddress, 60)
                          : "\u2014"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(application.status)}>
                        {t(`status_${application.status}`)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{application.assignedEmployeeCount}</Badge>
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
