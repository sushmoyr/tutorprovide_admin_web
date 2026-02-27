"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
  Pencil,
  Plus,
  Trash2,
  User,
  Calendar,
  Hash,
  FileText,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PageSizeSelector } from "@/components/shared/page-size-selector";
import { useAuditSnapshots } from "@/hooks/use-audit";
import { extractApiError } from "@/lib/api/error";
import { cn } from "@/lib/utils";
import type { AuditSnapshot } from "@/types";

function snapshotTypeInfo(type: string) {
  switch (type) {
    case "INITIAL":
      return {
        label: "Created",
        icon: Plus,
        iconBg: "border-emerald-400 text-emerald-600 dark:border-emerald-500 dark:text-emerald-400",
        labelColor: "text-emerald-600 dark:text-emerald-400",
      };
    case "UPDATE":
      return {
        label: "Updated",
        icon: Pencil,
        iconBg: "border-amber-400 text-amber-600 dark:border-amber-500 dark:text-amber-400",
        labelColor: "text-amber-600 dark:text-amber-400",
      };
    case "TERMINAL":
      return {
        label: "Deleted",
        icon: Trash2,
        iconBg: "border-red-400 text-red-600 dark:border-red-500 dark:text-red-400",
        labelColor: "text-red-600 dark:text-red-400",
      };
    default:
      return {
        label: type,
        icon: Pencil,
        iconBg: "border-gray-400 text-gray-600 dark:border-gray-500 dark:text-gray-400",
        labelColor: "text-gray-600 dark:text-gray-400",
      };
  }
}

function formatEntityType(type: string): string {
  const parts = type.split(".");
  const name = parts[parts.length - 1] ?? type;
  return name.replace(/([a-z])([A-Z])/g, "$1 $2");
}

