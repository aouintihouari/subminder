import axios from "axios";

const baseURL = import.meta.env.PROD
  ? "/api/v1"
  : "http://localhost:5000/api/v1";

export const axiosInstance = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (!window.location.pathname.includes("/auth"))
        window.location.href = "/auth?tab=login";
    }
    return Promise.reject(error);
  },
);

export const apiClient = axiosInstance;
