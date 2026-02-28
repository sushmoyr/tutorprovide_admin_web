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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateSubject } from "@/hooks/use-subjects";
import { useClasses } from "@/hooks/use-classes";
import { extractApiError } from "@/lib/api/error";

const createSubjectSchema = z.object({
  classId: z.string().min(1, "Class is required"),
  name: z.string().min(1, "Name is required"),
});

type CreateSubjectFormData = z.infer<typeof createSubjectSchema>;

interface CreateSubjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateSubjectDialog({
  open,
  onOpenChange,
}: CreateSubjectDialogProps) {
  const t = useTranslations("subjects");
  const tc = useTranslations("common");
  const createMutation = useCreateSubject();
  const { data: classesData } = useClasses({ size: 1000 });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateSubjectFormData>({
    resolver: zodResolver(createSubjectSchema),
    defaultValues: {
      classId: "",
      name: "",
    },
  });

  const selectedClassId = watch("classId");
  const classes = classesData?.data ?? [];

  const onSubmit = async (data: CreateSubjectFormData) => {
    try {
      await createMutation.mutateAsync({
        name: data.name,
        classId: Number(data.classId),
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
            <Label htmlFor="subject-name">{t("name")}</Label>
            <Input
              id="subject-name"
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
