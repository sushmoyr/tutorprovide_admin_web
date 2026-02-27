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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useCreateFeedback } from "@/hooks/use-feedbacks";
import { extractApiError } from "@/lib/api/error";

const createFeedbackSchema = z.object({
  details: z.string().min(1, "Details are required"),
  rating: z
    .string()
    .min(1, "Rating is required")
    .refine((val) => !isNaN(Number(val)), "Must be a number")
    .refine((val) => Number(val) >= 1, "Rating must be at least 1")
    .refine((val) => Number(val) <= 5, "Rating must be at most 5"),
});

type CreateFeedbackFormData = z.infer<typeof createFeedbackSchema>;

interface CreateFeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateFeedbackDialog({
  open,
  onOpenChange,
}: CreateFeedbackDialogProps) {
  const t = useTranslations("feedbacks");
  const tc = useTranslations("common");
  const createMutation = useCreateFeedback();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateFeedbackFormData>({
    resolver: zodResolver(createFeedbackSchema),
  });

  const onSubmit = async (data: CreateFeedbackFormData) => {
    try {
      await createMutation.mutateAsync({
        details: data.details,
        rating: Number(data.rating),
      });
      toast.success(t("createSuccess"));
      reset();
      onOpenChange(false);
    } catch (err) {
      toast.error(extractApiError(err));
    }
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      reset();
      createMutation.reset();
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("createTitle")}</DialogTitle>
          <DialogDescription>{t("createDescription")}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="rating">{t("rating")}</Label>
            <Input
              id="rating"
              type="number"
              min={1}
              max={5}
              placeholder="1-5"
              {...register("rating")}
            />
            {errors.rating && (
              <p className="text-sm text-destructive">
                {errors.rating.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="details">{t("details")}</Label>
            <Textarea
              id="details"
              placeholder={t("detailsPlaceholder")}
              rows={4}
              {...register("details")}
            />
            {errors.details && (
              <p className="text-sm text-destructive">
                {errors.details.message}
              </p>
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
