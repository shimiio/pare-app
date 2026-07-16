import { apiClient } from "./client";

export const sendVerificationEmail = () =>
  apiClient.post("/emailverification/send");

export const verifyEmail = (code: string) =>
  apiClient.post("/emailverification/verify", { code });
