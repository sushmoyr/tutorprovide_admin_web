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
import { useUpdateDivision } from "@/hooks/use-divisions";
import { extractApiError } from "@/lib/api/error";
import type { Division } from "@/types";

const editDivisionSchema = z.object({
  name: z.string().min(1, "Division name is required"),
});

type EditDivisionFormData = z.infer<typeof editDivisionSchema>;

interface EditDivisionDialogProps {
  division: Division | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditDivisionDialog({
  division,
  open,
  onOpenChange,
}: EditDivisionDialogProps) {
  const t = useTranslations("divisions");
  const tc = useTranslations("common");
  const updateMutation = useUpdateDivision();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditDivisionFormData>({
    resolver: zodResolver(editDivisionSchema),
  });

  useEffect(() => {
    if (division && open) {
      reset({
        name: division.name,
      });
    }
  }, [division, open, reset]);

  const onSubmit = async (data: EditDivisionFormData) => {
    if (!division) return;

    try {
      await updateMutation.mutateAsync({ id: division.id, data });
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
