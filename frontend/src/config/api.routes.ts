const BASE_URL = "/subscriptions";

export const API_ROUTES = {
  SUBSCRIPTIONS: {
    GET_ALL: `${BASE_URL}`,
    CREATE: `${BASE_URL}`,
    STATS: `${BASE_URL}/stats`,
    UPDATE: (id: number) => `${BASE_URL}/${id}`,
    DELETE: (id: number) => `${BASE_URL}/${id}`,
  },
  AUTH: {
    LOGIN: "/auth/login",
    SIGNUP: "/auth/signup",
    LOGOUT: "/auth/logout",
    ME: "/auth/me",
    VERIFY_EMAIL: "/auth/verify-email",
  },
};
