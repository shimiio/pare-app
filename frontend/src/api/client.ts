import axios from "axios";
import { useAuthStore } from "../store/useAuthStore";

export const defaultUrl = "http://localhost:5000/api";
export const localUrl = "http://192.168.0.150:5000/api";

export const apiClient = axios.create({
  baseURL: localUrl,
});

apiClient.interceptors.request.use(
  function (config) {
    const { token } = useAuthStore.getState();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  function (error) {
    return Promise.reject(error);
  },
);
