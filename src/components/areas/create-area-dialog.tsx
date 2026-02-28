"use client";

import { useState, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
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
import { useCreateArea } from "@/hooks/use-areas";
import { useDistricts } from "@/hooks/use-districts";
import { extractApiError } from "@/lib/api/error";

const MAX_FILE_SIZE = 55 * 1024 * 1024; // 55 MB

const createAreaSchema = z.object({
  districtId: z.string().min(1, "District is required"),
  name: z.string().min(1, "Area name is required"),
});

type CreateAreaFormData = z.infer<typeof createAreaSchema>;

interface CreateAreaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateAreaDialog({
  open,
  onOpenChange,
}: CreateAreaDialogProps) {
  const t = useTranslations("areas");
  const tc = useTranslations("common");
  const createMutation = useCreateArea();

  const { data: districtsData } = useDistricts({ size: 1000 });
  const districts = districtsData?.data ?? [];

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<CreateAreaFormData>({
    resolver: zodResolver(createAreaSchema),
    defaultValues: {
      districtId: "",
      name: "",
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setImageError(null);

    if (!file) {
      setImageFile(null);
      setImagePreview(null);
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setImageError(t("imageTooLarge"));
      setImageFile(null);
      setImagePreview(null);
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setImageError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onSubmit = async (data: CreateAreaFormData) => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("districtId", data.districtId);
    if (imageFile) formData.append("image", imageFile);

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
    clearImage();
    createMutation.reset();
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) resetForm();
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
            <Label>{t("district")}</Label>
            <Controller
              name="districtId"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("selectDistrict")} />
                  </SelectTrigger>
                  <SelectContent>
                    {districts.map((d) => (
                      <SelectItem key={d.id} value={String(d.id)}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.districtId && (
              <p className="text-sm text-destructive">
                {errors.districtId.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="area-name">{t("name")}</Label>
            <Input
              id="area-name"
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
            <Label>
              {t("image")}{" "}
              <span className="text-muted-foreground">({tc("optional")})</span>
            </Label>
            {imagePreview ? (
              <div className="group relative overflow-hidden rounded-lg border">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-36 w-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="mr-1.5 h-3.5 w-3.5" />
                    {t("changeImage")}
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={clearImage}
                  >
                    <X className="mr-1.5 h-3.5 w-3.5" />
                    {tc("delete")}
                  </Button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex h-36 w-full flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/30 text-muted-foreground transition-colors hover:border-primary/50 hover:bg-muted/50 hover:text-foreground"
              >
                <ImagePlus className="h-8 w-8" />
                <div className="text-center">
                  <p className="text-sm font-medium">{t("imageUploadHint")}</p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG, GIF up to 55 MB
                  </p>
                </div>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
            {imageError && (
              <p className="text-sm text-destructive">{imageError}</p>
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
