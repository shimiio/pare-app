import { apiClient } from "./client";
import type { WriteSubscription } from "../types";

export const getSubscriptions = () => apiClient.get("/subscriptions");

export const getSubscriptionById = (id: number) =>
  apiClient.get(`/subscriptions/${id}`);

export const createSubscription = (data: WriteSubscription) =>
  apiClient.post("/subscriptions", data);

export const editSubscription = (id: number, data: WriteSubscription) =>
  apiClient.put(`/subscriptions/${id}`, data);

export const deleteSubscription = (id: number) =>
  apiClient.delete(`/subscriptions/${id}`);
