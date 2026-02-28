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
import { useCreateDesignation } from "@/hooks/use-designations";
import { extractApiError } from "@/lib/api/error";

const createDesignationSchema = z.object({
  name: z.string().min(1, "Designation name is required"),
});

type CreateDesignationFormData = z.infer<typeof createDesignationSchema>;

interface CreateDesignationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateDesignationDialog({
  open,
  onOpenChange,
}: CreateDesignationDialogProps) {
  const t = useTranslations("designations");
  const tc = useTranslations("common");
  const createMutation = useCreateDesignation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateDesignationFormData>({
    resolver: zodResolver(createDesignationSchema),
  });

  const onSubmit = async (data: CreateDesignationFormData) => {
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
