"use client";

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
import { useCreateAd } from "@/hooks/use-ads";
import { extractApiError } from "@/lib/api/error";

const createAdSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  imageUrl: z.string().min(1, "Image URL is required").url("Must be a valid URL"),
  link: z.string().optional(),
});

type CreateAdFormData = z.infer<typeof createAdSchema>;

interface CreateAdDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateAdDialog({ open, onOpenChange }: CreateAdDialogProps) {
  const t = useTranslations("ads");
  const tc = useTranslations("common");
  const createMutation = useCreateAd();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateAdFormData>({
    resolver: zodResolver(createAdSchema),
  });

  const onSubmit = async (data: CreateAdFormData) => {
    try {
      await createMutation.mutateAsync({
        title: data.title,
        description: data.description,
        imageUrl: data.imageUrl,
        link: data.link,
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
    createMutation.reset();
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) resetForm();
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("createTitle")}</DialogTitle>
          <DialogDescription>{t("createDescription")}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ad-title">{t("titleColumn")}</Label>
            <Input
              id="ad-title"
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
            <Label htmlFor="ad-imageUrl">{t("imageUrl")}</Label>
            <Input
              id="ad-imageUrl"
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
            <Label htmlFor="ad-description">{t("description")}</Label>
            <Textarea
              id="ad-description"
              placeholder={t("descriptionPlaceholder")}
              {...register("description")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ad-link">{t("link")}</Label>
            <Input
              id="ad-link"
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
