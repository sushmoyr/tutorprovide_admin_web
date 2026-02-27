"use client";

import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCreateRole } from "@/hooks/use-roles";
import { useAllPermissions } from "@/hooks/use-permissions";
import { extractApiError } from "@/lib/api/error";
import type { Permission } from "@/types";

const createRoleSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});

type CreateRoleFormData = z.infer<typeof createRoleSchema>;

interface PermissionGroup {
  prefix: string;
  permissions: Permission[];
}

function groupPermissions(permissions: Permission[]): PermissionGroup[] {
  const groups = permissions.reduce<Record<string, Permission[]>>((acc, p) => {
    const prefix = p.key.split(":")[0] ?? p.key;
    if (!acc[prefix]) {
      acc[prefix] = [];
    }
    acc[prefix].push(p);
    return acc;
  }, {});

  return Object.entries(groups)
    .map(([prefix, perms]) => ({ prefix, permissions: perms }))
    .sort((a, b) => a.prefix.localeCompare(b.prefix));
}

interface CreateRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateRoleDialog({ open, onOpenChange }: CreateRoleDialogProps) {
  const t = useTranslations("roles");
  const tc = useTranslations("common");
  const createMutation = useCreateRole();
  const { data: permissionsData, isLoading: permissionsLoading } = useAllPermissions();

  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateRoleFormData>({
    resolver: zodResolver(createRoleSchema),
  });

  const allPermissions = permissionsData?.data ?? [];
  const permissionGroups = groupPermissions(allPermissions);

  const togglePermission = (key: string) => {
    setPermissionError(null);
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const toggleGroup = (group: PermissionGroup) => {
    setPermissionError(null);
    const groupKeys = group.permissions.map((p) => p.key);
    const allSelected = groupKeys.every((k) => selectedKeys.has(k));

    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        groupKeys.forEach((k) => next.delete(k));
      } else {
        groupKeys.forEach((k) => next.add(k));
      }
      return next;
    });
  };

  const isGroupAllSelected = (group: PermissionGroup) =>
    group.permissions.every((p) => selectedKeys.has(p.key));

  const isGroupPartiallySelected = (group: PermissionGroup) =>
    group.permissions.some((p) => selectedKeys.has(p.key)) && !isGroupAllSelected(group);

  const onSubmit = async (data: CreateRoleFormData) => {
    if (selectedKeys.size === 0) {
      setPermissionError(t("permissionsRequired"));
      return;
    }

    try {
      await createMutation.mutateAsync({
        name: data.name,
        description: data.description || undefined,
        permissionKeys: Array.from(selectedKeys),
      });
      toast.success(t("createSuccess"));
      resetForm();
      onOpenChange(false);
    } catch (err) {
      toast.error(extractApiError(err));
    }
  };

  const resetForm = () => {
    reset();
    setSelectedKeys(new Set());
    setPermissionError(null);
    createMutation.reset();
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) resetForm();
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{t("createTitle")}</DialogTitle>
          <DialogDescription>{t("createDescription")}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="role-name">{t("name")}</Label>
              <Input
                id="role-name"
                placeholder={t("namePlaceholder")}
                {...register("name")}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="role-description">{t("description")}</Label>
              <Textarea
                id="role-description"
                placeholder={t("descriptionPlaceholder")}
                {...register("description")}
                className="min-h-9 resize-none"
                rows={1}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t("permissionsLabel")}</Label>
            {permissionsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : (
              <ScrollArea className="h-[350px] rounded-md border p-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {permissionGroups.map((group) => (
                    <div
                      key={group.prefix}
                      className="rounded-lg border bg-card p-3"
                    >
                      <div className="mb-2 flex items-center gap-2 border-b pb-2">
                        <Checkbox
                          id={`group-create-${group.prefix}`}
                          checked={
                            isGroupAllSelected(group)
                              ? true
                              : isGroupPartiallySelected(group)
                                ? "indeterminate"
                                : false
                          }
                          onCheckedChange={() => toggleGroup(group)}
                        />
                        <Label
                          htmlFor={`group-create-${group.prefix}`}
                          className="cursor-pointer text-sm font-semibold"
                        >
                          {group.prefix}
                        </Label>
                        <span className="ml-auto text-xs text-muted-foreground">
                          {group.permissions.filter((p) => selectedKeys.has(p.key)).length}/
                          {group.permissions.length}
                        </span>
                      </div>
                      <div className="space-y-1.5">
                        {group.permissions.map((permission) => (
                          <div key={permission.key} className="flex items-center gap-2">
                            <Checkbox
                              id={`create-${permission.key}`}
                              checked={selectedKeys.has(permission.key)}
                              onCheckedChange={() => togglePermission(permission.key)}
                            />
                            <Label
                              htmlFor={`create-${permission.key}`}
                              className="cursor-pointer text-xs font-normal"
                              title={permission.description}
                            >
                              {permission.name}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
            {permissionError && (
              <p className="text-sm text-destructive">{permissionError}</p>
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
