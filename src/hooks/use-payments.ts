"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { ApiResponse, PaginationParams } from "@/types";
import type { PaymentListItem, PaymentChannel } from "@/types/payment";
import type { InvoiceType } from "@/types/invoice";

interface PaymentParams extends PaginationParams {
  search?: string;
  paymentChannel?: PaymentChannel;
  invoiceType?: InvoiceType;
}

export function usePayments(params: PaymentParams = {}) {
  const {
    page = 0,
    size = 10,
    sortBy = "transactionDate",
    order = "DESC",
    search,
    paymentChannel,
    invoiceType,
  } = params;

  return useQuery({
    queryKey: ["payments", { page, size, sortBy, order, search, paymentChannel, invoiceType }],
    queryFn: () =>
      api
        .get<ApiResponse<PaymentListItem[]>>(endpoints.ADMIN_PAYMENTS, {
          page,
          size,
          sortBy,
          order,
          ...(search && { search }),
          ...(paymentChannel && { paymentChannel }),
          ...(invoiceType && { invoiceType }),
        })
        .then((res) => res.data),
  });
}
