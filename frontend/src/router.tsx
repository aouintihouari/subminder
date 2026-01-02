import { createBrowserRouter, Navigate } from "react-router";

import { AuthPage } from "@/features/auth/pages/AuthPage";
import { VerifyEmailPage } from "@/features/auth/pages/VerifyEmailPage";

export const router = createBrowserRouter([
  { path: "/auth", element: <AuthPage /> },
  { path: "/verify-email", element: <VerifyEmailPage /> },
  { path: "*", element: <Navigate to="/auth" replace /> },
]);
