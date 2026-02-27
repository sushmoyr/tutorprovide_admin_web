import type { AuditableUser } from "./common";

export type WelcomeGreetingType = "ADMIN" | "USER";

export interface WelcomeGreeting {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  link: string;
  type: WelcomeGreetingType;
  createdAt: string;
  updatedAt: string;
  createdBy: AuditableUser;
  updatedBy: AuditableUser;
}
