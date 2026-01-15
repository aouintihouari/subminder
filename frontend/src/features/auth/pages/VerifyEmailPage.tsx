import { useSearchParams, useNavigate } from "react-router";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { AxiosError } from "axios";
import { useQuery } from "@tanstack/react-query";

import { authService } from "../services/auth.service";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
        icon: <XCircle className="text-destructive h-16 w-16" />,
        title: "Invalid Link",
        message: "Missing verification token.",
        status: "error",
      };

    if (isPending) {
      return {
        icon: <Loader2 className="h-16 w-16 animate-spin text-indigo-600" />,
        title: "Verifying...",
        message: "Please wait while we verify your email address.",
        status: "loading",
      };
    }

    if (isError) {
      let message = "An unexpected error occurred. Please try again.";
      if (error instanceof AxiosError && error.response?.data?.message)
        message = error.response.data.message;
      else if (error instanceof Error) message = error.message;

      return {
        icon: <XCircle className="text-destructive h-16 w-16" />,
        title: "Verification Failed",
        message: message,
        status: "error",
      };
    }

    if (isSuccess) {
      return {
        icon: <CheckCircle2 className="h-16 w-16 text-green-500" />,
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
    <div className="bg-background flex min-h-screen flex-col items-center justify-center px-4 py-6 font-sans transition-colors duration-300">
      <div className="animate-in slide-in-from-top-4 fade-in mb-6 space-y-2 text-center duration-700">
        <div className="flex justify-center">
          <div className="dark:bg-primary text-primary-foreground dark:shadow-primary/20 mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-600/20 transition-transform duration-300 hover:scale-105">
            <ShieldCheck className="h-7 w-7" />
          </div>
        </div>
        <h1 className="text-foreground my-3 text-3xl font-extrabold tracking-tight">
          Email Verification
        </h1>
      </div>

      <Card className="animate-in fade-in zoom-in-95 slide-in-from-bottom-4 border-border bg-card w-full max-w-md p-4 shadow-xl duration-500 sm:p-6">
        <CardHeader className="space-y-1 p-0 pb-6 text-center">
          <CardTitle className="text-2xl font-bold">{content.title}</CardTitle>
          <CardDescription className="text-base">
            {content.message}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col items-center gap-6 p-0">
          <div className="animate-in zoom-in duration-300">{content.icon}</div>

          <div className="w-full pt-2">
            {content.status === "success" && (
              <Button
                onClick={() => navigate("/auth")}
                className="text-primary-foreground shadow-primary/20 dark:bg-primary hover:bg-primary/90 mt-2 h-12 w-full cursor-pointer rounded-xl bg-indigo-600 text-base font-semibold shadow-lg transition-all hover:-translate-y-0.5 active:scale-[0.98]"
              >
                Go to Login <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}

            {content.status === "error" && (
              <Button
                variant="outline"
                onClick={() => navigate("/auth?tab=signup")}
                className="mt-2 h-12 w-full cursor-pointer rounded-xl text-base font-semibold"
              >
                Back to Sign Up
              </Button>
            )}

            {content.status === "loading" && (
              <div className="h-2 w-full overflow-hidden rounded-full bg-indigo-100">
                <div className="animate-indeterminate h-full w-1/2 rounded-full bg-indigo-600"></div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
