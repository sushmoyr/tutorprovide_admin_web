"use client";

import { useState, useEffect } from "react";
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
import { useUpdateTerm } from "@/hooks/use-terms";
import { extractApiError } from "@/lib/api/error";
import type { Term } from "@/types";

interface EditTermDialogProps {
  term: Term | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditTermDialog({
  term,
  open,
  onOpenChange,
}: EditTermDialogProps) {
  const t = useTranslations("terms");
  const tc = useTranslations("common");
  const updateMutation = useUpdateTerm();

  const [content, setContent] = useState("");
  const [contentError, setContentError] = useState<string | null>(null);

  useEffect(() => {
    if (term && open) {
      setContent(term.terms);
      setContentError(null);
    }
  }, [term, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!term) return;

    const stripped = content.replace(/<[^>]*>/g, "").trim();
    if (!stripped) {
      setContentError(t("contentRequired"));
      return;
    }

    setContentError(null);

    try {
      await updateMutation.mutateAsync({
        id: term.id,
        data: { terms: content },
      });
      toast.success(t("editSuccess"));
      onOpenChange(false);
    } catch (err) {
      toast.error(extractApiError(err));
    }
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      setContent("");
      setContentError(null);
      updateMutation.reset();
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("editTitle")}</DialogTitle>
          <DialogDescription>{t("editDescription")}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>{t("content")}</Label>
            <BlockEditor
              key={term?.id}
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
