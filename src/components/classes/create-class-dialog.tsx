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
import { useCreateClass } from "@/hooks/use-classes";
import { useCategories } from "@/hooks/use-categories";
import { extractApiError } from "@/lib/api/error";

const createClassSchema = z.object({
  categoryId: z.string().min(1, "Category is required"),
  name: z.string().min(1, "Name is required"),
  numericValue: z.string().min(1, "Numeric value is required"),
});

type CreateClassFormData = z.infer<typeof createClassSchema>;

interface CreateClassDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateClassDialog({
  open,
  onOpenChange,
}: CreateClassDialogProps) {
  const t = useTranslations("classes");
  const tc = useTranslations("common");
  const createMutation = useCreateClass();
  const { data: categoriesData } = useCategories({ size: 1000 });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateClassFormData>({
    resolver: zodResolver(createClassSchema),
    defaultValues: {
      categoryId: "",
      name: "",
      numericValue: "",
    },
  });

  const selectedCategoryId = watch("categoryId");
  const categories = categoriesData?.data ?? [];

  const onSubmit = async (data: CreateClassFormData) => {
    try {
      await createMutation.mutateAsync({
        name: data.name,
        numericValue: Number(data.numericValue),
        categoryId: Number(data.categoryId),
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
            <Label htmlFor="class-name">{t("name")}</Label>
            <Input
              id="class-name"
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
            <Label htmlFor="class-numeric-value">{t("numericValue")}</Label>
            <Input
              id="class-numeric-value"
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
