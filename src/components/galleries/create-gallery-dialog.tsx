"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { BlockEditor } from "@/components/shared/block-editor";
import { useCreateGallery } from "@/hooks/use-galleries";
import { extractApiError } from "@/lib/api/error";

const createGallerySchema = z.object({
  title: z.string().min(1, "Title is required"),
  actionLink: z.string().optional(),
  actionText: z.string().optional(),
  videoUrl: z.string().optional(),
  images: z.string().optional(),
  sortOrder: z.string().optional(),
  videoOnly: z.boolean().optional(),
});

type CreateGalleryFormData = z.infer<typeof createGallerySchema>;

function parseImages(text: string | undefined): string[] {
  if (!text || !text.trim()) return [];
  return text
    .split(/[,\n]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

interface CreateGalleryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateGalleryDialog({
  open,
  onOpenChange,
}: CreateGalleryDialogProps) {
  const t = useTranslations("galleries");
  const tc = useTranslations("common");
  const createMutation = useCreateGallery();

  const [description, setDescription] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateGalleryFormData>({
    resolver: zodResolver(createGallerySchema),
    defaultValues: {
      title: "",
      actionLink: "",
      actionText: "",
      videoUrl: "",
      images: "",
      sortOrder: "0",
      videoOnly: false,
    },
  });

  const videoOnly = watch("videoOnly");

  const onSubmit = async (data: CreateGalleryFormData) => {
    const images = parseImages(data.images);

    try {
      await createMutation.mutateAsync({
        title: data.title,
        description: description && description !== "<p></p>" ? description : "",
        actionLink: data.actionLink || "",
        actionText: data.actionText || "",
        videoUrl: data.videoUrl || "",
        images,
        sortOrder: Number(data.sortOrder) || 0,
        videoOnly: data.videoOnly ?? false,
      });
      toast.success(t("createSuccess"));
      resetForm();
      onOpenChange(false);
    } catch (err) {
      toast.error(extractApiError(err));
    }
  };

  const resetForm = () => {
    reset();
    setDescription("");
    createMutation.reset();
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) resetForm();
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("createTitle")}</DialogTitle>
          <DialogDescription>{t("createDescription")}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Title & Sort Order */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="gallery-title">{t("titleColumn")}</Label>
              <Input
                id="gallery-title"
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
              <Label htmlFor="gallery-sortOrder">{t("sortOrder")}</Label>
              <Input
                id="gallery-sortOrder"
                type="number"
                placeholder={t("sortOrderPlaceholder")}
                {...register("sortOrder")}
              />
              {errors.sortOrder && (
                <p className="text-sm text-destructive">
                  {errors.sortOrder.message}
                </p>
              )}
            </div>
          </div>

          {/* Rich text description */}
          <div className="space-y-2">
            <Label>{t("description")}</Label>
            <BlockEditor
              content={description}
              onChange={setDescription}
              placeholder={t("descriptionPlaceholder")}
            />
          </div>

          {/* Action Link & Action Text */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="gallery-actionLink">
                {t("actionLink")}{" "}
                <span className="text-muted-foreground">({tc("optional")})</span>
              </Label>
              <Input
                id="gallery-actionLink"
                placeholder={t("actionLinkPlaceholder")}
                {...register("actionLink")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gallery-actionText">
                {t("actionText")}{" "}
                <span className="text-muted-foreground">({tc("optional")})</span>
              </Label>
              <Input
                id="gallery-actionText"
                placeholder={t("actionTextPlaceholder")}
                {...register("actionText")}
              />
            </div>
          </div>

          {/* Video URL */}
          <div className="space-y-2">
            <Label htmlFor="gallery-videoUrl">
              {t("videoUrl")}{" "}
              <span className="text-muted-foreground">({tc("optional")})</span>
            </Label>
            <Input
              id="gallery-videoUrl"
              placeholder={t("videoUrlPlaceholder")}
              {...register("videoUrl")}
            />
          </div>

          {/* Images */}
          <div className="space-y-2">
            <Label htmlFor="gallery-images">
              {t("images")}{" "}
              <span className="text-muted-foreground">({tc("optional")})</span>
            </Label>
            <Textarea
              id="gallery-images"
              placeholder={t("imagesPlaceholder")}
              rows={3}
              {...register("images")}
            />
            <p className="text-xs text-muted-foreground">
              {t("imagesHint")}
            </p>
          </div>

          {/* Video Only */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="gallery-videoOnly"
              checked={videoOnly}
              onCheckedChange={(checked) =>
                setValue("videoOnly", checked === true)
              }
            />
            <Label htmlFor="gallery-videoOnly" className="cursor-pointer">
              {t("videoOnly")}
            </Label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleClose(false)}
            >
              {tc("cancel")}
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? (
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
