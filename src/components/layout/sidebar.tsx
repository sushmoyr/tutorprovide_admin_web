"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { PanelLeftClose, PanelLeft, ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useSidebarStore } from "@/stores/sidebar-store";
import { topItems, sidebarGroups } from "./sidebar-nav";

export function Sidebar() {
  const pathname = usePathname();
  const t = useTranslations();
  const { collapsed, toggle } = useSidebarStore();

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  // Auto-expand group containing active route
  useEffect(() => {
    const activeGroup = sidebarGroups.find((group) =>
      group.items.some(
        (item) =>
          pathname === item.href ||
          (item.href !== "/" && pathname.startsWith(item.href))
      )
    );
    if (activeGroup) {
      setOpenGroups((prev) => ({ ...prev, [activeGroup.id]: true }));
    }
  }, [pathname]);

  const toggleGroup = (id: string) => {
    setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const isItemActive = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(href));

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "fixed left-0 top-0 z-30 flex h-screen flex-col border-r bg-sidebar text-sidebar-foreground transition-all duration-300",
          collapsed
            ? "w-[var(--sidebar-width-collapsed)]"
            : "w-[var(--sidebar-width)]"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 shrink-0 items-center border-b px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-primary text-white font-bold text-sm">
              TP
            </div>
            {!collapsed && (
              <span className="font-semibold text-lg">Admin</span>
            )}
          </Link>
        </div>

        {/* Navigation — scrollable */}
        <nav className="flex-1 overflow-y-auto py-3 px-2">
          {/* Top-level items (Dashboard) */}
          <div className="space-y-1 mb-3">
            {topItems.map((item) => {
              const Icon = item.icon;
              const active = isItemActive(item.href);

              const link = (
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-sidebar-accent text-brand-primary font-medium"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {!collapsed && <span>{t(item.title)}</span>}
                </Link>
              );

              if (collapsed) {
                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>{link}</TooltipTrigger>
                    <TooltipContent side="right">
                      {t(item.title)}
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return <div key={item.href}>{link}</div>;
            })}
          </div>

          {/* Collapsible groups */}
          <div className="space-y-1">
            {sidebarGroups.map((group) => {
              const GroupIcon = group.icon;
              const isOpen = openGroups[group.id] ?? false;
              const hasActiveItem = group.items.some((item) =>
                isItemActive(item.href)
              );

              // Collapsed sidebar: show only group icon with tooltip
              if (collapsed) {
                return (
                  <Tooltip key={group.id}>
                    <TooltipTrigger asChild>
                      <button
                        className={cn(
                          "flex w-full items-center justify-center rounded-lg px-3 py-2 text-sm transition-colors",
                          hasActiveItem
                            ? "bg-sidebar-accent text-brand-primary"
                            : "text-sidebar-foreground hover:bg-sidebar-accent"
                        )}
                      >
                        <GroupIcon className="h-4 w-4 shrink-0" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent
                      side="right"
                      className="flex flex-col gap-1 p-2"
                    >
                      <p className="font-semibold text-xs uppercase tracking-wider mb-1">
                        {t(group.label)}
                      </p>
                      {group.items.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            "text-sm py-0.5 hover:underline",
                            isItemActive(item.href) && "font-semibold"
                          )}
                        >
                          {t(item.title)}
                        </Link>
                      ))}
                    </TooltipContent>
                  </Tooltip>
                );
              }

              // Expanded sidebar: collapsible group
              return (
                <Collapsible
                  key={group.id}
                  open={isOpen}
                  onOpenChange={() => toggleGroup(group.id)}
                >
                  <CollapsibleTrigger asChild>
                    <button
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        hasActiveItem
                          ? "text-brand-primary"
                          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      )}
                    >
                      <GroupIcon className="h-4 w-4 shrink-0" />
                      <span className="flex-1 text-left">
                        {t(group.label)}
                      </span>
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 shrink-0 transition-transform duration-200",
                          isOpen && "rotate-180"
                        )}
                      />
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="ml-4 space-y-0.5 border-l border-sidebar-border pl-3 pt-1 pb-1">
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        const active = isItemActive(item.href);

                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                              "flex items-center gap-3 rounded-lg px-3 py-1.5 text-sm transition-colors",
                              active
                                ? "bg-sidebar-accent text-brand-primary font-medium"
                                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                            )}
                          >
                            <Icon className="h-3.5 w-3.5 shrink-0" />
                            <span>{t(item.title)}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
          </div>
        </nav>

        {/* Collapse Toggle */}
        <div className="shrink-0 border-t p-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-center"
            onClick={toggle}
          >
            {collapsed ? (
              <PanelLeft className="h-4 w-4" />
            ) : (
              <>
                <PanelLeftClose className="mr-2 h-4 w-4" />
                <span>{t("sidebar.collapse")}</span>
              </>
            )}
          </Button>
        </div>
      </aside>
    </TooltipProvider>
  );
}
