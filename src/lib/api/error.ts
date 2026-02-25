import { AxiosError } from "axios";

export interface ApiErrorResponse {
  message: string;
  data: null;
  errors?: Record<string, string[]>;
}

export function extractApiError(error: unknown): string {
  if (error instanceof AxiosError && error.response?.data) {
    const data = error.response.data as ApiErrorResponse;
    return data.message || "Something went wrong";
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Something went wrong";
}
