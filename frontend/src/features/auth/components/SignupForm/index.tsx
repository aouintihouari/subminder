import { useState } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import {
  Loader2,
  Mail,
  Lock,
  User as UserIcon,
  CheckCircle2,
  ArrowRight,
  Eye,
  EyeOff,
} from "lucide-react";

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
import { Card, CardContent } from "@/components/ui/card";

import {
  signupSchema,
  type SignupFormValues,
} from "../../schemas/signup.schema";
import { authService } from "../../services/auth.service";

export function SignupForm() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      passwordConfirm: "",
    },
  });

  async function onSubmit(data: SignupFormValues) {
    setIsLoading(true);
    setServerError(null);

    try {
      await authService.signup(data);
      setSuccess(true);
    } catch (error) {
      let message = "Something went wrong. Please try again.";
      if (error instanceof AxiosError && error.response?.data?.message)
        message = error.response.data.message;
      else if (error instanceof Error) message = error.message;

      setServerError(message);
    } finally {
      setIsLoading(false);
    }
  }

  if (success) {
    return (
      <Card className="animate-in fade-in zoom-in-95 bg-card dark:border-t-primary w-full border-x-0 border-t-4 border-b-0 border-t-indigo-600 shadow-none duration-500">
        <CardContent className="flex flex-col items-center space-y-4 pt-8 pb-8 text-center">
          <div className="animate-in zoom-in flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 shadow-sm duration-300 dark:bg-emerald-900/30">
            <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-500" />
          </div>
          <h2 className="text-foreground text-2xl font-bold">
            Please verify your email
          </h2>
          <Button
            className="dark:bg-primary mt-6 h-11 w-full bg-indigo-600 text-white shadow-md transition-all hover:scale-[1.02] hover:bg-indigo-700 dark:hover:bg-indigo-600"
            onClick={() => navigate("/auth?tab=login")}
          >
            Go to Login <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="animate-in fade-in slide-in-from-right-4 space-y-4 duration-300"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field, fieldState }) => (
            <FormItem className="space-y-1.5">
              <FormLabel
                className={`ml-1 text-sm font-medium ${fieldState.error ? "text-destructive" : "text-foreground"}`}
              >
                Full Name
              </FormLabel>
              <FormControl>
                <div className="group relative transition-all duration-200 focus-within:scale-[1.01]">
                  <UserIcon
                    className={`absolute top-3.5 left-4 h-5 w-5 transition-colors duration-200 ${fieldState.error ? "text-destructive" : "text-muted-foreground group-focus-within:text-primary"}`}
                  />
                  <Input
                    placeholder="John Doe"
                    className={`bg-muted/30 focus:bg-background h-12 rounded-xl border pl-11 text-base shadow-sm transition-all duration-200 ${
                      fieldState.error
                        ? "border-destructive focus:ring-destructive/20"
                        : "border-border hover:border-accent-foreground/30 focus:border-primary focus:ring-primary/20"
                    }`}
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage className="ml-1 text-xs" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field, fieldState }) => (
            <FormItem className="space-y-1.5">
              <FormLabel
                className={`ml-1 text-sm font-medium ${fieldState.error ? "text-destructive" : "text-foreground"}`}
              >
                Email
              </FormLabel>
              <FormControl>
                <div className="group relative transition-all duration-200 focus-within:scale-[1.01]">
                  <Mail
                    className={`absolute top-3.5 left-4 h-5 w-5 transition-colors duration-200 ${fieldState.error ? "text-destructive" : "text-muted-foreground group-focus-within:text-primary"}`}
                  />
                  <Input
                    placeholder="name@example.com"
                    type="email"
                    className={`bg-muted/30 focus:bg-background h-12 rounded-xl border pl-11 text-base shadow-sm transition-all duration-200 ${
                      fieldState.error
                        ? "border-destructive focus:ring-destructive/20"
                        : "border-border hover:border-accent-foreground/30 focus:border-primary focus:ring-primary/20"
                    }`}
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage className="ml-1 text-xs" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field, fieldState }) => (
            <FormItem className="space-y-1.5">
              <FormLabel
                className={`ml-1 text-sm font-medium ${fieldState.error ? "text-destructive" : "text-foreground"}`}
              >
                Password
              </FormLabel>
              <FormControl>
                <div className="group relative transition-all duration-200 focus-within:scale-[1.01]">
                  <Lock
                    className={`absolute top-3.5 left-4 h-5 w-5 transition-colors duration-200 ${fieldState.error ? "text-destructive" : "text-muted-foreground group-focus-within:text-primary"}`}
                  />
                  <Input
                    placeholder="••••••••"
                    autoComplete="new-password"
                    type={showPassword ? "text" : "password"}
                    className={`bg-muted/30 focus:bg-background h-12 rounded-xl border pr-10 pl-11 text-base shadow-sm transition-all duration-200 ${
                      fieldState.error
                        ? "border-destructive focus:ring-destructive/20"
                        : "border-border hover:border-accent-foreground/30 focus:border-primary focus:ring-primary/20"
                    }`}
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
              <FormLabel
                className={`ml-1 text-sm font-medium ${fieldState.error ? "text-destructive" : "text-foreground"}`}
              >
                Confirm Password
              </FormLabel>
              <FormControl>
                <div className="group relative transition-all duration-200 focus-within:scale-[1.01]">
                  <Lock
                    className={`absolute top-3.5 left-4 h-5 w-5 transition-colors duration-200 ${fieldState.error ? "text-destructive" : "text-muted-foreground group-focus-within:text-primary"}`}
                  />
                  <Input
                    placeholder="••••••••"
                    autoComplete="new-password"
                    type={showConfirmPassword ? "text" : "password"}
                    className={`bg-muted/30 focus:bg-background h-12 rounded-xl border pr-10 pl-11 text-base shadow-sm transition-all duration-200 ${
                      fieldState.error
                        ? "border-destructive focus:ring-destructive/20"
                        : "border-border hover:border-accent-foreground/30 focus:border-primary focus:ring-primary/20"
                    }`}
                    {...field}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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

        {serverError && (
          <div className="animate-in fade-in slide-in-from-top-2 border-destructive/20 bg-destructive/10 text-destructive mb-2 rounded-xl border p-3 text-center text-sm font-medium">
            {serverError}
          </div>
        )}

        <Button
          className="text-primary-foreground shadow-primary/20 dark:bg-primary hover:bg-primary/90 mt-6 h-12 w-full cursor-pointer rounded-xl bg-indigo-600 text-base font-semibold shadow-lg transition-all hover:-translate-y-0.5 active:scale-[0.98]"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-3 h-5 w-5 animate-spin" />
              Creating account...
            </>
          ) : (
            "Create Account"
          )}
        </Button>
      </form>
    </Form>
  );
}
