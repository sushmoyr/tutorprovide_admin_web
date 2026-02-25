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
import { useCreateCounter } from "@/hooks/use-counters";
import { extractApiError } from "@/lib/api/error";

const createCounterSchema = z.object({
  counterName: z.string().min(1, "Counter name is required"),
  value: z.string().min(1, "Value is required"),
});

type CreateCounterFormData = z.infer<typeof createCounterSchema>;

interface CreateCounterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateCounterDialog({
  open,
  onOpenChange,
}: CreateCounterDialogProps) {
  const t = useTranslations("counters");
  const tc = useTranslations("common");
  const createMutation = useCreateCounter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateCounterFormData>({
    resolver: zodResolver(createCounterSchema),
  });

  const onSubmit = async (data: CreateCounterFormData) => {
    try {
      await createMutation.mutateAsync(data);
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
            <Label htmlFor="counterName">{t("name")}</Label>
            <Input
              id="counterName"
              placeholder={t("namePlaceholder")}
              {...register("counterName")}
            />
            {errors.counterName && (
              <p className="text-sm text-destructive">
                {errors.counterName.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="value">{t("value")}</Label>
            <Input
              id="value"
              type="number"
              placeholder="0"
              {...register("value")}
            />
            {errors.value && (
              <p className="text-sm text-destructive">
                {errors.value.message}
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
