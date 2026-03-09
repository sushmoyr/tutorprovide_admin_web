import type { ApplicationReviewStatus } from "./premium-request";

export interface VerificationRequestListItem {
  id: number;
  tutorId: number;
  status: ApplicationReviewStatus;
  description?: string;
}
