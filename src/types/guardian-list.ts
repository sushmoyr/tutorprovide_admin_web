import type { Gender } from "./tutor-list";

export interface GuardianListItem {
  id: number;
  name: string;
  userImage?: string;
  phone: string;
  email?: string;
  presentAddress?: string;
  gender: Gender;
  completion: number;
  createdAt: string;
  updatedAt: string;
}
