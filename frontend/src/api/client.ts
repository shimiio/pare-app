import axios from "axios";

export const defaultUrl = "http://localhost/api";
export const localUrl = "http://192.168.0.150:5000/api";

export const apiClient = axios.create({
  baseURL: localUrl,
});
