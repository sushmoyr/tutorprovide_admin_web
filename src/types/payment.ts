export type PaymentChannel = "CASH" | "SSLCOMMERZ" | "BKASH" | "BKASH_PERSONAL" | "NAGAD_PERSONAL" | "ROCKET_PERSONAL";

export interface PaymentListItem {
  transactionId?: string;
  transactionDate: string;
  paymentChannel: PaymentChannel;
  amount: number;
}
