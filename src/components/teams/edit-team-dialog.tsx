"use client";

import { useState, useRef, useEffect } from "react";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUpdateTeam } from "@/hooks/use-teams";
import { extractApiError } from "@/lib/api/error";
import type { TeamMember } from "@/types";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const editTeamSchema = z.object({
  name: z.string().min(1, "Name is required"),
  designation: z.string().min(1, "Designation is required"),
  email: z.string().min(1, "Email is required").email("Invalid email"),
  facebook: z.string().optional(),
  twitter: z.string().optional(),
  linkdin: z.string().optional(),
  status: z.string().min(1, "Status is required"),
});

type EditTeamFormData = z.infer<typeof editTeamSchema>;

interface EditTeamDialogProps {
  member: TeamMember | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditTeamDialog({
  member,
  open,
  onOpenChange,
}: EditTeamDialogProps) {
  const t = useTranslations("teams");
  const tc = useTranslations("common");
  const updateMutation = useUpdateTeam();

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
  } = useForm<EditTeamFormData>({
    resolver: zodResolver(editTeamSchema),
  });

  useEffect(() => {
    if (member && open) {
      reset({
        name: member.name,
        designation: member.designation,
        email: member.email,
        facebook: member.facebook || "",
        twitter: member.twitter || "",
        linkdin: member.linkdin || "",
        status: String(member.status),
      });
      setImageFile(null);
      setImagePreview(member.image || null);
      setImageError(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [member, open, reset]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setImageError(null);

    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      setImageError(t("imageTooLarge"));
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const clearNewImage = () => {
    setImageFile(null);
    setImagePreview(member?.image || null);
    setImageError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onSubmit = async (data: EditTeamFormData) => {
    if (!member) return;

    const formData = new globalThis.FormData();
    formData.append("name", data.name);
    formData.append("designation", data.designation);
    formData.append("email", data.email);
    formData.append("facebook", data.facebook || "");
    formData.append("twitter", data.twitter || "");
    formData.append("linkdin", data.linkdin || "");
    formData.append("status", data.status);
    if (imageFile) formData.append("image", imageFile);

    try {
      await updateMutation.mutateAsync({ id: member.id, data: formData });
      toast.success(t("editSuccess"));
      onOpenChange(false);
    } catch (err) {
      toast.error(extractApiError(err));
    }
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      reset();
      setImageFile(null);
      setImagePreview(null);
      setImageError(null);
      updateMutation.reset();
    }
    onOpenChange(isOpen);
  };

  const hasNewImage = imageFile !== null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("editTitle")}</DialogTitle>
          <DialogDescription>{t("editDescription")}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Image upload */}
          <div className="flex flex-col items-center gap-3">
            <Label>{t("image")}</Label>
            {imagePreview ? (
              <div className="group relative">
                <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="absolute inset-0 flex items-center justify-center gap-1 rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-3.5 w-3.5" />
                  </Button>
                  {hasNewImage && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="h-7 w-7"
                      onClick={clearNewImage}
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
                className="flex h-28 w-28 flex-col items-center justify-center gap-1.5 rounded-full border-2 border-dashed border-muted-foreground/25 bg-muted/30 text-muted-foreground transition-colors hover:border-primary/50 hover:bg-muted/50 hover:text-foreground"
              >
                <ImagePlus className="h-8 w-8" />
                <span className="text-xs">{t("uploadImage")}</span>
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

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="edit-team-name">{t("name")}</Label>
              <Input
                id="edit-team-name"
                placeholder={t("namePlaceholder")}
                {...register("name")}
              />
              {errors.name && (
                <p className="text-sm text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Designation */}
            <div className="space-y-2">
              <Label htmlFor="edit-team-designation">{t("designation")}</Label>
              <Input
                id="edit-team-designation"
                placeholder={t("designationPlaceholder")}
                {...register("designation")}
              />
              {errors.designation && (
                <p className="text-sm text-destructive">
                  {errors.designation.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="edit-team-email">{t("email")}</Label>
              <Input
                id="edit-team-email"
                type="email"
                placeholder={t("emailPlaceholder")}
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label>{t("status")}</Label>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">{t("statusExecutive")}</SelectItem>
                      <SelectItem value="1">
                        {t("statusManagement")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.status && (
                <p className="text-sm text-destructive">
                  {errors.status.message}
                </p>
              )}
            </div>

            {/* Facebook */}
            <div className="space-y-2">
              <Label htmlFor="edit-team-facebook">
                {t("facebook")}{" "}
                <span className="text-muted-foreground">({tc("optional")})</span>
              </Label>
              <Input
                id="edit-team-facebook"
                placeholder={t("facebookPlaceholder")}
                {...register("facebook")}
              />
            </div>

            {/* Twitter */}
            <div className="space-y-2">
              <Label htmlFor="edit-team-twitter">
                {t("twitter")}{" "}
                <span className="text-muted-foreground">({tc("optional")})</span>
              </Label>
              <Input
                id="edit-team-twitter"
                placeholder={t("twitterPlaceholder")}
                {...register("twitter")}
              />
            </div>

            {/* LinkedIn */}
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="edit-team-linkdin">
                {t("linkedin")}{" "}
                <span className="text-muted-foreground">({tc("optional")})</span>
              </Label>
              <Input
                id="edit-team-linkdin"
                placeholder={t("linkedinPlaceholder")}
                {...register("linkdin")}
              />
            </div>
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
