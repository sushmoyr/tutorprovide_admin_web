"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { ApiResponse, PaginationParams } from "@/types";
import type { InvoiceListItem, InvoiceStatus } from "@/types/invoice";

interface InvoiceParams extends PaginationParams {
  status?: InvoiceStatus;
  search?: string;
  tuitionCode?: string;
}

export function useInvoices(params: InvoiceParams = {}) {
  const {
    page = 0,
    size = 10,
    sortBy = "dueDate",
    order = "DESC",
    status,
    search,
    tuitionCode,
  } = params;

  return useQuery({
    queryKey: ["invoices", { page, size, sortBy, order, status, search, tuitionCode }],
    queryFn: () =>
      api
        .get<ApiResponse<InvoiceListItem[]>>(endpoints.ADMIN_INVOICES, {
          page,
          size,
          sortBy,
          order,
          ...(status && { status }),
          ...(search && { search }),
          ...(tuitionCode && { tuitionCode }),
        })
        .then((res) => res.data),
  });
}

export function useDeleteInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => api.delete(endpoints.invoiceById(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
}
