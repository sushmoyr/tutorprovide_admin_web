"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { Pencil, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EditTeamDialog } from "@/components/teams/edit-team-dialog";
import { useTeams, useDeleteTeam } from "@/hooks/use-teams";
import { extractApiError } from "@/lib/api/error";
import type { TeamMember } from "@/types";

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  );
}

export function TeamsList() {
  const t = useTranslations("teams");
  const tc = useTranslations("common");

  const { data, isLoading, error } = useTeams();
  const deleteMutation = useDeleteTeam();
  const [memberToDelete, setMemberToDelete] = useState<TeamMember | null>(null);
  const [memberToEdit, setMemberToEdit] = useState<TeamMember | null>(null);

  const handleDelete = async () => {
    if (!memberToDelete) return;

    try {
      await deleteMutation.mutateAsync(memberToDelete.id);
      toast.success(t("deleteSuccess"));
    } catch (err) {
      toast.error(extractApiError(err));
    } finally {
      setMemberToDelete(null);
    }
  };

  if (isLoading) return <TableSkeleton />;

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
        {extractApiError(error)}
      </div>
    );
  }

  const members = data?.data ?? [];

  if (members.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
        <p className="text-muted-foreground">{tc("noResults")}</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border bg-card text-card-foreground">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted hover:bg-muted text-muted-foreground">
              <TableHead className="w-16">{t("image")}</TableHead>
              <TableHead>{t("name")}</TableHead>
              <TableHead>{t("designation")}</TableHead>
              <TableHead>{t("email")}</TableHead>
              <TableHead>{t("status")}</TableHead>
              <TableHead className="hidden sm:table-cell">
                {t("createdAt")}
              </TableHead>
              <TableHead className="w-24 text-right">{t("actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.id} className="hover:bg-muted/50">
                <TableCell>
                  <img
                    src={member.image}
                    alt={member.name}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                </TableCell>
                <TableCell className="font-medium">{member.name}</TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {member.designation}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {member.email}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={member.status === 1 ? "default" : "secondary"}
                  >
                    {member.status === 0
                      ? t("statusExecutive")
                      : t("statusManagement")}
                  </Badge>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(member.createdAt), "dd MMM yyyy")}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setMemberToEdit(member)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => setMemberToDelete(member)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog
        open={!!memberToDelete}
        onOpenChange={(open) => !open && setMemberToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteConfirmDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tc("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {tc("delete")}
                </>
              ) : (
                tc("delete")
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <EditTeamDialog
        member={memberToEdit}
        open={!!memberToEdit}
        onOpenChange={(open) => !open && setMemberToEdit(null)}
      />
    </>
  );
}
