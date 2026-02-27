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
import { useCreateCoupon } from "@/hooks/use-coupons";
import { extractApiError } from "@/lib/api/error";

const createCouponSchema = z.object({
  name: z.string().min(1, "Coupon name is required"),
  discountAmount: z.string().min(1, "Discount amount is required"),
  maxUsePerUser: z.string().min(1, "Max use per user is required"),
  maxUser: z.string().min(1, "Max user is required"),
  expiryDate: z.string().min(1, "Expiry date is required"),
});

type CreateCouponFormData = z.infer<typeof createCouponSchema>;

interface CreateCouponDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateCouponDialog({
  open,
  onOpenChange,
}: CreateCouponDialogProps) {
  const t = useTranslations("coupons");
  const tc = useTranslations("common");
  const createMutation = useCreateCoupon();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateCouponFormData>({
    resolver: zodResolver(createCouponSchema),
  });

  const onSubmit = async (data: CreateCouponFormData) => {
    try {
      await createMutation.mutateAsync({
        name: data.name,
        discountAmount: Number(data.discountAmount),
        maxUsePerUser: Number(data.maxUsePerUser),
        maxUser: Number(data.maxUser),
        expiryDate: data.expiryDate,
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
            <Label htmlFor="name">{t("name")}</Label>
            <Input
              id="name"
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
            <Label htmlFor="discountAmount">{t("discountAmount")}</Label>
            <Input
              id="discountAmount"
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
            <Label htmlFor="maxUsePerUser">{t("maxUsePerUser")}</Label>
            <Input
              id="maxUsePerUser"
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
            <Label htmlFor="maxUser">{t("maxUser")}</Label>
            <Input
              id="maxUser"
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
            <Label htmlFor="expiryDate">{t("expiryDate")}</Label>
            <Input
              id="expiryDate"
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
