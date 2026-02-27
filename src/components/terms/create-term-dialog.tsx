"use client";

import { useState } from "react";
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
import { Label } from "@/components/ui/label";
import { BlockEditor } from "@/components/shared/block-editor";
import { useCreateTerm } from "@/hooks/use-terms";
import { extractApiError } from "@/lib/api/error";

interface CreateTermDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateTermDialog({
  open,
  onOpenChange,
}: CreateTermDialogProps) {
  const t = useTranslations("terms");
  const tc = useTranslations("common");
  const createMutation = useCreateTerm();

  const [content, setContent] = useState("");
  const [contentError, setContentError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const stripped = content.replace(/<[^>]*>/g, "").trim();
    if (!stripped) {
      setContentError(t("contentRequired"));
      return;
    }

    setContentError(null);

    try {
      await createMutation.mutateAsync({ terms: content });
      toast.success(t("createSuccess"));
      setContent("");
      onOpenChange(false);
    } catch (err) {
      toast.error(extractApiError(err));
    }
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      setContent("");
      setContentError(null);
      createMutation.reset();
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("createTitle")}</DialogTitle>
          <DialogDescription>{t("createDescription")}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>{t("content")}</Label>
            <BlockEditor
              content={content}
              onChange={setContent}
              placeholder={t("contentPlaceholder")}
            />
            {contentError && (
              <p className="text-sm text-destructive">{contentError}</p>
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
