"use client";

import { use } from "react";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { ArrowLeft, Pencil } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useBlog } from "@/hooks/use-blogs";
import { extractApiError } from "@/lib/api/error";

export default function PreviewBlogPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const t = useTranslations("blogs");
  const { data, isLoading, error } = useBlog(slug);

  const blog = data?.data;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="mb-2 h-8 w-32" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="mx-auto max-w-3xl space-y-6">
          <Skeleton className="h-64 w-full rounded-lg" />
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <Button variant="ghost" size="sm" className="mb-2" asChild>
            <Link href="/blogs">
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              {t("backToBlogs")}
            </Link>
          </Button>
        </div>
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {extractApiError(error)}
        </div>
      </div>
    );
  }

  if (!blog) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Button variant="ghost" size="sm" className="mb-2" asChild>
            <Link href="/blogs">
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              {t("backToBlogs")}
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">
            {t("previewTitle")}
          </h1>
          <p className="text-muted-foreground">{t("previewDescription")}</p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/blogs/${blog.slug}/edit`}>
            <Pencil className="mr-1.5 h-3.5 w-3.5" />
            {t("editTitle")}
          </Link>
        </Button>
      </div>

      {/* Article preview */}
      <article className="mx-auto max-w-3xl">
        {/* Cover image */}
        {blog.coverImage && (
          <div className="overflow-hidden rounded-lg">
            <img
              src={blog.coverImage}
              alt={blog.title}
              className="h-64 w-full object-cover sm:h-80"
            />
          </div>
        )}

        {/* Title */}
        <h1 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">
          {blog.title}
        </h1>

        {/* Meta */}
        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span>{format(new Date(blog.createdAt), "MMMM dd, yyyy")}</span>
          <span>&middot;</span>
          <Badge variant="secondary">{blog.category.name}</Badge>
          {blog.status !== "PUBLISHED" && (
            <Badge
              variant="outline"
              className={
                blog.status === "DRAFT"
                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                  : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
              }
            >
              {t(`status${blog.status}`)}
            </Badge>
          )}
        </div>

        {/* Tags */}
        {blog.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {blog.tags.map((tag) => (
              <Badge key={tag.slug} variant="outline" className="text-xs">
                {tag.name}
              </Badge>
            ))}
          </div>
        )}

        {/* Divider */}
        <hr className="my-6 border-border" />

        {/* Content */}
        <div
          className="prose prose-sm dark:prose-invert max-w-none sm:prose-base"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />

        {/* Footer meta */}
        {blog.updatedAt !== blog.createdAt && (
          <p className="mt-8 text-xs text-muted-foreground">
            {t("lastUpdated", {
              date: format(new Date(blog.updatedAt), "MMMM dd, yyyy"),
            })}
          </p>
        )}
      </article>
    </div>
  );
}
