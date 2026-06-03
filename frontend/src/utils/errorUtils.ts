import axios from "axios";

export const extractErrors = (error: unknown): string[] => {
  if (axios.isAxiosError(error) && error.response?.data?.errors) {
    return Object.values(error.response.data.errors).flat() as string[];
  }
  return [];
};
