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
import { useUpdateCounter } from "@/hooks/use-counters";
import { extractApiError } from "@/lib/api/error";
import type { Counter } from "@/types";

const editCounterSchema = z.object({
  counterName: z.string().min(1, "Counter name is required"),
  value: z.string().min(1, "Value is required"),
});

type EditCounterFormData = z.infer<typeof editCounterSchema>;

interface EditCounterDialogProps {
  counter: Counter | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditCounterDialog({
  counter,
  open,
  onOpenChange,
}: EditCounterDialogProps) {
  const t = useTranslations("counters");
  const tc = useTranslations("common");
  const updateMutation = useUpdateCounter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditCounterFormData>({
    resolver: zodResolver(editCounterSchema),
  });

  useEffect(() => {
    if (counter && open) {
      reset({
        counterName: counter.counterName,
        value: String(counter.value),
      });
    }
  }, [counter, open, reset]);

  const onSubmit = async (data: EditCounterFormData) => {
    if (!counter) return;

    try {
      await updateMutation.mutateAsync({ id: counter.id, data });
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
            <Label htmlFor="edit-counterName">{t("name")}</Label>
            <Input
              id="edit-counterName"
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
            <Label htmlFor="edit-value">{t("value")}</Label>
            <Input
              id="edit-value"
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
