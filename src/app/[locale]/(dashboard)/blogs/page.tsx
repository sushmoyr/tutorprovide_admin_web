"use client";

import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BlogsList } from "@/components/blogs/blogs-list";

export default function BlogsPage() {
  const t = useTranslations("blogs");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>
        <Button asChild>
          <Link href="/blogs/create">
            <Plus className="mr-2 h-4 w-4" />
            {t("addNew")}
          </Link>
        </Button>
      </div>
      <BlogsList />
    </div>
  );
}
