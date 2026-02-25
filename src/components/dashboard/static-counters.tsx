"use client";

import { useTranslations } from "next-intl";
import {
  UserCheck,
  Clock,
  GraduationCap,
  Users,
  UsersRound,
  Radio,
  type LucideIcon,
  BarChart3,
} from "lucide-react";
import { useStaticCounters } from "@/hooks/use-dashboard";
import { StatCard } from "./stat-card";

interface CounterStyle {
  icon: LucideIcon;
  color: string;
  bg: string;
  gradient: string;
}

const COUNTER_STYLES: Record<string, CounterStyle> = {
  "appointed tuitions": { icon: UserCheck, color: "text-brand-primary", bg: "bg-brand-primary/10", gradient: "from-brand-primary/5 to-transparent" },
  "pending tutions": { icon: Clock, color: "text-warning", bg: "bg-warning-bg", gradient: "from-warning/5 to-transparent" },
  "total tutors": { icon: GraduationCap, color: "text-info", bg: "bg-info-bg", gradient: "from-info/5 to-transparent" },
  "total guardian": { icon: Users, color: "text-purple", bg: "bg-purple-bg", gradient: "from-purple/5 to-transparent" },
  "total users": { icon: UsersRound, color: "text-pink", bg: "bg-pink-bg", gradient: "from-pink/5 to-transparent" },
  "live tuitions": { icon: Radio, color: "text-success", bg: "bg-success-bg", gradient: "from-success/5 to-transparent" },
};

const FALLBACK_STYLES: CounterStyle[] = [
  { icon: BarChart3, color: "text-brand-primary", bg: "bg-brand-primary/10", gradient: "from-brand-primary/5 to-transparent" },
  { icon: BarChart3, color: "text-success", bg: "bg-success-bg", gradient: "from-success/5 to-transparent" },
  { icon: BarChart3, color: "text-info", bg: "bg-info-bg", gradient: "from-info/5 to-transparent" },
  { icon: BarChart3, color: "text-purple", bg: "bg-purple-bg", gradient: "from-purple/5 to-transparent" },
  { icon: BarChart3, color: "text-warning", bg: "bg-warning-bg", gradient: "from-warning/5 to-transparent" },
  { icon: BarChart3, color: "text-pink", bg: "bg-pink-bg", gradient: "from-pink/5 to-transparent" },
];

function getStyle(name: string, index: number): CounterStyle {
  return COUNTER_STYLES[name.toLowerCase()] ?? FALLBACK_STYLES[index % FALLBACK_STYLES.length]!;
}

export function StaticCounters() {
  const t = useTranslations("dashboard");
  const { data: counters, isLoading } = useStaticCounters();

  if (!isLoading && !counters?.length) return null;

  const items = isLoading
    ? Array.from({ length: 6 }).map((_, i) => ({
        id: i,
        label: "",
        value: undefined as number | undefined,
        ...FALLBACK_STYLES[i % FALLBACK_STYLES.length]!,
      }))
    : counters!.map((counter, i) => {
        const style = getStyle(counter.counterName, i);
        return {
          id: counter.id,
          label: counter.counterName,
          value: counter.value as number | undefined,
          ...style,
        };
      });

  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-bg">
          <BarChart3 className="h-4 w-4 text-purple" />
        </div>
        <h2 className="text-base font-semibold">{t("platformCounters")}</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {items.map((item) => (
          <StatCard
            key={item.id}
            label={item.label}
            value={item.value}
            icon={item.icon}
            color={item.color}
            bgColor={item.bg}
            gradient={item.gradient}
            isLoading={isLoading}
          />
        ))}
      </div>
    </section>
  );
}
