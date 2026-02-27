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
import { useUpdateCoupon } from "@/hooks/use-coupons";
import { extractApiError } from "@/lib/api/error";
import type { Coupon } from "@/types";

const editCouponSchema = z.object({
  name: z.string().min(1, "Coupon name is required"),
  discountAmount: z.string().min(1, "Discount amount is required"),
  maxUsePerUser: z.string().min(1, "Max use per user is required"),
  maxUser: z.string().min(1, "Max user is required"),
  expiryDate: z.string().min(1, "Expiry date is required"),
});

type EditCouponFormData = z.infer<typeof editCouponSchema>;

interface EditCouponDialogProps {
  coupon: Coupon | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditCouponDialog({
  coupon,
  open,
  onOpenChange,
}: EditCouponDialogProps) {
  const t = useTranslations("coupons");
  const tc = useTranslations("common");
  const updateMutation = useUpdateCoupon();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditCouponFormData>({
    resolver: zodResolver(editCouponSchema),
  });

  useEffect(() => {
    if (coupon && open) {
      reset({
        name: coupon.name,
        discountAmount: String(coupon.discountAmount),
        maxUsePerUser: String(coupon.maxUsePerUser),
        maxUser: String(coupon.maxUser),
        expiryDate: coupon.expiryDate.split("T")[0] ?? "",
      });
    }
  }, [coupon, open, reset]);

  const onSubmit = async (data: EditCouponFormData) => {
    if (!coupon) return;

    try {
      await updateMutation.mutateAsync({
        id: coupon.id,
        data: {
          name: data.name,
          discountAmount: Number(data.discountAmount),
          maxUsePerUser: Number(data.maxUsePerUser),
          maxUser: Number(data.maxUser),
          expiryDate: data.expiryDate,
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
            <Label htmlFor="edit-name">{t("name")}</Label>
            <Input
              id="edit-name"
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
            <Label htmlFor="edit-discountAmount">{t("discountAmount")}</Label>
            <Input
              id="edit-discountAmount"
              type="number"
              placeholder="0"
              {...register("discountAmount")}
            />
            {errors.discountAmount && (
              <p className="text-sm text-destructive">
                {errors.discountAmount.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-maxUsePerUser">{t("maxUsePerUser")}</Label>
            <Input
              id="edit-maxUsePerUser"
              type="number"
              placeholder="1"
              {...register("maxUsePerUser")}
            />
            {errors.maxUsePerUser && (
              <p className="text-sm text-destructive">
                {errors.maxUsePerUser.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-maxUser">{t("maxUser")}</Label>
            <Input
              id="edit-maxUser"
              type="number"
              placeholder="1"
              {...register("maxUser")}
            />
            {errors.maxUser && (
              <p className="text-sm text-destructive">
                {errors.maxUser.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-expiryDate">{t("expiryDate")}</Label>
            <Input
              id="edit-expiryDate"
              type="date"
              {...register("expiryDate")}
            />
            {errors.expiryDate && (
              <p className="text-sm text-destructive">
                {errors.expiryDate.message}
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
