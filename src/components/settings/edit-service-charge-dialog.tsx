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
import { useUpdateServiceCharge } from "@/hooks/use-service-charges";
import { extractApiError } from "@/lib/api/error";
import type { ServiceCharge } from "@/types";

const editServiceChargeSchema = z.object({
  charge: z.string().min(1, "Charge is required"),
});

type EditServiceChargeFormData = z.infer<typeof editServiceChargeSchema>;

function formatServiceType(serviceType: string): string {
  return serviceType
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

interface EditServiceChargeDialogProps {
  serviceCharge: ServiceCharge | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditServiceChargeDialog({
  serviceCharge,
  open,
  onOpenChange,
}: EditServiceChargeDialogProps) {
  const t = useTranslations("settings");
  const tc = useTranslations("common");
  const updateMutation = useUpdateServiceCharge();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditServiceChargeFormData>({
    resolver: zodResolver(editServiceChargeSchema),
  });

  useEffect(() => {
    if (serviceCharge && open) {
      reset({ charge: String(serviceCharge.charge) });
    }
  }, [serviceCharge, open, reset]);

  const onSubmit = async (data: EditServiceChargeFormData) => {
    if (!serviceCharge) return;

    try {
      await updateMutation.mutateAsync({
        serviceType: serviceCharge.serviceType,
        charge: Number(data.charge),
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
            <Label>{t("serviceType")}</Label>
            <Input
              value={
                serviceCharge ? formatServiceType(serviceCharge.serviceType) : ""
              }
              disabled
              className="bg-muted"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-charge">{t("charge")}</Label>
            <Input
              id="edit-charge"
              type="number"
              min={0}
              step="any"
              placeholder={t("chargePlaceholder")}
              {...register("charge")}
            />
            {errors.charge && (
              <p className="text-sm text-destructive">
                {errors.charge.message}
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
