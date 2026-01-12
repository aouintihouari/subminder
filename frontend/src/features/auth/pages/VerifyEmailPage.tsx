import { useSearchParams, useNavigate } from "react-router";
import { CheckCircle2, XCircle, Loader2, ArrowRight } from "lucide-react";
import { AxiosError } from "axios";
import { useQuery } from "@tanstack/react-query";

import { authService } from "../services/auth.service";

export const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const { isPending, isError, error, isSuccess } = useQuery({
    queryKey: ["verify-email", token],
    queryFn: async () => {
      if (!token) throw new Error("Missing verification token.");
      return authService.verifyEmail(token);
    },
    enabled: !!token,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const renderContent = () => {
    if (!token)
      return {
        icon: <XCircle className="mx-auto h-12 w-12 text-red-600" />,
        title: "Invalid Link",
        message: "Missing verification token.",
        status: "error",
      };

    if (isPending) {
      return {
        icon: (
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-600" />
        ),
        title: "Verifying...",
        message: "Verifying your email...",
        status: "loading",
      };
    }

    if (isError) {
      let message = "An unexpected error occurred. Please try again.";
      if (error instanceof AxiosError && error.response?.data?.message)
        message = error.response.data.message;
      else if (error instanceof Error) message = error.message;

      return {
        icon: <XCircle className="mx-auto h-12 w-12 text-red-600" />,
        title: "Verification Failed",
        message: message,
        status: "error",
      };
    }

    if (isSuccess) {
      return {
        icon: <CheckCircle2 className="mx-auto h-12 w-12 text-green-600" />,
        title: "You're all set!",
        message:
          "Email verified successfully! You can now access your account.",
        status: "success",
      };
    }

    return null;
  };

  const content = renderContent();

  if (!content) return null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg">
        <div className="p-8 text-center">
          <div className="mb-6 flex justify-center">{content.icon}</div>

          <h1 className="mb-2 text-2xl font-bold text-gray-900">
            {content.title}
          </h1>

          <p className="mb-8 leading-relaxed text-gray-600">
            {content.message}
          </p>

          <div className="space-y-3">
            {content.status === "success" && (
              <button
                onClick={() => navigate("/auth")}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-black px-4 py-3 font-medium text-white transition-colors hover:bg-gray-800"
              >
                Go to Login <ArrowRight className="h-4 w-4" />
              </button>
            )}

            {content.status === "error" && (
              <button
                onClick={() => navigate("/auth")}
                className="cursor-pointer text-sm text-gray-500 underline transition-colors hover:text-gray-900"
              >
                Back to Sign Up
              </button>
            )}
          </div>
        </div>

        {content.status === "loading" && (
          <div className="h-1 w-full bg-blue-100">
            <div className="animate-progress h-1 w-1/3 bg-blue-600"></div>
          </div>
        )}
      </div>
    </div>
  );
};