function SnapshotDetailDialog({
  snapshot,
  open,
  onOpenChange,
}: {
  snapshot: AuditSnapshot | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations("activityLog");

  if (!snapshot) return null;

  const info = snapshotTypeInfo(snapshot.snapshotType);
  const Icon = info.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full border-2 bg-background",
                info.iconBg
              )}
            >
              <Icon className="h-3.5 w-3.5" />
            </div>
            <span className={cn("text-base font-semibold", info.labelColor)}>
              {info.label}
            </span>
            <span className="text-base font-semibold">
              {formatEntityType(snapshot.entityType)} #{snapshot.entityId}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 rounded-md bg-muted/50 px-3 py-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">{t("author")}</p>
                <p className="text-sm font-medium">
                  {snapshot.authorName || snapshot.author || t("system")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-md bg-muted/50 px-3 py-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">{t("date")}</p>
                <p className="text-sm font-medium">
                  {format(new Date(snapshot.commitDate), "dd MMM yyyy, hh:mm a")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-md bg-muted/50 px-3 py-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">{t("entityType")}</p>
                <p className="text-sm font-medium">
                  {formatEntityType(snapshot.entityType)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-md bg-muted/50 px-3 py-2">
              <Hash className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">{t("version")}</p>
                <p className="text-sm font-medium">{snapshot.version}</p>
              </div>
            </div>
          </div>

          {/* Changed properties */}
          <div>
            <p className="mb-1.5 text-xs font-medium text-muted-foreground">
              {t("changedProperties")}
            </p>
            {snapshot.changedProperties.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {snapshot.changedProperties.map((prop) => (
                  <Badge
                    key={prop}
                    variant="outline"
                    className="text-xs font-normal"
                  >
                    {prop}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{t("noChanges")}</p>
            )}
          </div>

          {/* State snapshot */}
          {snapshot.state && Object.keys(snapshot.state).length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-medium text-muted-foreground">
                {t("stateSnapshot")}
              </p>
              <pre className="max-h-64 overflow-auto rounded-md bg-muted p-3 text-xs">
                {JSON.stringify(snapshot.state, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function TimelineSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <Skeleton className="h-5 w-24 shrink-0" />
          <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-72" />
            <Skeleton className="h-4 w-56" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ActivityLogList() {
  const t = useTranslations("activityLog");
  const tc = useTranslations("common");

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  const [authorDraft, setAuthorDraft] = useState("");
  const [propertyDraft, setPropertyDraft] = useState("");
  const [fromDraft, setFromDraft] = useState("");
  const [toDraft, setToDraft] = useState("");

  const [appliedAuthor, setAppliedAuthor] = useState("");
  const [appliedProperty, setAppliedProperty] = useState("");
  const [appliedFrom, setAppliedFrom] = useState("");
  const [appliedTo, setAppliedTo] = useState("");

  const [selectedSnapshot, setSelectedSnapshot] = useState<AuditSnapshot | null>(null);

  const hasActiveFilters = !!(
    appliedAuthor ||
    appliedProperty ||
    appliedFrom ||
    appliedTo
  );

  const { data, isLoading, error } = useAuditSnapshots({
    page,
    size: pageSize,
    author: appliedAuthor || undefined,
    changedProperty: appliedProperty || undefined,
    from: appliedFrom ? new Date(appliedFrom).toISOString() : undefined,
    to: appliedTo
      ? new Date(appliedTo + "T23:59:59").toISOString()
      : undefined,
  });

  const applyFilters = () => {
    setAppliedAuthor(authorDraft.trim());
    setAppliedProperty(propertyDraft.trim());
    setAppliedFrom(fromDraft);
    setAppliedTo(toDraft);
    setPage(0);
  };

  const clearFilters = () => {
    setAuthorDraft("");
    setPropertyDraft("");
    setFromDraft("");
    setToDraft("");
    setAppliedAuthor("");
    setAppliedProperty("");
    setAppliedFrom("");
    setAppliedTo("");
    setPage(0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") applyFilters();
  };

  if (isLoading) return <TimelineSkeleton />;

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
        {extractApiError(error)}
      </div>
    );
  }

  const snapshots = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <>
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium">{t("author")}</span>
        <Input
          placeholder={t("filterByAuthor")}
          value={authorDraft}
          onChange={(e) => setAuthorDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          className="h-9 w-40"
        />
        <span className="text-sm font-medium">{t("changedProperty")}</span>
        <Input
          placeholder={t("filterByProperty")}
          value={propertyDraft}
          onChange={(e) => setPropertyDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          className="h-9 w-36"
        />
        <span className="text-sm font-medium">{t("from")}</span>
        <Input
          type="date"
          value={fromDraft}
          onChange={(e) => setFromDraft(e.target.value)}
          className="h-9 w-40"
        />
        <span className="text-sm font-medium">{t("to")}</span>
        <Input
          type="date"
          value={toDraft}
          onChange={(e) => setToDraft(e.target.value)}
          className="h-9 w-40"
        />
        <Button size="sm" className="h-9" onClick={applyFilters}>
          <Filter className="mr-1.5 h-3.5 w-3.5" />
          {t("apply")}
        </Button>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="h-9"
            onClick={clearFilters}
          >
            <X className="mr-1.5 h-3.5 w-3.5" />
            {t("clear")}
          </Button>
        )}
      </div>

      {/* Timeline */}
      {snapshots.length === 0 && page === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground">{tc("noResults")}</p>
        </div>
      ) : (
        <>
          <div className="relative">
            {snapshots.map((snapshot, idx) => {
              const info = snapshotTypeInfo(snapshot.snapshotType);
              const Icon = info.icon;
              const isLast = idx === snapshots.length - 1;

              return (
                <button
                  type="button"
                  key={`${snapshot.entityType}-${snapshot.entityId}-${snapshot.version}-${idx}`}
                  className="flex w-full gap-0 text-left transition-colors hover:bg-muted/40 rounded-lg -mx-2 px-2 cursor-pointer"
                  onClick={() => setSelectedSnapshot(snapshot)}
                >
                  {/* Date column */}
                  <div className="w-28 shrink-0 pt-1 text-right pr-4">
                    <p className="text-sm font-medium">
                      {format(new Date(snapshot.commitDate), "dd MMM yyyy")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(snapshot.commitDate), "hh:mm a")}
                    </p>
                  </div>

                  {/* Timeline icon + line */}
                  <div className="relative flex flex-col items-center">
                    <div
                      className={cn(
                        "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 bg-background",
                        info.iconBg
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    {!isLast && (
                      <div className="w-px flex-1 bg-border" />
                    )}
                  </div>

                  {/* Content */}
                  <div className={cn("flex-1 pl-4", !isLast ? "pb-8" : "pb-2")}>
                    {/* Action badge + Entity */}
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "text-sm font-semibold",
                          info.labelColor
                        )}
                      >
                        {info.label}
                      </span>
                      <span className="text-sm font-semibold">
                        {formatEntityType(snapshot.entityType)} #{snapshot.entityId}
                      </span>
                    </div>

                    {/* Message */}
                    {snapshot.message && (
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {snapshot.message}
                      </p>
                    )}

                    {/* Author + Changed properties */}
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-sm">
                      <span className="inline-flex items-center gap-1 text-muted-foreground">
                        <User className="h-3.5 w-3.5" />
                        {snapshot.authorName ||
                          snapshot.author ||
                          t("system")}
                      </span>
                      {snapshot.changedProperties.length > 0 ? (
                        <>
                          <span className="text-muted-foreground/50">·</span>
                          {snapshot.changedProperties
                            .slice(0, 3)
                            .map((prop) => (
                              <Badge
                                key={prop}
                                variant="outline"
                                className="text-[11px] font-normal"
                              >
                                {prop}
                              </Badge>
                            ))}
                          {snapshot.changedProperties.length > 3 && (
                            <Badge
                              variant="outline"
                              className="text-[11px] font-normal"
                            >
                              +{snapshot.changedProperties.length - 3}
                            </Badge>
                          )}
                        </>
                      ) : (
                        <>
                          <span className="text-muted-foreground/50">·</span>
                          <span className="text-sm text-muted-foreground/60">
                            {t("noChanges")}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Pagination */}
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
      <SnapshotDetailDialog
        snapshot={selectedSnapshot}
        open={!!selectedSnapshot}
        onOpenChange={(open) => !open && setSelectedSnapshot(null)}
      />
    </>
  );
}
