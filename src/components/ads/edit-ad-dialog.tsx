"use client";

import { useEffect } from "react";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateAd } from "@/hooks/use-ads";
import { extractApiError } from "@/lib/api/error";
import type { Ad } from "@/types";

const editAdSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  imageUrl: z.string().min(1, "Image URL is required").url("Must be a valid URL"),
  link: z.string().optional(),
});

type EditAdFormData = z.infer<typeof editAdSchema>;

interface EditAdDialogProps {
  ad: Ad | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditAdDialog({ ad, open, onOpenChange }: EditAdDialogProps) {
  const t = useTranslations("ads");
  const tc = useTranslations("common");
  const updateMutation = useUpdateAd();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditAdFormData>({
    resolver: zodResolver(editAdSchema),
  });

  useEffect(() => {
    if (ad && open) {
      reset({
        title: ad.title,
        description: ad.description ?? "",
        imageUrl: ad.imageUrl,
        link: ad.link ?? "",
      });
    }
  }, [ad, open, reset]);

  const onSubmit = async (data: EditAdFormData) => {
    if (!ad) return;

    try {
      await updateMutation.mutateAsync({
        id: ad.id,
        data: {
          title: data.title,
          description: data.description,
          imageUrl: data.imageUrl,
          link: data.link,
        },
      });
      toast.success(t("editSuccess"));
      onOpenChange(false);
    } catch (err) {
      toast.error(extractApiError(err));
    }
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      reset();
      updateMutation.reset();
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("editTitle")}</DialogTitle>
          <DialogDescription>{t("editDescription")}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-ad-title">{t("titleColumn")}</Label>
            <Input
              id="edit-ad-title"
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
            <Label htmlFor="edit-ad-imageUrl">{t("imageUrl")}</Label>
            <Input
              id="edit-ad-imageUrl"
              placeholder={t("imageUrlPlaceholder")}
              {...register("imageUrl")}
            />
            {errors.imageUrl && (
              <p className="text-sm text-destructive">
                {errors.imageUrl.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-ad-description">{t("description")}</Label>
            <Textarea
              id="edit-ad-description"
              placeholder={t("descriptionPlaceholder")}
              {...register("description")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-ad-link">{t("link")}</Label>
            <Input
              id="edit-ad-link"
              placeholder={t("linkPlaceholder")}
              {...register("link")}
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
