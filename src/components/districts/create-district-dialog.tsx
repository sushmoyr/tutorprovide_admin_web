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
import { useCreateDistrict } from "@/hooks/use-districts";
import { useDivisions } from "@/hooks/use-divisions";
import { extractApiError } from "@/lib/api/error";

const createDistrictSchema = z.object({
  divisionId: z.string().min(1, "Division is required"),
  name: z.string().min(1, "District name is required"),
});

type CreateDistrictFormData = z.infer<typeof createDistrictSchema>;

interface CreateDistrictDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateDistrictDialog({
  open,
  onOpenChange,
}: CreateDistrictDialogProps) {
  const t = useTranslations("districts");
  const tc = useTranslations("common");
  const createMutation = useCreateDistrict();

  const { data: divisionsData } = useDivisions();
  const divisions = divisionsData?.data ?? [];

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<CreateDistrictFormData>({
    resolver: zodResolver(createDistrictSchema),
    defaultValues: {
      divisionId: "",
      name: "",
    },
  });

  const onSubmit = async (data: CreateDistrictFormData) => {
    try {
      await createMutation.mutateAsync({
        name: data.name,
        divisionId: Number(data.divisionId),
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
            <Label htmlFor="district-name">{t("name")}</Label>
            <Input
              id="district-name"
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
