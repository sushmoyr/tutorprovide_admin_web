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
import { useUpdateVideoTutorial } from "@/hooks/use-video-tutorials";
import { extractApiError } from "@/lib/api/error";
import type { VideoTutorial } from "@/types";

const editVideoTutorialSchema = z.object({
  register: z.string().min(1, "Register URL is required"),
  guardianTutorRequest: z.string().min(1, "Guardian tutor request URL is required"),
  tuitionBoard: z.string().min(1, "Tuition board URL is required"),
  tutorTuitionBoard: z.string().min(1, "Tutor tuition board URL is required"),
  tutorPayment: z.string().min(1, "Tutor payment URL is required"),
  tutorProfile: z.string().min(1, "Tutor profile URL is required"),
  link1: z.string(),
  link2: z.string(),
  link3: z.string(),
  others: z.string(),
});

type EditVideoTutorialFormData = z.infer<typeof editVideoTutorialSchema>;

interface EditVideoTutorialDialogProps {
  tutorial: VideoTutorial | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditVideoTutorialDialog({
  tutorial,
  open,
  onOpenChange,
}: EditVideoTutorialDialogProps) {
  const t = useTranslations("videoTutorials");
  const tc = useTranslations("common");
  const updateMutation = useUpdateVideoTutorial();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditVideoTutorialFormData>({
    resolver: zodResolver(editVideoTutorialSchema),
  });

  useEffect(() => {
    if (tutorial && open) {
      reset({
        register: tutorial.register,
        guardianTutorRequest: tutorial.guardianTutorRequest,
        tuitionBoard: tutorial.tuitionBoard,
        tutorTuitionBoard: tutorial.tutorTuitionBoard,
        tutorPayment: tutorial.tutorPayment,
        tutorProfile: tutorial.tutorProfile,
        link1: tutorial.link1 || "",
        link2: tutorial.link2 || "",
        link3: tutorial.link3 || "",
        others: tutorial.others || "",
      });
    }
  }, [tutorial, open, reset]);

  const onSubmit = async (data: EditVideoTutorialFormData) => {
    if (!tutorial) return;

    try {
      await updateMutation.mutateAsync({
        id: tutorial.id,
        data: {
          register: data.register,
          guardianTutorRequest: data.guardianTutorRequest,
          tuitionBoard: data.tuitionBoard,
          tutorTuitionBoard: data.tutorTuitionBoard,
          tutorPayment: data.tutorPayment,
          tutorProfile: data.tutorProfile,
          link1: data.link1 ?? "",
          link2: data.link2 ?? "",
          link3: data.link3 ?? "",
          others: data.others ?? "",
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
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("editTitle")}</DialogTitle>
          <DialogDescription>{t("editDescription")}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="edit-vt-register">{t("register")}</Label>
              <Input
                id="edit-vt-register"
                placeholder={t("urlPlaceholder")}
                {...register("register")}
              />
              {errors.register && (
                <p className="text-sm text-destructive">
                  {errors.register.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-vt-guardianTutorRequest">
                {t("guardianTutorRequest")}
              </Label>
              <Input
                id="edit-vt-guardianTutorRequest"
                placeholder={t("urlPlaceholder")}
                {...register("guardianTutorRequest")}
              />
              {errors.guardianTutorRequest && (
                <p className="text-sm text-destructive">
                  {errors.guardianTutorRequest.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-vt-tuitionBoard">{t("tuitionBoard")}</Label>
              <Input
                id="edit-vt-tuitionBoard"
                placeholder={t("urlPlaceholder")}
                {...register("tuitionBoard")}
              />
              {errors.tuitionBoard && (
                <p className="text-sm text-destructive">
                  {errors.tuitionBoard.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-vt-tutorTuitionBoard">
                {t("tutorTuitionBoard")}
              </Label>
              <Input
                id="edit-vt-tutorTuitionBoard"
                placeholder={t("urlPlaceholder")}
                {...register("tutorTuitionBoard")}
              />
              {errors.tutorTuitionBoard && (
                <p className="text-sm text-destructive">
                  {errors.tutorTuitionBoard.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-vt-tutorPayment">
                {t("tutorPayment")}
              </Label>
              <Input
                id="edit-vt-tutorPayment"
                placeholder={t("urlPlaceholder")}
                {...register("tutorPayment")}
              />
              {errors.tutorPayment && (
                <p className="text-sm text-destructive">
                  {errors.tutorPayment.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-vt-tutorProfile">
                {t("tutorProfile")}
              </Label>
              <Input
                id="edit-vt-tutorProfile"
                placeholder={t("urlPlaceholder")}
                {...register("tutorProfile")}
              />
              {errors.tutorProfile && (
                <p className="text-sm text-destructive">
                  {errors.tutorProfile.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-vt-link1">
                {t("link1")}{" "}
                <span className="text-muted-foreground">({tc("optional")})</span>
              </Label>
              <Input
                id="edit-vt-link1"
                placeholder={t("urlPlaceholder")}
                {...register("link1")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-vt-link2">
                {t("link2")}{" "}
                <span className="text-muted-foreground">({tc("optional")})</span>
              </Label>
              <Input
                id="edit-vt-link2"
                placeholder={t("urlPlaceholder")}
                {...register("link2")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-vt-link3">
                {t("link3")}{" "}
                <span className="text-muted-foreground">({tc("optional")})</span>
              </Label>
              <Input
                id="edit-vt-link3"
                placeholder={t("urlPlaceholder")}
                {...register("link3")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-vt-others">
                {t("others")}{" "}
                <span className="text-muted-foreground">({tc("optional")})</span>
              </Label>
              <Input
                id="edit-vt-others"
                placeholder={t("urlPlaceholder")}
                {...register("others")}
              />
            </div>
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
