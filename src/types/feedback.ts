import type { AuditableUser } from "./common";

export type FeedbackStatus = "PENDING" | "LIVE" | "CANCELLED";

export interface Feedback {
  id: number;
  details: string;
  rating: number;
  status: FeedbackStatus;
  createdAt: string;
  updatedAt: string;
  createdBy: AuditableUser;
  updatedBy: AuditableUser;
}
