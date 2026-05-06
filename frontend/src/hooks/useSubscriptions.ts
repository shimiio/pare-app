import { useQuery } from "react-query";
import type { Subscription } from "../types";
import { getSubscriptions } from "../api/subscriptions";

export const useSubscriptions = () => {
  return useQuery<Subscription[], Error>({
    queryKey: ["subscriptions"],
    queryFn: async () => {
      const response = await getSubscriptions();
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
};
