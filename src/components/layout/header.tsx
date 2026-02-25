"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { LogOut, User, PanelLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuthStore } from "@/stores/auth-store";
import { useSidebarStore } from "@/stores/sidebar-store";
import { useLocaleStore } from "@/stores/locale-store";
import { BreadcrumbNav } from "./breadcrumb-nav";
import { Sidebar } from "./sidebar";

export function Header() {
  const t = useTranslations();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { collapsed } = useSidebarStore();
  const { locale, locales, setLocale } = useLocaleStore();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) ?? "AD";

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      {/* Mobile sidebar trigger */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <PanelLeft className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[var(--sidebar-width)] p-0">
          <Sidebar />
        </SheetContent>
      </Sheet>

      {/* Breadcrumb */}
      <div className="flex-1">
        <BreadcrumbNav />
      </div>

      {/* Locale switcher */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            {locales[locale]}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {(Object.entries(locales) as [typeof locale, string][]).map(
            ([key, label]) => (
              <DropdownMenuItem
                key={key}
                onClick={() => setLocale(key)}
                className={locale === key ? "font-semibold" : ""}
              >
                {label}
              </DropdownMenuItem>
            )
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* User menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-9 w-9 rounded-full">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-brand-primary text-white text-xs">
                {initials}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="flex items-center gap-2 p-2">
            <div className="flex flex-col space-y-0.5">
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-muted-foreground">{user?.email ?? user?.phone}</p>
            </div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => router.push("/profile")}>
            <User className="mr-2 h-4 w-4" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="text-destructive">
            <LogOut className="mr-2 h-4 w-4" />
            {t("auth.logout")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
