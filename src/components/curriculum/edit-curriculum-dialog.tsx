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
import { useUpdateCurriculum } from "@/hooks/use-curriculum";
import { useCategories } from "@/hooks/use-categories";
import { extractApiError } from "@/lib/api/error";
import type { Curriculum } from "@/types";

const editCurriculumSchema = z.object({
  preferableCategoryId: z.string().min(1, "Category is required"),
  name: z.string().min(1, "Name is required"),
});

type EditCurriculumFormData = z.infer<typeof editCurriculumSchema>;

interface EditCurriculumDialogProps {
  curriculum: Curriculum | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditCurriculumDialog({
  curriculum,
  open,
  onOpenChange,
}: EditCurriculumDialogProps) {
  const t = useTranslations("curriculum");
  const tc = useTranslations("common");
  const updateMutation = useUpdateCurriculum();
  const { data: categoriesData } = useCategories({ size: 1000 });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EditCurriculumFormData>({
    resolver: zodResolver(editCurriculumSchema),
  });

  const selectedCategoryId = watch("preferableCategoryId");
  const categories = categoriesData?.data ?? [];

  useEffect(() => {
    if (curriculum && open) {
      reset({
        preferableCategoryId: "",
        name: curriculum.name,
      });
    }
  }, [curriculum, open, reset]);

  const onSubmit = async (data: EditCurriculumFormData) => {
    if (!curriculum) return;

    try {
      await updateMutation.mutateAsync({
        id: curriculum.id,
        data: {
          name: data.name,
          preferableCategoryId: Number(data.preferableCategoryId),
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
            <Label>{t("category")}</Label>
            <Select
              value={selectedCategoryId}
              onValueChange={(val) => setValue("preferableCategoryId", val)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("selectCategory")} />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={String(cat.id)}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.preferableCategoryId && (
              <p className="text-sm text-destructive">
                {errors.preferableCategoryId.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-curriculum-name">{t("name")}</Label>
            <Input
              id="edit-curriculum-name"
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
