const BASE_URL_SUBSCRIPTIONS = "/subscriptions";
const BASE_URL_USERS = "/users";

export const API_ROUTES = {
  SUBSCRIPTIONS: {
    GET_ALL: `${BASE_URL_SUBSCRIPTIONS}`,
    CREATE: `${BASE_URL_SUBSCRIPTIONS}`,
    STATS: `${BASE_URL_SUBSCRIPTIONS}/stats`,
    UPDATE: (id: number) => `${BASE_URL_SUBSCRIPTIONS}/${id}`,
    DELETE: (id: number) => `${BASE_URL_SUBSCRIPTIONS}/${id}`,
  },
  AUTH: {
    LOGIN: "/auth/login",
    SIGNUP: "/auth/signup",
    LOGOUT: "/auth/logout",
    ME: "/auth/me",
    VERIFY_EMAIL: "/auth/verify-email",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
  },
  USERS: {
    UPDATE_PROFILE: `${BASE_URL_USERS}/update-me`,
    UPDATE_PASSWORD: `${BASE_URL_USERS}/update-password`,
    DELETE_ACCOUNT: `${BASE_URL_USERS}/delete-me`,
  },
};
