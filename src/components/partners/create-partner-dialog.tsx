"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { Loader2, ImagePlus, Upload, X } from "lucide-react";
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
import { useCreatePartner } from "@/hooks/use-partners";
import { extractApiError } from "@/lib/api/error";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const schema = z.object({
  name: z.string().min(1, "Name is required"),
});

type FormData = z.infer<typeof schema>;

interface CreatePartnerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreatePartnerDialog({
  open,
  onOpenChange,
}: CreatePartnerDialogProps) {
  const t = useTranslations("partners");
  const tc = useTranslations("common");
  const createMutation = useCreatePartner();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setLogoError(null);

    if (!file) {
      setLogoFile(null);
      setLogoPreview(null);
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setLogoError(t("logoTooLarge"));
      setLogoFile(null);
      setLogoPreview(null);
      return;
    }

    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const clearLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    setLogoError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onSubmit = async (data: FormData) => {
    if (!logoFile) {
      setLogoError(t("logoRequired"));
      return;
    }

    const formData = new globalThis.FormData();
    formData.append("name", data.name);
    formData.append("logo", logoFile);

    try {
      await createMutation.mutateAsync(formData);
      toast.success(t("createSuccess"));
      resetForm();
      onOpenChange(false);
    } catch (err) {
      toast.error(extractApiError(err));
    }
  };

  const resetForm = () => {
    reset();
    clearLogo();
    createMutation.reset();
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) resetForm();
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("createTitle")}</DialogTitle>
          <DialogDescription>{t("createDescription")}</DialogDescription>
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
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="h-7 w-7"
                    onClick={clearLogo}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
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
            <Label htmlFor="partner-name">{t("name")}</Label>
            <Input
              id="partner-name"
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
