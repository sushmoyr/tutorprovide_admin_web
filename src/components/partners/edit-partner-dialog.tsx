"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { Loader2, Upload, X, ImagePlus } from "lucide-react";
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
import { useUpdatePartner } from "@/hooks/use-partners";
import { extractApiError } from "@/lib/api/error";
import type { Partner } from "@/types";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const schema = z.object({
  name: z.string().min(1, "Name is required"),
});

type EditFormData = z.infer<typeof schema>;

interface EditPartnerDialogProps {
  partner: Partner | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditPartnerDialog({
  partner,
  open,
  onOpenChange,
}: EditPartnerDialogProps) {
  const t = useTranslations("partners");
  const tc = useTranslations("common");
  const updateMutation = useUpdatePartner();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditFormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (partner && open) {
      reset({ name: partner.name });
      setLogoFile(null);
      setLogoPreview(partner.logo || null);
      setLogoError(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [partner, open, reset]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setLogoError(null);

    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      setLogoError(t("logoTooLarge"));
      return;
    }

    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const clearNewLogo = () => {
    setLogoFile(null);
    setLogoPreview(partner?.logo || null);
    setLogoError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onSubmit = async (data: EditFormData) => {
    if (!partner) return;

    const formData = new globalThis.FormData();
    formData.append("name", data.name);
    if (logoFile) formData.append("logo", logoFile);

    try {
      await updateMutation.mutateAsync({ id: partner.id, data: formData });
      toast.success(t("editSuccess"));
      onOpenChange(false);
    } catch (err) {
      toast.error(extractApiError(err));
    }
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      reset();
      setLogoFile(null);
      setLogoPreview(null);
      setLogoError(null);
      updateMutation.reset();
    }
    onOpenChange(isOpen);
  };

  const hasNewLogo = logoFile !== null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("editTitle")}</DialogTitle>
          <DialogDescription>{t("editDescription")}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Logo upload */}
          <div className="flex flex-col items-center gap-3">
            <Label>{t("logo")}</Label>
            {logoPreview ? (
              <div className="group relative">
                <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-xl border bg-white p-2">
                  <img
                    src={logoPreview}
                    alt="Preview"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <div className="absolute inset-0 flex items-center justify-center gap-1 rounded-xl bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-3.5 w-3.5" />
                  </Button>
                  {hasNewLogo && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="h-7 w-7"
                      onClick={clearNewLogo}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex h-28 w-28 flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-muted-foreground/25 bg-muted/30 text-muted-foreground transition-colors hover:border-primary/50 hover:bg-muted/50 hover:text-foreground"
              >
                <ImagePlus className="h-8 w-8" />
                <span className="text-xs">{t("uploadLogo")}</span>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoChange}
            />
            {logoError && (
              <p className="text-sm text-destructive">{logoError}</p>
            )}
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="edit-partner-name">{t("name")}</Label>
            <Input
              id="edit-partner-name"
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
