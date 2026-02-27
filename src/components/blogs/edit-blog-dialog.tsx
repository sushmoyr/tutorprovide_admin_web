"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { Loader2, Upload, X, ImagePlus } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BlockEditor } from "@/components/shared/block-editor";
import { useBlog, useUpdateBlog, useBlogCategories } from "@/hooks/use-blogs";
import { extractApiError } from "@/lib/api/error";
import type { BlogListItem } from "@/types";

const MAX_FILE_SIZE = 55 * 1024 * 1024; // 55 MB

const editBlogSchema = z.object({
  title: z.string().min(1, "Title is required"),
  categoryId: z.string().min(1, "Category is required"),
});

type EditBlogFormData = z.infer<typeof editBlogSchema>;

interface EditBlogDialogProps {
  blog: BlogListItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditBlogDialog({
  blog,
  open,
  onOpenChange,
}: EditBlogDialogProps) {
  const t = useTranslations("blogs");
  const tc = useTranslations("common");
  const updateMutation = useUpdateBlog();
  const { data: categoriesData } = useBlogCategories();
  const { data: fullBlogData, isLoading: isBlogLoading } = useBlog(
    blog?.slug ?? ""
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [contentError, setContentError] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [editorKey, setEditorKey] = useState(0);

  const categories = categoriesData?.data ?? [];
  const fullBlog = fullBlogData?.data;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EditBlogFormData>({
    resolver: zodResolver(editBlogSchema),
  });

  const categoryId = watch("categoryId");

  // Populate form when full blog data loads
  useEffect(() => {
    if (fullBlog && open) {
      reset({
        title: fullBlog.title,
        categoryId: String(fullBlog.category.id),
      });
      setContent(fullBlog.content ?? "");
      setEditorKey((k) => k + 1);
      setTags(fullBlog.tags.map((tag) => tag.name));
      setImageFile(null);
      setImagePreview(fullBlog.coverImage || null);
      setImageError(null);
      setContentError(null);
      setTagInput("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [fullBlog, open, reset]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setImageError(null);

    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      setImageError(t("imageTooLarge"));
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const clearNewImage = () => {
    setImageFile(null);
    setImagePreview(fullBlog?.coverImage || null);
    setImageError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleTagKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" || e.key === ",") {
        e.preventDefault();
        const value = tagInput.trim().replace(/,/g, "");
        if (value && !tags.includes(value)) {
          setTags((prev) => [...prev, value]);
        }
        setTagInput("");
      }
    },
    [tagInput, tags]
  );

  const removeTag = (tagToRemove: string) => {
    setTags((prev) => prev.filter((t) => t !== tagToRemove));
  };

  const onSubmit = async (data: EditBlogFormData) => {
    if (!blog) return;

    // Validate content
    const cleanContent = content.replace(/<p><\/p>/g, "").trim();
    if (!cleanContent) {
      setContentError(t("contentRequired"));
      return;
    }
    setContentError(null);

    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("content", content);
    formData.append("categoryId", data.categoryId);
    if (imageFile) {
      formData.append("coverImage", imageFile);
    }
    tags.forEach((tag) => {
      formData.append("tagSlugs", tag);
    });

    try {
      await updateMutation.mutateAsync({ slug: blog.slug, data: formData });
      toast.success(t("editSuccess"));
      onOpenChange(false);
    } catch (err) {
      toast.error(extractApiError(err));
    }
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      reset();
      setImageFile(null);
      setImagePreview(null);
      setImageError(null);
      setContent("");
      setContentError(null);
      setTags([]);
      setTagInput("");
      updateMutation.reset();
    }
    onOpenChange(isOpen);
  };

  const hasNewImage = imageFile !== null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("editTitle")}</DialogTitle>
          <DialogDescription>{t("editDescription")}</DialogDescription>
        </DialogHeader>

        {isBlogLoading ? (
          <div className="space-y-4 py-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Cover image upload */}
            <div className="space-y-2">
              <Label>
                {t("coverImage")}{" "}
                <span className="text-muted-foreground text-xs">
                  ({tc("optional")})
                </span>
              </Label>
              {imagePreview ? (
                <div className="group relative overflow-hidden rounded-lg border">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-48 w-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="mr-1.5 h-3.5 w-3.5" />
                      {t("changeImage")}
                    </Button>
                    {hasNewImage && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={clearNewImage}
                      >
                        <X className="mr-1.5 h-3.5 w-3.5" />
                        {t("revertImage")}
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex h-48 w-full flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/30 text-muted-foreground transition-colors hover:border-primary/50 hover:bg-muted/50 hover:text-foreground"
                >
                  <ImagePlus className="h-10 w-10" />
                  <div className="text-center">
                    <p className="text-sm font-medium">
                      {t("imageUploadHint")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG, GIF up to 55 MB
                    </p>
                  </div>
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
              {imageError && (
                <p className="text-sm text-destructive">{imageError}</p>
              )}
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="edit-blog-title">{t("titleColumn")}</Label>
              <Textarea
                id="edit-blog-title"
                placeholder={t("titlePlaceholder")}
                rows={2}
                {...register("title")}
              />
              {errors.title && (
                <p className="text-sm text-destructive">
                  {errors.title.message}
                </p>
              )}
            </div>

            {/* Category & Tags side by side */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>{t("category")}</Label>
                <Select
                  value={categoryId}
                  onValueChange={(value) => setValue("categoryId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("selectCategory")} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={String(cat.id)}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.categoryId && (
                  <p className="text-sm text-destructive">
                    {errors.categoryId.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>
                  {t("tags")}{" "}
                  <span className="text-muted-foreground text-xs">
                    ({tc("optional")})
                  </span>
                </Label>
                <Input
                  placeholder={t("tagsPlaceholder")}
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                />
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="gap-1 pr-1"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-0.5 rounded-full p-0.5 hover:bg-muted-foreground/20"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Rich text content */}
            <div className="space-y-2">
              <Label>{t("content")}</Label>
              <BlockEditor
                key={editorKey}
                content={content}
                onChange={setContent}
                placeholder={t("contentPlaceholder")}
              />
              {contentError && (
                <p className="text-sm text-destructive">{contentError}</p>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleClose(false)}
              >
                {tc("cancel")}
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {tc("save")}
                  </>
                ) : (
                  tc("save")
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
