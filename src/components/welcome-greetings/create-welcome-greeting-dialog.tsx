"use client";

import { useState, useRef } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { BlockEditor } from "@/components/shared/block-editor";
import { useCreateWelcomeGreeting } from "@/hooks/use-welcome-greetings";
import { extractApiError } from "@/lib/api/error";
import type { WelcomeGreetingType } from "@/types";

const MAX_FILE_SIZE = 55 * 1024 * 1024; // 55 MB

const createWelcomeGreetingSchema = z.object({
  title: z.string().min(1, "Title is required"),
  link: z.string().optional(),
});

type CreateWelcomeGreetingFormData = z.infer<
  typeof createWelcomeGreetingSchema
>;

interface CreateWelcomeGreetingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateWelcomeGreetingDialog({
  open,
  onOpenChange,
}: CreateWelcomeGreetingDialogProps) {
  const t = useTranslations("welcomeGreetings");
  const tc = useTranslations("common");
  const createMutation = useCreateWelcomeGreeting();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [type, setType] = useState<WelcomeGreetingType>("ADMIN");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateWelcomeGreetingFormData>({
    resolver: zodResolver(createWelcomeGreetingSchema),
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

  const onSubmit = async (data: CreateWelcomeGreetingFormData) => {
    if (!imageFile) {
      setImageError(t("imageRequired"));
      return;
    }

    const formData = new FormData();
    formData.append("title", data.title);
    if (description && description !== "<p></p>")
      formData.append("description", description);
    if (data.link) formData.append("link", data.link);
    formData.append("image", imageFile);
    formData.append("type", type);

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
    setDescription("");
    setType("ADMIN");
    createMutation.reset();
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) resetForm();
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("createTitle")}</DialogTitle>
          <DialogDescription>{t("createDescription")}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Image upload */}
          <div className="space-y-2">
            <Label>{t("image")}</Label>
            {imagePreview ? (
              <div className="group relative overflow-hidden rounded-lg border">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-48 w-full object-cover"
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
                className="flex h-48 w-full flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/30 text-muted-foreground transition-colors hover:border-primary/50 hover:bg-muted/50 hover:text-foreground"
              >
                <ImagePlus className="h-10 w-10" />
                <div className="text-center">
                  <p className="text-sm font-medium">
                    {t("imageUploadHint")}
                  </p>
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

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="greeting-title">{t("titleColumn")}</Label>
            <Textarea
              id="greeting-title"
              placeholder={t("titlePlaceholder")}
              {...register("title")}
            />
            {errors.title && (
              <p className="text-sm text-destructive">
                {errors.title.message}
              </p>
            )}
          </div>

          {/* Link & Type side by side */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="greeting-link">{t("link")}</Label>
              <Input
                id="greeting-link"
                placeholder={t("linkPlaceholder")}
                {...register("link")}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("type")}</Label>
              <Select
                value={type}
                onValueChange={(val) =>
                  setType(val as WelcomeGreetingType)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">{t("typeAdmin")}</SelectItem>
                  <SelectItem value="USER">{t("typeUser")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Rich text description */}
          <div className="space-y-2">
            <Label>{t("description")}</Label>
            <BlockEditor
              content={description}
              onChange={setDescription}
              placeholder={t("descriptionPlaceholder")}
            />
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
