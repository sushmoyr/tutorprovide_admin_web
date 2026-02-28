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
import { useUpdateLivingLocation } from "@/hooks/use-living-locations";
import { useAreas } from "@/hooks/use-areas";
import { extractApiError } from "@/lib/api/error";
import type { LivingLocation } from "@/types";

const editLivingLocationSchema = z.object({
  areaId: z.string().min(1, "Area is required"),
  name: z.string().min(1, "Location name is required"),
});

type EditLivingLocationFormData = z.infer<typeof editLivingLocationSchema>;

interface EditLivingLocationDialogProps {
  location: LivingLocation | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditLivingLocationDialog({
  location,
  open,
  onOpenChange,
}: EditLivingLocationDialogProps) {
  const t = useTranslations("livingLocations");
  const tc = useTranslations("common");
  const updateMutation = useUpdateLivingLocation();

  const { data: areasData } = useAreas({ size: 1000 });
  const areas = areasData?.data ?? [];

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<EditLivingLocationFormData>({
    resolver: zodResolver(editLivingLocationSchema),
  });

  useEffect(() => {
    if (location && open) {
      reset({
        areaId: String(location.area.id),
        name: location.name,
      });
    }
  }, [location, open, reset]);

  const onSubmit = async (data: EditLivingLocationFormData) => {
    if (!location) return;

    try {
      await updateMutation.mutateAsync({
        id: location.id,
        data: {
          name: data.name,
          areaId: Number(data.areaId),
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
            <Label>{t("area")}</Label>
            <Controller
              name="areaId"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("selectArea")} />
                  </SelectTrigger>
                  <SelectContent>
                    {areas.map((a) => (
                      <SelectItem key={a.id} value={String(a.id)}>
                        {a.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.areaId && (
              <p className="text-sm text-destructive">
                {errors.areaId.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-location-name">{t("name")}</Label>
            <Input
              id="edit-location-name"
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
