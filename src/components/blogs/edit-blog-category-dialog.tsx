"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { Loader2, X, Upload } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUpdateBlogCategory } from "@/hooks/use-blogs";
import { extractApiError } from "@/lib/api/error";
import type { BlogCategory } from "@/types";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const editCategorySchema = z.object({
  name: z.string().min(1, "Name is required"),
});

type EditCategoryFormData = z.infer<typeof editCategorySchema>;

interface EditBlogCategoryDialogProps {
  category: BlogCategory | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditBlogCategoryDialog({
  category,
  open,
  onOpenChange,
}: EditBlogCategoryDialogProps) {
  const t = useTranslations("blogCategories");
  const tc = useTranslations("common");
  const updateMutation = useUpdateBlogCategory();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const [iconError, setIconError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditCategoryFormData>({
    resolver: zodResolver(editCategorySchema),
  });

  useEffect(() => {
    if (category && open) {
      reset({
        name: category.name,
      });
      setIconFile(null);
      setIconPreview(category.icon || null);
      setIconError(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [category, open, reset]);

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setIconError(null);

    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      setIconError(t("iconTooLarge"));
      return;
    }

    setIconFile(file);
    setIconPreview(URL.createObjectURL(file));
  };

  const clearNewIcon = () => {
    setIconFile(null);
    setIconPreview(category?.icon || null);
    setIconError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onSubmit = async (data: EditCategoryFormData) => {
    if (!category) return;

    const formData = new FormData();
    formData.append("name", data.name);
    if (iconFile) {
      formData.append("icon", iconFile);
    }

    try {
      await updateMutation.mutateAsync({ id: category.id, data: formData });
      toast.success(t("editSuccess"));
      onOpenChange(false);
    } catch (err) {
      toast.error(extractApiError(err));
    }
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      reset();
      setIconFile(null);
      setIconPreview(null);
      setIconError(null);
      updateMutation.reset();
    }
    onOpenChange(isOpen);
  };

  const hasNewIcon = iconFile !== null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("editTitle")}</DialogTitle>
          <DialogDescription>{t("editDescription")}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-category-name">{t("name")}</Label>
            <Input
              id="edit-category-name"
              placeholder={t("namePlaceholder")}
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-destructive">
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>
              {t("icon")}{" "}
              <span className="text-muted-foreground text-xs">
                ({tc("optional")})
              </span>
            </Label>
            {iconPreview ? (
              <div className="flex items-center gap-3">
                <img
                  src={iconPreview}
                  alt="Icon preview"
                  className="h-12 w-12 rounded object-cover border"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="mr-1.5 h-3.5 w-3.5" />
                  {t("changeIcon")}
                </Button>
                {hasNewIcon && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={clearNewIcon}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex h-20 w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/30 text-muted-foreground transition-colors hover:border-primary/50 hover:bg-muted/50 hover:text-foreground"
              >
                <Upload className="h-6 w-6" />
                <p className="text-xs">{t("uploadIcon")}</p>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleIconChange}
            />
            {iconError && (
              <p className="text-sm text-destructive">{iconError}</p>
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
      </DialogContent>
    </Dialog>
  );
}
