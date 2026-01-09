import axios from "axios";

<<<<<<< HEAD
const baseURL = import.meta.env.PROD
  ? import.meta.env.VITE_BACKEND_URL
  : "/api/v1";
=======
const baseURL = "/api/v1";
>>>>>>> 6228ca4b87c2eff6fafe9086e510d84da414bcfb

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
