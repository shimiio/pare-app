import { apiClient } from "./client";

export const getUser = () => apiClient.get("/user");

export const updateUserName = (name: string) =>
  apiClient.patch("/user/update-name", { name });

export const changeUserEmail = (email: string) =>
  apiClient.patch("/user/change-email", { email });

export const changeUserPassword = (
  currentPassword: string,
  newPassword: string,
) =>
  apiClient.patch("/user/change-password", {
    currentPassword,
    newPassword,
  });

export const updateUserCurrency = (currency: string) =>
  apiClient.patch("/user/update-currency", { currency });

export const deleteUser = () => apiClient.delete("/user");
