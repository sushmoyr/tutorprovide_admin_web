import type { AuditableUser } from "./common";

export type BlogStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export interface Tag {
  name: string;
  slug: string;
}

export interface BlogCategorySummary {
  id: number;
  name: string;
}

export interface BlogCategory {
  id: number;
  name: string;
  icon: string;
  createdAt: string;
  updatedAt: string;
  createdBy: AuditableUser;
  updatedBy: AuditableUser;
}

export interface BlogCategoryCount {
  id: number;
  name: string;
  count: number;
}

export interface BlogListItem {
  id: number;
  title: string;
  coverImage: string;
  slug: string;
  tags: Tag[];
  category: BlogCategorySummary;
  status: BlogStatus;
  createdAt: string;
  updatedAt: string;
  createdBy: AuditableUser;
  updatedBy: AuditableUser;
}

export interface Blog {
  id: number;
  title: string;
  content: string;
  status: BlogStatus;
  coverImage: string;
  slug: string;
  tags: Tag[];
  category: BlogCategorySummary;
  createdAt: string;
  updatedAt: string;
  createdBy: AuditableUser;
  updatedBy: AuditableUser;
}

export interface BlogListResponse {
  blogs: BlogListItem[];
  blogCategoryCounts: BlogCategoryCount[];
}
