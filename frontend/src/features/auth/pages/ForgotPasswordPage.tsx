import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Mail, ArrowLeft, KeyRound } from "lucide-react";
import { Link } from "react-router";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from "../schemas/forgotPassword.schema";
import { authService } from "../services/auth.service";

export function ForgotPasswordPage() {
  const [isSuccess, setIsSuccess] = useState(false);

  const forgotMutation = useMutation({
    mutationFn: (data: ForgotPasswordFormValues) =>
      authService.forgotPassword(data),
    onSuccess: () => setIsSuccess(true),
  });

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  function onSubmit(data: ForgotPasswordFormValues) {
    forgotMutation.mutate(data);
  }

  const getErrorMessage = () => {
    if (!forgotMutation.error) return null;
    if (forgotMutation.error instanceof AxiosError) {
      return (
        forgotMutation.error.response?.data?.message || "An error occurred."
      );
    }
    return "An unexpected error occurred.";
  };

  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center px-4 py-6 font-sans transition-colors duration-300">
      <div className="animate-in slide-in-from-top-4 fade-in mb-6 space-y-2 text-center duration-700">
        <div className="flex justify-center">
          <div className="dark:bg-primary text-primary-foreground dark:shadow-primary/20 mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-600/20 transition-transform duration-300 hover:scale-105">
            <KeyRound className="h-7 w-7" />
          </div>
        </div>
        <h1 className="text-foreground my-3 text-3xl font-extrabold tracking-tight">
          Recover Account
        </h1>
      </div>

      <Card className="animate-in fade-in zoom-in-95 slide-in-from-bottom-4 border-border bg-card w-full max-w-md p-4 shadow-xl duration-500 sm:p-6">
        <CardHeader className="space-y-1 p-0 pb-6 text-center">
          <CardTitle className="text-2xl font-bold">Forgot Password?</CardTitle>
          <CardDescription className="text-base">
            Enter your email to receive a reset link.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0">
          {isSuccess ? (
            <Alert className="border-green-500/50 bg-green-500/10 text-green-600 dark:text-green-400">
              <AlertTitle>Email sent!</AlertTitle>
              <AlertDescription>
                If an account exists with this email, you will receive a reset
                link shortly.
              </AlertDescription>
            </Alert>
          ) : (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-5"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field, fieldState }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="ml-1">Email</FormLabel>
                      <FormControl>
                        <div className="group relative transition-all duration-200 focus-within:scale-[1.01]">
                          <Mail
                            className={`absolute top-3.5 left-4 h-5 w-5 transition-colors duration-200 ${
                              fieldState.error
                                ? "text-destructive"
                                : "text-muted-foreground group-focus-within:text-primary"
                            }`}
                          />
                          <Input
                            className="border-border focus:ring-primary/20 h-12 rounded-xl bg-transparent pl-11 text-base shadow-sm transition-all duration-200 focus:ring-2"
                            placeholder="name@example.com"
                            type="email"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="ml-1 text-xs" />
                    </FormItem>
                  )}
                />

                {forgotMutation.isError && (
                  <div className="animate-in fade-in slide-in-from-top-2 border-destructive/20 bg-destructive/10 text-destructive mb-2 rounded-xl border p-3 text-center text-sm font-medium">
                    {getErrorMessage()}
                  </div>
                )}

                <Button
                  className="text-primary-foreground shadow-primary/20 dark:bg-primary hover:bg-primary/90 mt-2 h-12 w-full cursor-pointer rounded-xl bg-indigo-600 text-base font-semibold shadow-lg transition-all hover:-translate-y-0.5 active:scale-[0.98]"
                  type="submit"
                  disabled={forgotMutation.isPending}
                >
                  {forgotMutation.isPending && (
                    <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                  )}
                  Send Reset Link
                </Button>
              </form>
            </Form>
          )}

          <div className="mt-6 text-center text-sm">
            <Link
              to="/auth?tab=login"
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
