"use client";

import { useTranslations } from "next-intl";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BlogForm } from "@/components/blogs/blog-form";

export default function CreateBlogPage() {
  const t = useTranslations("blogs");

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" size="sm" className="mb-2" asChild>
          <Link href="/blogs">
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            {t("backToBlogs")}
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">
          {t("createTitle")}
        </h1>
        <p className="text-muted-foreground">{t("createDescription")}</p>
      </div>
      <div className="mx-auto max-w-3xl">
        <BlogForm mode="create" />
      </div>
    </div>
  );
}
