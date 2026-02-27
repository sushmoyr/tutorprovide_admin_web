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
import { useCreateFaq } from "@/hooks/use-faqs";
import { extractApiError } from "@/lib/api/error";

const createFaqSchema = z.object({
  question: z.string().min(1, "Question is required"),
  answer: z.string().min(1, "Answer is required"),
  link: z.string().optional(),
});

type CreateFaqFormData = z.infer<typeof createFaqSchema>;

interface CreateFaqDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateFaqDialog({ open, onOpenChange }: CreateFaqDialogProps) {
  const t = useTranslations("faqs");
  const tc = useTranslations("common");
  const createMutation = useCreateFaq();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateFaqFormData>({
    resolver: zodResolver(createFaqSchema),
  });

  const onSubmit = async (data: CreateFaqFormData) => {
    try {
      await createMutation.mutateAsync({
        question: data.question,
        answer: data.answer,
        link: data.link || undefined,
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
            <Label htmlFor="question">{t("question")}</Label>
            <Textarea
              id="question"
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
            <Label htmlFor="answer">{t("answer")}</Label>
            <Textarea
              id="answer"
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
            <Label htmlFor="link">
              {t("link")}{" "}
              <span className="text-muted-foreground">({tc("optional")})</span>
            </Label>
            <Input
              id="link"
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
