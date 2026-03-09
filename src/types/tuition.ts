export type TuitionStatus = "PENDING" | "LIVE" | "CONFIRMED" | "CANCELLED";

export type TuitionStatusFilter =
  | "PENDING_TUITION"
  | "PROCESSING_TUITION"
  | "SHORTLISTED_TUTOR"
  | "APPOINTED_TUTOR"
  | "CONFIRMED_TUITION"
  | "CANCELLED_TUITION";

export type TuitionUrgency = "URGENT" | "REGULAR";

export interface TuitionLocation {
  id: number;
  name: string;
  area?: {
    id: number;
    name: string;
    district?: {
      id: number;
      name: string;
      division?: {
        id: number;
        name: string;
      };
    };
  };
}

export interface TuitionSummary {
  id: number;
  tuitionCode: string;
  appliedTutors: number;
  suggestedTutors: number;
  assignedEmployees: number;
  guardianPhone: string;
  guardianId: number;
  livingLocation?: TuitionLocation;
  createdAt: string;
  updatedAt: string;
  urgency: TuitionUrgency;
  status: TuitionStatus;
}
