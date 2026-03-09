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
import { usePayments } from "@/hooks/use-payments";
import { extractApiError } from "@/lib/api/error";
import type { SortOrder } from "@/types";
import type { PaymentChannel } from "@/types/payment";

const CHANNEL_OPTIONS: PaymentChannel[] = [
  "CASH",
  "SSLCOMMERZ",
  "BKASH",
  "BKASH_PERSONAL",
  "NAGAD_PERSONAL",
  "ROCKET_PERSONAL",
];

function getChannelColor(channel: PaymentChannel): string {
  switch (channel) {
    case "CASH":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    case "SSLCOMMERZ":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
    case "BKASH":
    case "BKASH_PERSONAL":
      return "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400";
    case "NAGAD_PERSONAL":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
    case "ROCKET_PERSONAL":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
  }
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

export function PaymentsList() {
  const t = useTranslations("payments");
  const tc = useTranslations("common");

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState("transactionDate");
  const [order, setOrder] = useState<SortOrder>("DESC");
  const [channelFilter, setChannelFilter] = useState<PaymentChannel | undefined>(undefined);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(searchInput);
      setPage(0);
    }, 400);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  const { data, isLoading, error } = usePayments({
    page,
    size: pageSize,
    sortBy,
    order,
    paymentChannel: channelFilter,
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

  const payments = data?.data ?? [];
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
          value={channelFilter ?? "ALL"}
          onValueChange={(value) => {
            setChannelFilter(value === "ALL" ? undefined : (value as PaymentChannel));
            setPage(0);
          }}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder={t("filterByChannel")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{t("allChannels")}</SelectItem>
            {CHANNEL_OPTIONS.map((channel) => (
              <SelectItem key={channel} value={channel}>
                {t(`channel_${channel}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {payments.length === 0 && page === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground">{tc("noResults")}</p>
        </div>
      ) : (
        <>
          <div className="rounded-lg border bg-card text-card-foreground">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted hover:bg-muted text-muted-foreground">
                  <TableHead>{t("transactionId")}</TableHead>
                  <TableHead>{t("paymentChannel")}</TableHead>
                  <TableHead>
                    <button
                      onClick={() => handleSort("amount")}
                      className="inline-flex items-center font-medium"
                    >
                      {t("amount")}
                      <SortIcon column="amount" currentSort={sortBy} currentOrder={order} />
                    </button>
                  </TableHead>
                  <TableHead>
                    <button
                      onClick={() => handleSort("transactionDate")}
                      className="inline-flex items-center font-medium"
                    >
                      {t("transactionDate")}
                      <SortIcon column="transactionDate" currentSort={sortBy} currentOrder={order} />
                    </button>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment, index) => (
                  <TableRow key={payment.transactionId ?? index} className="hover:bg-muted/50">
                    <TableCell>
                      <span className="text-sm font-medium">
                        {payment.transactionId ?? "N/A"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge className={getChannelColor(payment.paymentChannel)}>
                        {t(`channel_${payment.paymentChannel}`)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-semibold tabular-nums">
                        ৳ {payment.amount}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(payment.transactionDate), "dd MMM yyyy, hh:mm a")}
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
