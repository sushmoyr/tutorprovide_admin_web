import type { Gender } from "./tutor-list";

export type EmployeeType = "PERMANENT" | "PROBATION" | "INTERN" | "CONTRACTUAL";
export type MaritalStatus = "SINGLE" | "MARRIED" | "DIVORCED" | "WIDOWED" | "SEPARATED";

export interface EmployeeListItem {
  id: number;
  name: string;
  userImage?: string;
  phone: string;
  email?: string;
  presentAddress?: string;
  gender: Gender;
  alternatePhone?: string;
  permanentAddress?: string;
  maritalStatus?: MaritalStatus;
  joiningDate?: string;
  employeeType?: EmployeeType;
  department?: {
    id: number;
    name: string;
  };
  designation?: {
    id: number;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}
