export type TutorStatus = "PENDING" | "CONFIRMED" | "BLOCKED";
export type Gender = "MALE" | "FEMALE" | "OTHER";

export interface TutorListItem {
  id: number;
  name: string;
  userImage?: string;
  phone: string;
  email?: string;
  presentAddress?: string;
  gender: Gender;
  completion: number;
  premium: boolean;
  verified: boolean;
  parentVerified: boolean;
  status: TutorStatus;
  tutoringExperience?: number;
  averageRating?: number;
  totalReviews?: number;
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
  createdAt: string;
  updatedAt: string;
}
