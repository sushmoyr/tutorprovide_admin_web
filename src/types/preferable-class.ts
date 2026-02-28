import type { Category } from "./category";

export interface PreferableClass {
  id: number;
  name: string;
  numericValue: number;
  preferableCategory: Category;
}
