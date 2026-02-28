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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUpdateSubject } from "@/hooks/use-subjects";
import { useClasses } from "@/hooks/use-classes";
import { extractApiError } from "@/lib/api/error";
import type { Subject } from "@/types";

const editSubjectSchema = z.object({
  classId: z.string().min(1, "Class is required"),
  name: z.string().min(1, "Name is required"),
});

type EditSubjectFormData = z.infer<typeof editSubjectSchema>;

interface EditSubjectDialogProps {
  subject: Subject | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditSubjectDialog({
  subject,
  open,
  onOpenChange,
}: EditSubjectDialogProps) {
  const t = useTranslations("subjects");
  const tc = useTranslations("common");
  const updateMutation = useUpdateSubject();
  const { data: classesData } = useClasses({ size: 1000 });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EditSubjectFormData>({
    resolver: zodResolver(editSubjectSchema),
  });

  const selectedClassId = watch("classId");
  const classes = classesData?.data ?? [];

  useEffect(() => {
    if (subject && open) {
      reset({
        classId: String(subject.preferableClass.id),
        name: subject.name,
      });
    }
  }, [subject, open, reset]);

  const onSubmit = async (data: EditSubjectFormData) => {
    if (!subject) return;

    try {
      await updateMutation.mutateAsync({
        id: subject.id,
        data: {
          name: data.name,
          classId: Number(data.classId),
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
            <Label>{t("class")}</Label>
            <Select
              value={selectedClassId}
              onValueChange={(val) => setValue("classId", val)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("selectClass")} />
              </SelectTrigger>
              <SelectContent>
                {classes.map((cls) => (
                  <SelectItem key={cls.id} value={String(cls.id)}>
                    {cls.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.classId && (
              <p className="text-sm text-destructive">
                {errors.classId.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-subject-name">{t("name")}</Label>
            <Input
              id="edit-subject-name"
              placeholder={t("namePlaceholder")}
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-destructive">
                {errors.name.message}
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
