import { createBrowserRouter, Navigate } from "react-router";

import { ProtectedLayout } from "@/layouts/ProtectedLayout";
import { PublicLayout } from "@/layouts/PublicLayout";

import { AuthPage } from "@/features/auth/pages/AuthPage";
import { VerifyEmailPage } from "@/features/auth/pages/VerifyEmailPage";
import { DashboardPage } from "@/features/dashboard/pages/DashboardPage";
import { SettingsPage } from "@/features/auth/pages/SettingsPage";
import { ForgotPasswordPage } from "@/features/auth/pages/ForgotPasswordPage";
import { ResetPasswordPage } from "@/features/auth/pages/ResetPasswordPage";

export const router = createBrowserRouter([
  {
    element: <ProtectedLayout />,
    children: [
      {
        path: "/",
        element: <DashboardPage />,
      },
    ],
  },
  {
    element: <PublicLayout />,
    children: [
      {
        path: "/auth",
        element: <AuthPage />,
      },
      {
        path: "/verify-email",
        element: <VerifyEmailPage />,
      },
      {
        path: "/forgot-password",
        element: <ForgotPasswordPage />,
      },
      {
        path: "/reset-password/:token",
        element: <ResetPasswordPage />,
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
  {
    path: "/settings",
    element: <SettingsPage />,
  },
]);
