"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface StatCardProps {
  label: string;
  value: number | undefined;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  gradient?: string;
  isLoading?: boolean;
}

export function StatCard({ label, value, icon: Icon, color, bgColor, gradient, isLoading }: StatCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-xl border bg-card p-4 transition-all hover:shadow-md hover:-translate-y-0.5">
      {gradient && (
        <div className={cn("absolute inset-0 bg-gradient-to-br opacity-100 transition-opacity", gradient)} />
      )}
      <div className="relative">
        <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg mb-4", bgColor)}>
          <Icon className={cn("h-4.5 w-4.5", color)} />
        </div>
        {isLoading ? (
          <>
            <Skeleton className="h-7 w-20 mb-1.5" />
            <Skeleton className="h-3.5 w-24" />
          </>
        ) : (
          <>
            <p className="text-2xl font-bold tracking-tight">
              {value?.toLocaleString() ?? "—"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{label}</p>
          </>
        )}
      </div>
    </div>
  );
}
