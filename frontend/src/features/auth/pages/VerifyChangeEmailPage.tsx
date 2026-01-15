import { useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { useMutation } from "@tanstack/react-query";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowRight,
  MailCheck,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { authService } from "../services/auth.service";

export function VerifyChangeEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const hasCalled = useRef(false);

  const verifyMutation = useMutation({
    mutationFn: (token: string) => authService.verifyEmailChange(token),
    onSuccess: () => {
      toast.success("Email updated successfully!");
    },
    onError: () => {
      toast.error(
        "Failed to verify email change. The link may be invalid or expired.",
      );
    },
  });

  useEffect(() => {
    if (!token) {
      toast.error("Invalid verification link.");
      navigate("/");
      return;
    }

    if (!hasCalled.current) {
      hasCalled.current = true;
      verifyMutation.mutate(token);
    }
  }, [token, navigate, verifyMutation]);

  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center px-4 py-6 font-sans transition-colors duration-300">
      <div className="animate-in slide-in-from-top-4 fade-in mb-6 space-y-2 text-center duration-700">
        <div className="flex justify-center">
          <div className="dark:bg-primary text-primary-foreground dark:shadow-primary/20 mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-600/20 transition-transform duration-300 hover:scale-105">
            <MailCheck className="h-7 w-7" />
          </div>
        </div>
        <h1 className="text-foreground my-3 text-3xl font-extrabold tracking-tight">
          Update Email
        </h1>
      </div>

      <Card className="animate-in fade-in zoom-in-95 slide-in-from-bottom-4 border-border bg-card w-full max-w-md p-4 shadow-xl duration-500 sm:p-6">
        <CardHeader className="space-y-1 p-0 pb-6 text-center">
          <CardTitle className="text-2xl font-bold">
            {verifyMutation.isPending && "Verifying..."}
            {verifyMutation.isSuccess && "Email Updated!"}
            {verifyMutation.isError && "Verification Failed"}
          </CardTitle>
          <CardDescription className="text-base">
            {verifyMutation.isPending && "We are updating your email address."}
            {verifyMutation.isSuccess &&
              "Your email address has been successfully changed."}
            {verifyMutation.isError &&
              "The verification link is invalid or has expired."}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col items-center gap-6 p-0">
          {verifyMutation.isPending && (
            <div className="animate-in zoom-in duration-300">
              <Loader2 className="h-16 w-16 animate-spin text-indigo-600" />
            </div>
          )}

          {verifyMutation.isSuccess && (
            <div className="animate-in zoom-in duration-300">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            </div>
          )}

          {verifyMutation.isError && (
            <div className="animate-in zoom-in duration-300">
              <XCircle className="text-destructive h-16 w-16" />
            </div>
          )}

          <div className="w-full pt-2">
            {verifyMutation.isSuccess && (
              <Button
                onClick={() => navigate("/")}
                className="text-primary-foreground shadow-primary/20 dark:bg-primary hover:bg-primary/90 mt-2 h-12 w-full cursor-pointer rounded-xl bg-indigo-600 text-base font-semibold shadow-lg transition-all hover:-translate-y-0.5 active:scale-[0.98]"
              >
                Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}

            {verifyMutation.isError && (
              <Button
                variant="outline"
                onClick={() => navigate("/")}
                className="mt-2 h-12 w-full cursor-pointer rounded-xl text-base font-semibold"
              >
                Back to Dashboard
              </Button>
            )}

            {verifyMutation.isPending && (
              <div className="h-2 w-full overflow-hidden rounded-full bg-indigo-100">
                <div className="animate-indeterminate h-full w-1/2 rounded-full bg-indigo-600"></div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
