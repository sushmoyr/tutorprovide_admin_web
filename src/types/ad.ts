import type { AuditableUser } from "./common";

export type AdStatus = "ACTIVE" | "INACTIVE" | "DELETED";

export interface Ad {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  link: string;
  status: AdStatus;
  createdAt: string;
  updatedAt: string;
  createdBy: AuditableUser;
  updatedBy: AuditableUser;
}
