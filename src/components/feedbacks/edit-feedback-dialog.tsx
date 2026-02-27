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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useUpdateFeedback } from "@/hooks/use-feedbacks";
import { extractApiError } from "@/lib/api/error";
import type { Feedback } from "@/types";

const editFeedbackSchema = z.object({
  details: z.string().min(1, "Details are required"),
  rating: z
    .string()
    .min(1, "Rating is required")
    .refine((val) => !isNaN(Number(val)), "Must be a number")
    .refine((val) => Number(val) >= 1, "Rating must be at least 1")
    .refine((val) => Number(val) <= 5, "Rating must be at most 5"),
});

type EditFeedbackFormData = z.infer<typeof editFeedbackSchema>;

interface EditFeedbackDialogProps {
  feedback: Feedback | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditFeedbackDialog({
  feedback,
  open,
  onOpenChange,
}: EditFeedbackDialogProps) {
  const t = useTranslations("feedbacks");
  const tc = useTranslations("common");
  const updateMutation = useUpdateFeedback();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditFeedbackFormData>({
    resolver: zodResolver(editFeedbackSchema),
  });

  useEffect(() => {
    if (feedback && open) {
      reset({
        details: feedback.details,
        rating: String(feedback.rating),
      });
    }
  }, [feedback, open, reset]);

  const onSubmit = async (data: EditFeedbackFormData) => {
    if (!feedback) return;

    try {
      await updateMutation.mutateAsync({
        id: feedback.id,
        data: { details: data.details, rating: Number(data.rating) },
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("editTitle")}</DialogTitle>
          <DialogDescription>{t("editDescription")}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-rating">{t("rating")}</Label>
            <Input
              id="edit-rating"
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
            <Label htmlFor="edit-details">{t("details")}</Label>
            <Textarea
              id="edit-details"
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
