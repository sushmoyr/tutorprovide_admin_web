import type { District } from "./district";

export interface Area {
  id: number;
  name: string;
  image?: string;
  district: District;
}
