export interface AuditSnapshot {
  entityType: string;
  entityId: string;
  snapshotType: string;
  state: Record<string, unknown>;
  author: string;
  authorName: string;
  commitDate: string;
  version: number;
  changedProperties: string[];
  message: string;
}

export interface AuditSnapshotParams {
  page?: number;
  size?: number;
  author?: string;
  changedProperty?: string;
  from?: string;
  to?: string;
}
