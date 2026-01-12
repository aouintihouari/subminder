import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Loader2,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowLeft,
} from "lucide-react";
import { useNavigate, useParams, Link } from "react-router";
import { AxiosError } from "axios";
import { useMutation } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from "../schemas/resetPassword.schema";
import { authService } from "../services/auth.service";

export function ResetPasswordPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const resetMutation = useMutation({
    mutationFn: (data: ResetPasswordFormValues) => {
      if (!token) throw new Error("Missing token");
      return authService.resetPassword(token, data);
    },
    onSuccess: () => {
      navigate("/auth", {
        state: { message: "Password reset successfully. Please log in." },
      });
    },
  });

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", passwordConfirm: "" },
  });

  function onSubmit(data: ResetPasswordFormValues) {
    if (!token) return;
    resetMutation.mutate(data);
  }

  const getErrorMessage = () => {
    if (!resetMutation.error) return null;
    if (resetMutation.error instanceof AxiosError) {
      return (
        resetMutation.error.response?.data?.message ||
        "The link is invalid or has expired."
      );
    }
    return "An error occurred.";
  };

  if (!token) {
    return (
      <div className="bg-background flex min-h-screen flex-col items-center justify-center px-4 py-6 font-sans">
        <Card className="border-destructive/20 bg-destructive/5 w-full max-w-md p-6 text-center shadow-xl">
          <div className="text-destructive mb-4 text-lg font-semibold">
            Invalid or missing token.
          </div>
          <Button variant="outline" onClick={() => navigate("/auth")}>
            Return to Login
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center px-4 py-6 font-sans transition-colors duration-300">
      {/* Header Logo & Title (inchangé) */}
      <div className="animate-in slide-in-from-top-4 fade-in mb-6 space-y-2 text-center duration-700">
        <div className="flex justify-center">
          <div className="dark:bg-primary text-primary-foreground dark:shadow-primary/20 mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-600/20 transition-transform duration-300 hover:scale-105">
            <ShieldCheck className="h-7 w-7" />
          </div>
        </div>
        <h1 className="text-foreground my-3 text-3xl font-extrabold tracking-tight">
          Secure Account
        </h1>
      </div>

      <Card className="animate-in fade-in zoom-in-95 slide-in-from-bottom-4 border-border bg-card w-full max-w-md p-4 shadow-xl duration-500 sm:p-6">
        <CardHeader className="space-y-1 p-0 pb-6 text-center">
          <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
          <CardDescription className="text-base">
            Please enter your new password below.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="password"
                render={({ field, fieldState }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="ml-1">New Password</FormLabel>
                    <FormControl>
                      <div className="group relative transition-all duration-200 focus-within:scale-[1.01]">
                        <Lock
                          className={`absolute top-3.5 left-4 h-5 w-5 transition-colors duration-200 ${
                            fieldState.error
                              ? "text-destructive"
                              : "text-muted-foreground group-focus-within:text-primary"
                          }`}
                        />
                        <Input
                          type={showPassword ? "text" : "password"}
                          className="border-border focus:ring-primary/20 h-12 rounded-xl bg-transparent pr-10 pl-11 text-base shadow-sm transition-all duration-200 focus:ring-2"
                          placeholder="••••••••"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-muted-foreground hover:text-primary absolute top-3.5 right-4 transition-colors focus:outline-none"
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage className="ml-1 text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="passwordConfirm"
                render={({ field, fieldState }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="ml-1">Confirm Password</FormLabel>
                    <FormControl>
                      <div className="group relative transition-all duration-200 focus-within:scale-[1.01]">
                        <Lock
                          className={`absolute top-3.5 left-4 h-5 w-5 transition-colors duration-200 ${
                            fieldState.error
                              ? "text-destructive"
                              : "text-muted-foreground group-focus-within:text-primary"
                          }`}
                        />
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          className="border-border focus:ring-primary/20 h-12 rounded-xl bg-transparent pr-10 pl-11 text-base shadow-sm transition-all duration-200 focus:ring-2"
                          placeholder="••••••••"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="text-muted-foreground hover:text-primary absolute top-3.5 right-4 transition-colors focus:outline-none"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage className="ml-1 text-xs" />
                  </FormItem>
                )}
              />

              {resetMutation.isError && (
                <div className="animate-in fade-in slide-in-from-top-2 border-destructive/20 bg-destructive/10 text-destructive mb-2 rounded-xl border p-3 text-center text-sm font-medium">
                  {getErrorMessage()}
                </div>
              )}

              <Button
                className="text-primary-foreground shadow-primary/20 dark:bg-primary hover:bg-primary/90 mt-2 h-12 w-full cursor-pointer rounded-xl bg-indigo-600 text-base font-semibold shadow-lg transition-all hover:-translate-y-0.5 active:scale-[0.98]"
                type="submit"
                disabled={resetMutation.isPending}
              >
                {resetMutation.isPending && (
                  <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                )}
                Reset Password
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center text-sm">
            <Link
              to="/auth"
              className="text-muted-foreground hover:text-primary flex items-center justify-center font-medium transition-colors hover:underline"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
