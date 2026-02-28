"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { ApiResponse, BlogListResponse, Blog, BlogCategory, Tag, PaginationParams, BlogStatus } from "@/types";

interface BlogParams extends PaginationParams {
  search?: string;
  categoryId?: number;
}

export function useBlogs(params: BlogParams = {}) {
  const { page = 0, size = 10, sortBy = "updatedAt", order = "DESC", search, categoryId } = params;
  return useQuery({
    queryKey: ["blogs", { page, size, sortBy, order, search, categoryId }],
    queryFn: () =>
      api.get<ApiResponse<BlogListResponse>>(endpoints.BLOGS, {
        page, size, sortBy, order,
        ...(search && { search }),
        ...(categoryId && { categoryId }),
      }).then((res) => res.data),
  });
}

export function useBlog(slug: string) {
  return useQuery({
    queryKey: ["blogs", slug],
    queryFn: () =>
      api.get<ApiResponse<Blog>>(endpoints.blogBySlug(slug)).then((res) => res.data),
    enabled: !!slug,
  });
}

export function useCreateBlog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: FormData) =>
      api.post<ApiResponse<Blog>>(endpoints.BLOGS, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["blogs"] }); },
  });
}

export function useUpdateBlog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ slug, data }: { slug: string; data: FormData }) =>
      api.put<ApiResponse<Blog>>(endpoints.blogBySlug(slug), data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["blogs"] }); },
  });
}

export function useDeleteBlog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (slug: string) => api.delete(endpoints.blogBySlug(slug)),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["blogs"] }); },
  });
}

export function useChangeBlogStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ slug, status }: { slug: string; status: BlogStatus }) =>
      api.patch(endpoints.blogStatus(slug, status)),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["blogs"] }); },
  });
}

// Blog Categories
export function useBlogCategories(params: { page?: number; size?: number; search?: string } = {}) {
  const { page = 0, size = 100, search } = params;
  return useQuery({
    queryKey: ["blog-categories", { page, size, search }],
    queryFn: () =>
      api.get<ApiResponse<BlogCategory[]>>(endpoints.BLOG_CATEGORIES, {
        page, size, ...(search && { search }),
      }).then((res) => res.data),
  });
}

export function useCreateBlogCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: FormData) =>
      api.post<ApiResponse<BlogCategory>>(endpoints.BLOG_CATEGORIES, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["blog-categories"] }); },
  });
}

export function useUpdateBlogCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: FormData }) =>
      api.put<ApiResponse<BlogCategory>>(endpoints.blogCategoryById(id), data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["blog-categories"] }); },
  });
}

export function useDeleteBlogCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(endpoints.blogCategoryById(id)),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["blog-categories"] }); },
  });
}

// Tags
export function useTags(search?: string) {
  return useQuery({
    queryKey: ["tags", { search }],
    queryFn: () =>
      api.get<ApiResponse<Tag[]>>(endpoints.TAGS, {
        page: 0, size: 100, ...(search && { search }),
      }).then((res) => res.data),
  });
}
