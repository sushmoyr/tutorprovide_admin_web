import type { AuditableUser } from "./common";

export type AnnouncementStatus = "DRAFT" | "PUBLISHED";
export type RecipientGroup = "TUTOR" | "GUARDIAN" | "EMPLOYEE" | "GUEST";
export type AnnouncementChannel = "EMAIL" | "SMS" | "PUSH_NOTIFICATION" | "DEFAULT";

export interface Announcement {
  id: number;
  title: string;
  details: string;
  recipientGroup: RecipientGroup[];
  imageUrl: string;
  status: AnnouncementStatus;
  channels: AnnouncementChannel[];
  createdAt: string;
  updatedAt: string;
  createdBy: AuditableUser;
  updatedBy: AuditableUser;
}
