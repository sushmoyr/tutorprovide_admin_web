"use client";

import { use } from "react";
import { useTranslations } from "next-intl";
import { ArrowLeft, Eye } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BlogForm } from "@/components/blogs/blog-form";
import { useBlog } from "@/hooks/use-blogs";
import { extractApiError } from "@/lib/api/error";

export default function EditBlogPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const t = useTranslations("blogs");
  const { data, isLoading, error } = useBlog(slug);

  const blog = data?.data;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <Button variant="ghost" size="sm" className="mb-2" asChild>
            <Link href="/blogs">
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              {t("backToBlogs")}
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">
            {t("editTitle")}
          </h1>
          <p className="text-muted-foreground">{t("editDescription")}</p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/blogs/${slug}/preview`}>
            <Eye className="mr-1.5 h-3.5 w-3.5" />
            {t("preview")}
          </Link>
        </Button>
      </div>
      <div className="mx-auto max-w-3xl">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : error ? (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
            {extractApiError(error)}
          </div>
        ) : blog ? (
          <BlogForm mode="edit" blog={blog} />
        ) : null}
      </div>
    </div>
  );
}
