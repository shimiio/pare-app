import axios from "axios";

export const defaultUrl = "http://localhost:5000/api";
export const localUrl = "http://192.168.0.150:5000/api";

export const apiClient = axios.create({
  baseURL: localUrl,
});

apiClient.interceptors.request.use(
  function (config) {
    const token = localStorage.getItem("jwtToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  function (error) {
    return Promise.reject(error);
  },
);
