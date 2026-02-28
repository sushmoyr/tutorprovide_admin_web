"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUpdateDistrict } from "@/hooks/use-districts";
import { useDivisions } from "@/hooks/use-divisions";
import { extractApiError } from "@/lib/api/error";
import type { District } from "@/types";

const editDistrictSchema = z.object({
  divisionId: z.string().min(1, "Division is required"),
  name: z.string().min(1, "District name is required"),
});

type EditDistrictFormData = z.infer<typeof editDistrictSchema>;

interface EditDistrictDialogProps {
  district: District | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditDistrictDialog({
  district,
  open,
  onOpenChange,
}: EditDistrictDialogProps) {
  const t = useTranslations("districts");
  const tc = useTranslations("common");
  const updateMutation = useUpdateDistrict();

  const { data: divisionsData } = useDivisions();
  const divisions = divisionsData?.data ?? [];

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<EditDistrictFormData>({
    resolver: zodResolver(editDistrictSchema),
  });

  useEffect(() => {
    if (district && open) {
      reset({
        divisionId: String(district.division.id),
        name: district.name,
      });
    }
  }, [district, open, reset]);

  const onSubmit = async (data: EditDistrictFormData) => {
    if (!district) return;

    try {
      await updateMutation.mutateAsync({
        id: district.id,
        data: {
          name: data.name,
          divisionId: Number(data.divisionId),
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
            <Label>{t("division")}</Label>
            <Controller
              name="divisionId"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("selectDivision")} />
                  </SelectTrigger>
                  <SelectContent>
                    {divisions.map((d) => (
                      <SelectItem key={d.id} value={String(d.id)}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.divisionId && (
              <p className="text-sm text-destructive">
                {errors.divisionId.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-district-name">{t("name")}</Label>
            <Input
              id="edit-district-name"
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
