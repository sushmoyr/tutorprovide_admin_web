import type { AuditableUser } from "./common";

export interface Gallery {
  id: number;
  title: string;
  description: string;
  actionLink: string;
  actionText: string;
  videoUrl: string;
  images: string[];
  sortOrder: number;
  videoOnly: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: AuditableUser;
  updatedBy: AuditableUser;
}
