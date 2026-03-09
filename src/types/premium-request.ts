export type ApplicationReviewStatus = "PENDING" | "IN_REVIEW" | "PENDING_PAYMENT" | "APPROVED" | "REJECTED";

export interface PremiumRequestListItem {
  id: number;
  tutor: {
    id: number;
    name: string;
    userImage?: string;
    phone: string;
  };
  reviewedBy?: {
    id: number;
    name: string;
    userImage?: string;
  };
  description?: string;
  createdAt: string;
  updatedAt: string;
}
