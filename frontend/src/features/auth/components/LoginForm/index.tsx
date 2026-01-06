import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { Loader2, Mail, Lock, Eye, EyeOff, LogIn } from "lucide-react";
import { AxiosError } from "axios";
import { zodResolver } from "@hookform/resolvers/zod";

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

import { loginSchema, type LoginFormValues } from "../../schemas/login.schema";
import { authService } from "../../services/auth.service";
import { useAuth } from "@/hooks/authContext";

/**
 * A React functional component that renders a login form with email and password fields.
 * The form includes validation, error handling, and loading states.
 *
 * @component
 * @example
 */
export function LoginForm() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  /**
   * Form instance with validation schema and default values
   * Uses zodResolver for form validation based on loginSchema
   */
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  /**
   * Handles form submission for user login.
   */
  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true);
    setServerError(null);

    try {
      const response = await authService.login(data);
      if (response.data?.user) {
        login(response.data.user);
        navigate("/");
      } else setServerError("Invalid response from server.");
    } catch (error) {
      let message = "Invalid email or password.";
      if (error instanceof AxiosError && error.response?.data?.message)
        message = error.response.data.message;
      else if (error instanceof Error) message = error.message;
      setServerError(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="animate-in fade-in slide-in-from-right-4 space-y-4 duration-300"
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
                    placeholder="name@example.com"
                    type="email"
                    className="border-border focus:ring-primary/20 h-12 rounded-xl bg-transparent pl-11 text-base shadow-sm transition-all duration-200 focus:ring-2"
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
              <FormLabel className="ml-1">Password</FormLabel>
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
                    placeholder="••••••••"
                    autoComplete="current-password"
                    type={showPassword ? "text" : "password"}
                    className="border-border focus:ring-primary/20 h-12 rounded-xl bg-transparent pr-10 pl-11 text-base shadow-sm transition-all duration-200 focus:ring-2"
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
              Logging in...
            </>
          ) : (
            <>
              Sign In <LogIn className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
