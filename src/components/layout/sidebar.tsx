"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { PanelLeftClose, PanelLeft } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSidebarStore } from "@/stores/sidebar-store";
import { sidebarNav } from "./sidebar-nav";

export function Sidebar() {
  const pathname = usePathname();
  const t = useTranslations();
  const { collapsed, toggle } = useSidebarStore();

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "fixed left-0 top-0 z-30 flex h-screen flex-col border-r bg-sidebar text-sidebar-foreground transition-all duration-300",
          collapsed ? "w-[var(--sidebar-width-collapsed)]" : "w-[var(--sidebar-width)]"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center border-b px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-primary text-white font-bold text-sm">
              TP
            </div>
            {!collapsed && (
              <span className="font-semibold text-lg">Admin</span>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-4">
          <nav className="space-y-6 px-2">
            {sidebarNav.map((group) => (
              <div key={group.label || "main"}>
                {group.label && !collapsed && (
                  <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {t(group.label)}
                  </p>
                )}
                {group.label && collapsed && (
                  <div className="mb-2 border-t border-sidebar-border" />
                )}
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                    const Icon = item.icon;

                    const linkContent = (
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                          isActive
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
                          <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                          <TooltipContent side="right">
                            {t(item.title)}
                          </TooltipContent>
                        </Tooltip>
                      );
                    }

                    return <div key={item.href}>{linkContent}</div>;
                  })}
                </div>
              </div>
            ))}
          </nav>
        </ScrollArea>

        {/* Collapse Toggle */}
        <div className="border-t p-2">
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
