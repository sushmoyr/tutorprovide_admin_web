"use client";

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
import { useCreateLivingLocation } from "@/hooks/use-living-locations";
import { useAreas } from "@/hooks/use-areas";
import { extractApiError } from "@/lib/api/error";

const createLivingLocationSchema = z.object({
  areaId: z.string().min(1, "Area is required"),
  name: z.string().min(1, "Location name is required"),
});

type CreateLivingLocationFormData = z.infer<typeof createLivingLocationSchema>;

interface CreateLivingLocationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateLivingLocationDialog({
  open,
  onOpenChange,
}: CreateLivingLocationDialogProps) {
  const t = useTranslations("livingLocations");
  const tc = useTranslations("common");
  const createMutation = useCreateLivingLocation();

  const { data: areasData } = useAreas({ size: 1000 });
  const areas = areasData?.data ?? [];

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<CreateLivingLocationFormData>({
    resolver: zodResolver(createLivingLocationSchema),
    defaultValues: {
      areaId: "",
      name: "",
    },
  });

  const onSubmit = async (data: CreateLivingLocationFormData) => {
    try {
      await createMutation.mutateAsync({
        name: data.name,
        areaId: Number(data.areaId),
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
            <Label htmlFor="location-name">{t("name")}</Label>
            <Input
              id="location-name"
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
