export type ApplicationStatus = "APPLIED" | "SHORTLISTED" | "APPOINTED" | "CANCELLED" | "CONFIRMED";

export type ApplicationUpdateType =
  | "CONFIRM_TUITION"
  | "APPOINTED_TUITION"
  | "DEMO_CLASS"
  | "DUE_PAYMENT"
  | "REPOSTED_TUITION";

export interface TuitionApplicationListItem {
  id: number;
  tuitionCode: string;
  tutorName: string;
  tutorPhone: string;
  tuitionAddress?: string;
  status: ApplicationStatus;
  assignedEmployeeCount: number;
}

export interface ApplicationStats {
  confirmedApplications: number;
  appointedApplications: number;
  pendingApplications: number;
  demoClassCount: number;
}
