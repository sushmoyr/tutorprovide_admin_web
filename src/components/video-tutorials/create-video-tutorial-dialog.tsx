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
import { useCreateVideoTutorial } from "@/hooks/use-video-tutorials";
import { extractApiError } from "@/lib/api/error";

const createVideoTutorialSchema = z.object({
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

type CreateVideoTutorialFormData = z.infer<typeof createVideoTutorialSchema>;

interface CreateVideoTutorialDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateVideoTutorialDialog({
  open,
  onOpenChange,
}: CreateVideoTutorialDialogProps) {
  const t = useTranslations("videoTutorials");
  const tc = useTranslations("common");
  const createMutation = useCreateVideoTutorial();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateVideoTutorialFormData>({
    resolver: zodResolver(createVideoTutorialSchema),
    defaultValues: {
      link1: "",
      link2: "",
      link3: "",
      others: "",
    },
  });

  const onSubmit = async (data: CreateVideoTutorialFormData) => {
    try {
      await createMutation.mutateAsync({
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
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("createTitle")}</DialogTitle>
          <DialogDescription>{t("createDescription")}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="vt-register">{t("register")}</Label>
              <Input
                id="vt-register"
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
              <Label htmlFor="vt-guardianTutorRequest">
                {t("guardianTutorRequest")}
              </Label>
              <Input
                id="vt-guardianTutorRequest"
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
              <Label htmlFor="vt-tuitionBoard">{t("tuitionBoard")}</Label>
              <Input
                id="vt-tuitionBoard"
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
              <Label htmlFor="vt-tutorTuitionBoard">
                {t("tutorTuitionBoard")}
              </Label>
              <Input
                id="vt-tutorTuitionBoard"
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
              <Label htmlFor="vt-tutorPayment">{t("tutorPayment")}</Label>
              <Input
                id="vt-tutorPayment"
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
              <Label htmlFor="vt-tutorProfile">{t("tutorProfile")}</Label>
              <Input
                id="vt-tutorProfile"
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
              <Label htmlFor="vt-link1">
                {t("link1")}{" "}
                <span className="text-muted-foreground">({tc("optional")})</span>
              </Label>
              <Input
                id="vt-link1"
                placeholder={t("urlPlaceholder")}
                {...register("link1")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vt-link2">
                {t("link2")}{" "}
                <span className="text-muted-foreground">({tc("optional")})</span>
              </Label>
              <Input
                id="vt-link2"
                placeholder={t("urlPlaceholder")}
                {...register("link2")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vt-link3">
                {t("link3")}{" "}
                <span className="text-muted-foreground">({tc("optional")})</span>
              </Label>
              <Input
                id="vt-link3"
                placeholder={t("urlPlaceholder")}
                {...register("link3")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vt-others">
                {t("others")}{" "}
                <span className="text-muted-foreground">({tc("optional")})</span>
              </Label>
              <Input
                id="vt-others"
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
