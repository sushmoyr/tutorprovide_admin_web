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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { BlockEditor } from "@/components/shared/block-editor";
import { useUpdateNotice } from "@/hooks/use-notices";
import { extractApiError } from "@/lib/api/error";
import type { Announcement, RecipientGroup, AnnouncementChannel } from "@/types";

const MAX_FILE_SIZE = 55 * 1024 * 1024; // 55 MB

const RECIPIENT_OPTIONS: RecipientGroup[] = ["TUTOR", "GUARDIAN", "EMPLOYEE", "GUEST"];
const CHANNEL_OPTIONS: AnnouncementChannel[] = ["EMAIL", "SMS", "PUSH_NOTIFICATION", "DEFAULT"];

const editNoticeSchema = z.object({
  title: z.string().min(1, "Title is required"),
});

type EditNoticeFormData = z.infer<typeof editNoticeSchema>;

interface EditNoticeDialogProps {
  notice: Announcement | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditNoticeDialog({
  notice,
  open,
  onOpenChange,
}: EditNoticeDialogProps) {
  const t = useTranslations("notices");
  const tc = useTranslations("common");
  const updateMutation = useUpdateNotice();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [details, setDetails] = useState("");
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [selectedRecipients, setSelectedRecipients] = useState<RecipientGroup[]>([]);
  const [selectedChannels, setSelectedChannels] = useState<AnnouncementChannel[]>([]);
  // Key to force BlockEditor remount when notice changes
  const [editorKey, setEditorKey] = useState(0);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditNoticeFormData>({
    resolver: zodResolver(editNoticeSchema),
  });

  useEffect(() => {
    if (notice && open) {
      reset({
        title: notice.title,
      });
      setDetails(notice.details ?? "");
      setDetailsError(null);
      setEditorKey((k) => k + 1);
      setImageFile(null);
      setImagePreview(notice.imageUrl || null);
      setImageError(null);
      setSelectedRecipients([...notice.recipientGroup]);
      setSelectedChannels([...notice.channels]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [notice, open, reset]);

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
    setImagePreview(notice?.imageUrl || null);
    setImageError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const toggleRecipient = (recipient: RecipientGroup) => {
    setSelectedRecipients((prev) =>
      prev.includes(recipient)
        ? prev.filter((r) => r !== recipient)
        : [...prev, recipient]
    );
  };

  const toggleChannel = (channel: AnnouncementChannel) => {
    setSelectedChannels((prev) =>
      prev.includes(channel)
        ? prev.filter((c) => c !== channel)
        : [...prev, channel]
    );
  };

  const onSubmit = async (data: EditNoticeFormData) => {
    if (!notice) return;

    if (!details || details === "<p></p>") {
      setDetailsError(t("detailsRequired"));
      return;
    }
    setDetailsError(null);

    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("details", details);
    if (imageFile) formData.append("image", imageFile);
    for (const r of selectedRecipients) {
      formData.append("recipientGroup", r);
    }
    for (const c of selectedChannels) {
      formData.append("channels", c);
    }

    try {
      await updateMutation.mutateAsync({ id: notice.id, data: formData });
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
      setDetails("");
      setDetailsError(null);
      setSelectedRecipients([]);
      setSelectedChannels([]);
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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Image upload */}
          <div className="space-y-2">
            <Label>
              {t("image")}{" "}
              <span className="text-muted-foreground text-xs">({tc("optional")})</span>
            </Label>
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
                  {hasNewImage && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={clearNewImage}
                    >
                      <X className="mr-1.5 h-3.5 w-3.5" />
                      {t("revertImage")}
                    </Button>
                  )}
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

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="edit-notice-title">{t("titleColumn")}</Label>
            <Textarea
              id="edit-notice-title"
              placeholder={t("titlePlaceholder")}
              {...register("title")}
            />
            {errors.title && (
              <p className="text-sm text-destructive">
                {errors.title.message}
              </p>
            )}
          </div>

          {/* Rich text details */}
          <div className="space-y-2">
            <Label>{t("details")}</Label>
            <BlockEditor
              key={editorKey}
              content={details}
              onChange={setDetails}
              placeholder={t("detailsPlaceholder")}
            />
            {detailsError && (
              <p className="text-sm text-destructive">{detailsError}</p>
            )}
          </div>

          {/* Recipient Group checkboxes */}
          <div className="space-y-2">
            <Label>{t("recipients")}</Label>
            <div className="flex flex-wrap gap-4">
              {RECIPIENT_OPTIONS.map((recipient) => (
                <label
                  key={recipient}
                  className="flex items-center gap-2 text-sm cursor-pointer"
                >
                  <Checkbox
                    checked={selectedRecipients.includes(recipient)}
                    onCheckedChange={() => toggleRecipient(recipient)}
                  />
                  {t(`recipient_${recipient}`)}
                </label>
              ))}
            </div>
          </div>

          {/* Channels checkboxes */}
          <div className="space-y-2">
            <Label>{t("channels")}</Label>
            <div className="flex flex-wrap gap-4">
              {CHANNEL_OPTIONS.map((channel) => (
                <label
                  key={channel}
                  className="flex items-center gap-2 text-sm cursor-pointer"
                >
                  <Checkbox
                    checked={selectedChannels.includes(channel)}
                    onCheckedChange={() => toggleChannel(channel)}
                  />
                  {t(`channel_${channel}`)}
                </label>
              ))}
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
