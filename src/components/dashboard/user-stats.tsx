"use client";

import { useTranslations } from "next-intl";
import { GraduationCap, Users } from "lucide-react";
import { useTutorCount, useGuardianCount } from "@/hooks/use-dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface SegmentBarProps {
  segments: { label: string; value: number; color: string }[];
  total: number;
  isLoading: boolean;
}

function SegmentBar({ segments, total, isLoading }: SegmentBarProps) {
  if (isLoading) {
    return <Skeleton className="h-3 w-full rounded-full" />;
  }

  return (
    <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted">
      {segments.map((seg) => {
        const pct = total > 0 ? (seg.value / total) * 100 : 0;
        return (
          <div
            key={seg.label}
            className={cn("h-full transition-all", seg.color)}
            style={{ width: `${pct}%` }}
          />
        );
      })}
    </div>
  );
}

interface UserGroupCardProps {
  title: string;
  total: number | undefined;
  segments: { label: string; value: number | undefined; color: string; dotColor: string }[];
  icon: React.ElementType;
  accentColor: string;
  accentBg: string;
  isLoading: boolean;
}

function UserGroupCard({ title, total, segments, icon: Icon, accentColor, accentBg, isLoading }: UserGroupCardProps) {
  return (
    <div className="rounded-xl border bg-card p-5 transition-all hover:shadow-md">
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl", accentBg)}>
            <Icon className={cn("h-5 w-5", accentColor)} />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            {isLoading ? (
              <Skeleton className="h-8 w-24 mt-0.5" />
            ) : (
              <p className="text-2xl font-bold tracking-tight">{total?.toLocaleString() ?? "—"}</p>
            )}
          </div>
        </div>
      </div>

      {/* Stacked bar */}
      <SegmentBar
        segments={segments.map((s) => ({
          label: s.label,
          value: s.value ?? 0,
          color: s.color,
        }))}
        total={total ?? 0}
        isLoading={isLoading}
      />

      {/* Legend */}
      <div className="flex items-center gap-5 mt-3">
        {segments.map((seg) => {
          const pct = total && seg.value ? Math.round((seg.value / total) * 100) : 0;
          return (
            <div key={seg.label} className="flex items-center gap-2">
              <span className={cn("h-2.5 w-2.5 rounded-full shrink-0", seg.dotColor)} />
              {isLoading ? (
                <Skeleton className="h-3.5 w-20" />
              ) : (
                <span className="text-xs text-muted-foreground">
                  {seg.label}{" "}
                  <span className="font-semibold text-foreground">
                    {seg.value?.toLocaleString()}
                  </span>{" "}
                  <span className="text-muted-foreground/60">({pct}%)</span>
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function UserStats() {
  const t = useTranslations("dashboard");
  const { data: tutorData, isLoading: tutorLoading } = useTutorCount();
  const { data: guardianData, isLoading: guardianLoading } = useGuardianCount();

  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-info-bg">
          <Users className="h-4 w-4 text-info" />
        </div>
        <h2 className="text-base font-semibold">{t("userOverview")}</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <UserGroupCard
          title={t("totalTutors")}
          total={tutorData?.totalTutors}
          icon={GraduationCap}
          accentColor="text-info"
          accentBg="bg-info-bg"
          isLoading={tutorLoading}
          segments={[
            { label: t("maleTutors"), value: tutorData?.maleTutors, color: "bg-info", dotColor: "bg-info" },
            { label: t("femaleTutors"), value: tutorData?.femaleTutors, color: "bg-pink", dotColor: "bg-pink" },
          ]}
        />
        <UserGroupCard
          title={t("totalGuardians")}
          total={guardianData?.totalGuardians}
          icon={Users}
          accentColor="text-purple"
          accentBg="bg-purple-bg"
          isLoading={guardianLoading}
          segments={[
            { label: t("maleGuardians"), value: guardianData?.maleGuardians, color: "bg-purple", dotColor: "bg-purple" },
            { label: t("femaleGuardians"), value: guardianData?.femaleGuardians, color: "bg-pink", dotColor: "bg-pink" },
          ]}
        />
      </div>
    </section>
  );
}
