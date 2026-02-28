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
import { useCreateCurriculum } from "@/hooks/use-curriculum";
import { useCategories } from "@/hooks/use-categories";
import { extractApiError } from "@/lib/api/error";

const createCurriculumSchema = z.object({
  preferableCategoryId: z.string().min(1, "Category is required"),
  name: z.string().min(1, "Name is required"),
});

type CreateCurriculumFormData = z.infer<typeof createCurriculumSchema>;

interface CreateCurriculumDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateCurriculumDialog({
  open,
  onOpenChange,
}: CreateCurriculumDialogProps) {
  const t = useTranslations("curriculum");
  const tc = useTranslations("common");
  const createMutation = useCreateCurriculum();
  const { data: categoriesData } = useCategories({ size: 1000 });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateCurriculumFormData>({
    resolver: zodResolver(createCurriculumSchema),
    defaultValues: {
      preferableCategoryId: "",
      name: "",
    },
  });

  const selectedCategoryId = watch("preferableCategoryId");
  const categories = categoriesData?.data ?? [];

  const onSubmit = async (data: CreateCurriculumFormData) => {
    try {
      await createMutation.mutateAsync({
        name: data.name,
        preferableCategoryId: Number(data.preferableCategoryId),
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
            <Label htmlFor="curriculum-name">{t("name")}</Label>
            <Input
              id="curriculum-name"
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
