import { useQuery } from "react-query";
import type { User } from "../types";
import { getUser } from "../api/user";

export const useUser = () => {
  return useQuery<User, Error>({
    queryKey: ["user"],
    queryFn: async () => {
      const response = await getUser();
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
};
