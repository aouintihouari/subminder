import { createBrowserRouter, Navigate } from "react-router";

import { ProtectedLayout } from "@/layouts/ProtectedLayout";
import { PublicLayout } from "@/layouts/PublicLayout";

import { AuthPage } from "@/features/auth/pages/AuthPage";
import { VerifyEmailPage } from "@/features/auth/pages/VerifyEmailPage";
import { VerifyChangeEmailPage } from "@/features/auth/pages/VerifyChangeEmailPage";
import { ForgotPasswordPage } from "@/features/auth/pages/ForgotPasswordPage";
import { ResetPasswordPage } from "@/features/auth/pages/ResetPasswordPage";
import { SettingsPage } from "@/features/auth/pages/SettingsPage";

import { DashboardPage } from "@/features/dashboard/pages/DashboardPage";
import { SubscriptionsPage } from "@/features/subscriptions/pages/SubscriptionsPage";

export const router = createBrowserRouter([
  {
    element: <ProtectedLayout />,
    children: [
      { path: "/", element: <Navigate to="/dashboard" replace /> },
      { path: "/dashboard", element: <DashboardPage /> },
      { path: "/subscriptions", element: <SubscriptionsPage /> },
      { path: "/settings", element: <SettingsPage /> },
    ],
  },
  {
    element: <PublicLayout />,
    children: [
      { path: "/auth", element: <AuthPage /> },
      { path: "/verify-email", element: <VerifyEmailPage /> },
      { path: "/verify-change-email", element: <VerifyChangeEmailPage /> },
      { path: "/forgot-password", element: <ForgotPasswordPage /> },
      { path: "/reset-password/:token", element: <ResetPasswordPage /> },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);
