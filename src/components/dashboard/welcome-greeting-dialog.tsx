"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useWelcomeGreetings } from "@/hooks/use-dashboard";

const GREETING_DISMISSED_KEY = "welcome-greeting-dismissed";

export function WelcomeGreetingDialog() {
  const { data: greetings } = useWelcomeGreetings();
  const [open, setOpen] = useState(false);

  const greeting = greetings?.[0];

  useEffect(() => {
    if (!greeting) return;
    const dismissed = sessionStorage.getItem(GREETING_DISMISSED_KEY);
    if (!dismissed) {
      setOpen(true);
    }
  }, [greeting]);

  const handleClose = (value: boolean) => {
    if (!value) {
      sessionStorage.setItem(GREETING_DISMISSED_KEY, "true");
    }
    setOpen(value);
  };

  if (!greeting) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl p-0 overflow-hidden">
        {greeting.imageUrl ? (
          <a
            href={greeting.link || undefined}
            target="_blank"
            rel="noopener noreferrer"
            className={greeting.link ? "cursor-pointer" : "cursor-default"}
          >
            <Image
              src={greeting.imageUrl}
              alt={greeting.title}
              width={520}
              height={400}
              unoptimized
              className="w-full h-auto object-cover"
            />
          </a>
        ) : (
          <div className="p-6">
            <DialogHeader>
              <DialogTitle className="text-xl">{greeting.title}</DialogTitle>
            </DialogHeader>
            <div
              className="mt-3 text-sm text-muted-foreground prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: greeting.description }}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
