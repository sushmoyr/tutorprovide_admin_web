export type UserType = "TUTOR" | "GUARDIAN" | "EMPLOYEE" | "ADMIN";
export type UserStatus = "PENDING" | "CONFIRMED" | "BLOCKED";

export interface User {
  id: number;
  name: string;
  phone: string;
  email?: string;
  gender: string;
  userType: UserType;
  status: UserStatus;
  verified: string;
  premium: string;
  permissions?: string[];
  userImage?: string;
}
