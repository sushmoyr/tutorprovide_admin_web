export type CouponStatus = "ACTIVE" | "EXPIRED";

export interface Coupon {
  id: number;
  name: string;
  discountAmount: number;
  maxUsePerUser: number;
  maxUser: number;
  expiryDate: string;
  usedCount: number;
  status: CouponStatus;
  createdAt: string;
  updatedAt: string;
}
