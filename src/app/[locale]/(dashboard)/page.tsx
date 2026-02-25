"use client";

import { WelcomeBanner } from "@/components/dashboard/welcome-banner";
import { WelcomeGreetingDialog } from "@/components/dashboard/welcome-greeting-dialog";
import { TuitionStats } from "@/components/dashboard/tuition-stats";
import { UserStats } from "@/components/dashboard/user-stats";
import { StaticCounters } from "@/components/dashboard/static-counters";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <WelcomeGreetingDialog />
      <WelcomeBanner />
      <TuitionStats />
      <UserStats />
      <StaticCounters />
    </div>
  );
}
