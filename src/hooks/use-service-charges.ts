"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { ApiResponse, ServiceCharge } from "@/types";

export function useServiceCharges() {
  return useQuery({
    queryKey: ["service-charges"],
    queryFn: () =>
      api
        .get<ApiResponse<ServiceCharge[]>>(endpoints.SERVICE_CHARGES)
        .then((res) => res.data),
  });
}

export function useUpdateServiceCharge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { serviceType: string; charge: number }) =>
      api.put<ApiResponse<ServiceCharge>>(endpoints.SERVICE_CHARGES, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-charges"] });
    },
  });
}
