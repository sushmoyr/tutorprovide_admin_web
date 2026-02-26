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
import { BlockEditor } from "@/components/shared/block-editor";
import { useUpdateBanner } from "@/hooks/use-banners";
import { extractApiError } from "@/lib/api/error";
import type { Banner } from "@/types";

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

const editBannerSchema = z.object({
  title: z.string().min(1, "Title is required"),
  link: z.string().optional(),
});

type EditBannerFormData = z.infer<typeof editBannerSchema>;

interface EditBannerDialogProps {
  banner: Banner | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditBannerDialog({
  banner,
  open,
  onOpenChange,
}: EditBannerDialogProps) {
  const t = useTranslations("banners");
  const tc = useTranslations("common");
  const updateMutation = useUpdateBanner();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  // Key to force BlockEditor remount when banner changes
  const [editorKey, setEditorKey] = useState(0);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditBannerFormData>({
    resolver: zodResolver(editBannerSchema),
  });

  useEffect(() => {
    if (banner && open) {
      reset({
        title: banner.title,
        link: banner.link ?? "",
      });
      setDescription(banner.description ?? "");
      setEditorKey((k) => k + 1);
      setImageFile(null);
      setImagePreview(banner.imageUrl || null);
      setImageError(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [banner, open, reset]);

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
    setImagePreview(banner?.imageUrl || null);
    setImageError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onSubmit = async (data: EditBannerFormData) => {
    if (!banner) return;

    const formData = new FormData();
    formData.append("title", data.title);
    if (description && description !== "<p></p>")
      formData.append("description", description);
    if (data.link) formData.append("link", data.link);
    if (imageFile) formData.append("image", imageFile);

    try {
      await updateMutation.mutateAsync({ id: banner.id, data: formData });
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
      setDescription("");
      updateMutation.reset();
    }
    onOpenChange(isOpen);
  };

  const hasNewImage = imageFile !== null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("editTitle")}</DialogTitle>
          <DialogDescription>{t("editDescription")}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Image upload — full width banner preview area */}
          <div className="space-y-2">
            <Label>{t("image")}</Label>
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
                  <p className="text-sm font-medium">{t("imageUploadHint")}</p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG, GIF up to 20 MB
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

          {/* Title & Link side by side */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="edit-banner-title">{t("titleColumn")}</Label>
              <Input
                id="edit-banner-title"
                placeholder={t("titlePlaceholder")}
                {...register("title")}
              />
              {errors.title && (
                <p className="text-sm text-destructive">
                  {errors.title.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-banner-link">{t("link")}</Label>
              <Input
                id="edit-banner-link"
                placeholder={t("linkPlaceholder")}
                {...register("link")}
              />
            </div>
          </div>

          {/* Rich text description */}
          <div className="space-y-2">
            <Label>{t("description")}</Label>
            <BlockEditor
              key={editorKey}
              content={description}
              onChange={setDescription}
              placeholder={t("descriptionPlaceholder")}
            />
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
