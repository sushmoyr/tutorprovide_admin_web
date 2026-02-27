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
import { useUpdateFaq } from "@/hooks/use-faqs";
import { extractApiError } from "@/lib/api/error";
import type { FAQ } from "@/types";

const editFaqSchema = z.object({
  question: z.string().min(1, "Question is required"),
  answer: z.string().min(1, "Answer is required"),
  link: z.string().optional(),
});

type EditFaqFormData = z.infer<typeof editFaqSchema>;

interface EditFaqDialogProps {
  faq: FAQ | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditFaqDialog({ faq, open, onOpenChange }: EditFaqDialogProps) {
  const t = useTranslations("faqs");
  const tc = useTranslations("common");
  const updateMutation = useUpdateFaq();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditFaqFormData>({
    resolver: zodResolver(editFaqSchema),
  });

  useEffect(() => {
    if (faq && open) {
      reset({
        question: faq.question,
        answer: faq.answer,
        link: faq.link || "",
      });
    }
  }, [faq, open, reset]);

  const onSubmit = async (data: EditFaqFormData) => {
    if (!faq) return;

    try {
      await updateMutation.mutateAsync({
        id: faq.id,
        data: {
          question: data.question,
          answer: data.answer,
          link: data.link || undefined,
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("editTitle")}</DialogTitle>
          <DialogDescription>{t("editDescription")}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-question">{t("question")}</Label>
            <Textarea
              id="edit-question"
              placeholder={t("questionPlaceholder")}
              rows={3}
              {...register("question")}
            />
            {errors.question && (
              <p className="text-sm text-destructive">
                {errors.question.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-answer">{t("answer")}</Label>
            <Textarea
              id="edit-answer"
              placeholder={t("answerPlaceholder")}
              rows={4}
              {...register("answer")}
            />
            {errors.answer && (
              <p className="text-sm text-destructive">
                {errors.answer.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-link">
              {t("link")}{" "}
              <span className="text-muted-foreground">({tc("optional")})</span>
            </Label>
            <Input
              id="edit-link"
              placeholder={t("linkPlaceholder")}
              {...register("link")}
            />
            {errors.link && (
              <p className="text-sm text-destructive">
                {errors.link.message}
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
