"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { ApiResponse, AuditSnapshot, AuditSnapshotParams } from "@/types";

export function useAuditSnapshots(params: AuditSnapshotParams = {}) {
  const { page = 0, size = 20, author, changedProperty, from, to } = params;

  return useQuery({
    queryKey: ["audit-snapshots", { page, size, author, changedProperty, from, to }],
    queryFn: () =>
      api
        .get<ApiResponse<AuditSnapshot[]>>(endpoints.AUDIT_SNAPSHOTS, {
          page,
          size,
          ...(author && { author }),
          ...(changedProperty && { changedProperty }),
          ...(from && { from }),
          ...(to && { to }),
        })
        .then((res) => res.data),
  });
}
