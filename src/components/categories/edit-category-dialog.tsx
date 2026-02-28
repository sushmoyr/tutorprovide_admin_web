"use client";

import { useState, useRef, useEffect } from "react";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUpdateCategory } from "@/hooks/use-categories";
import { extractApiError } from "@/lib/api/error";
import type { Category } from "@/types";

const MAX_FILE_SIZE = 55 * 1024 * 1024; // 55 MB

const editCategorySchema = z.object({
  name: z.string().min(1, "Name is required"),
});

type EditCategoryFormData = z.infer<typeof editCategorySchema>;

interface EditCategoryDialogProps {
  category: Category | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditCategoryDialog({
  category,
  open,
  onOpenChange,
}: EditCategoryDialogProps) {
  const t = useTranslations("categories");
  const tc = useTranslations("common");
  const updateMutation = useUpdateCategory();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

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
      reset({ name: category.name });
      setImageFile(null);
      setImagePreview(category.image || null);
      setImageError(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [category, open, reset]);

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
    setImagePreview(category?.image || null);
    setImageError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onSubmit = async (data: EditCategoryFormData) => {
    if (!category) return;

    const formData = new FormData();
    formData.append("name", data.name);
    if (imageFile) formData.append("image", imageFile);

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
      setImageFile(null);
      setImagePreview(null);
      setImageError(null);
      updateMutation.reset();
    }
    onOpenChange(isOpen);
  };

  const hasNewImage = imageFile !== null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
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
            <Label>{t("image")}</Label>
            {imagePreview ? (
              <div className="group relative overflow-hidden rounded-lg border">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-32 w-full object-cover"
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
                className="flex h-32 w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/30 text-muted-foreground transition-colors hover:border-primary/50 hover:bg-muted/50 hover:text-foreground"
              >
                <ImagePlus className="h-8 w-8" />
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
