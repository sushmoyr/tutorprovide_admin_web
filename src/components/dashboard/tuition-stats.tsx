"use client";

import { useTranslations } from "next-intl";
import {
  BookOpen,
  Clock,
  Radio,
  ListChecks,
  UserCheck,
  CheckCircle2,
  XCircle,
  TrendingUp,
} from "lucide-react";
import { useTuitionCount } from "@/hooks/use-dashboard";
import { StatCard } from "./stat-card";
import { Skeleton } from "@/components/ui/skeleton";

export function TuitionStats() {
  const t = useTranslations("dashboard");
  const { data, isLoading } = useTuitionCount();

  const cards = [
    { label: t("pendingTuitions"), value: data?.pendingTuitions, icon: Clock, color: "text-warning", bgColor: "bg-warning-bg", gradient: "from-warning/5 to-transparent" },
    { label: t("liveTuitions"), value: data?.liveTuitions, icon: Radio, color: "text-success", bgColor: "bg-success-bg", gradient: "from-success/5 to-transparent" },
    { label: t("shortlistedTuitions"), value: data?.shortlistedTuitions, icon: ListChecks, color: "text-info", bgColor: "bg-info-bg", gradient: "from-info/5 to-transparent" },
    { label: t("appointedTuitions"), value: data?.appointedTuitions, icon: UserCheck, color: "text-purple", bgColor: "bg-purple-bg", gradient: "from-purple/5 to-transparent" },
    { label: t("confirmedTuitions"), value: data?.confirmedTuitions, icon: CheckCircle2, color: "text-success", bgColor: "bg-success-bg", gradient: "from-success/5 to-transparent" },
    { label: t("cancelledTuitions"), value: data?.cancelledTuitions, icon: XCircle, color: "text-error", bgColor: "bg-error-bg", gradient: "from-error/5 to-transparent" },
  ];

  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-primary/10">
          <BookOpen className="h-4 w-4 text-brand-primary" />
        </div>
        <div>
          <h2 className="text-base font-semibold leading-tight">{t("tuitionOverview")}</h2>
        </div>
        {/* Total badge */}
        <div className="ml-auto flex items-center gap-1.5 rounded-full bg-brand-primary/10 px-3 py-1">
          <TrendingUp className="h-3.5 w-3.5 text-brand-primary" />
          {isLoading ? (
            <Skeleton className="h-4 w-12" />
          ) : (
            <span className="text-sm font-semibold text-brand-primary">
              {data?.totalTuitions?.toLocaleString()} {t("total")}
            </span>
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {cards.map((card) => (
          <StatCard key={card.label} {...card} isLoading={isLoading} />
        ))}
      </div>
    </section>
  );
}
