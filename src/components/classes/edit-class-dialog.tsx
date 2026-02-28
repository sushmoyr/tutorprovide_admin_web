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
import { useUpdateClass } from "@/hooks/use-classes";
import { useCategories } from "@/hooks/use-categories";
import { extractApiError } from "@/lib/api/error";
import type { PreferableClass } from "@/types";

const editClassSchema = z.object({
  categoryId: z.string().min(1, "Category is required"),
  name: z.string().min(1, "Name is required"),
  numericValue: z.string().min(1, "Numeric value is required"),
});

type EditClassFormData = z.infer<typeof editClassSchema>;

interface EditClassDialogProps {
  prefClass: PreferableClass | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditClassDialog({
  prefClass,
  open,
  onOpenChange,
}: EditClassDialogProps) {
  const t = useTranslations("classes");
  const tc = useTranslations("common");
  const updateMutation = useUpdateClass();
  const { data: categoriesData } = useCategories({ size: 1000 });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EditClassFormData>({
    resolver: zodResolver(editClassSchema),
  });

  const selectedCategoryId = watch("categoryId");
  const categories = categoriesData?.data ?? [];

  useEffect(() => {
    if (prefClass && open) {
      reset({
        categoryId: String(prefClass.preferableCategory.id),
        name: prefClass.name,
        numericValue: String(prefClass.numericValue),
      });
    }
  }, [prefClass, open, reset]);

  const onSubmit = async (data: EditClassFormData) => {
    if (!prefClass) return;

    try {
      await updateMutation.mutateAsync({
        id: prefClass.id,
        data: {
          name: data.name,
          numericValue: Number(data.numericValue),
          categoryId: Number(data.categoryId),
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
              onValueChange={(val) => setValue("categoryId", val)}
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
            {errors.categoryId && (
              <p className="text-sm text-destructive">
                {errors.categoryId.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-class-name">{t("name")}</Label>
            <Input
              id="edit-class-name"
              placeholder={t("namePlaceholder")}
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-destructive">
                {errors.name.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-class-numeric-value">
              {t("numericValue")}
            </Label>
            <Input
              id="edit-class-numeric-value"
              placeholder={t("numericValuePlaceholder")}
              {...register("numericValue")}
            />
            {errors.numericValue && (
              <p className="text-sm text-destructive">
                {errors.numericValue.message}
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
