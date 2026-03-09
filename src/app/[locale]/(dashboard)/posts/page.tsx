"use client";

import { useTranslations } from "next-intl";
import { PostsList } from "@/components/posts/posts-list";

export default function PostsPage() {
  const t = useTranslations("posts");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>
      </div>
      <PostsList />
    </div>
  );
}
