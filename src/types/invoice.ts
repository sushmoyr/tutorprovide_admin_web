export type InvoiceStatus = "PENDING" | "PARTIALLY_PAID" | "PAID" | "DUE" | "OVERDUE";
export type InvoiceType = "SERVICE_CHARGE" | "VERIFICATION_CHARGE" | "REFUND";

export interface InvoiceUser {
  id: number;
  name: string;
  userImage?: string;
  phone?: string;
  email?: string;
  userType?: string;
}

export interface InvoiceListItem {
  id: number;
  invoiceType: InvoiceType;
  referenceNo?: string;
  user?: InvoiceUser;
  status: InvoiceStatus;
  payable: number;
  totalDue: number;
  dueDate: string;
  tuitionCode?: string;
}
