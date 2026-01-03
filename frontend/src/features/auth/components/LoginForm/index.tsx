import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router";
import { Loader2, Mail, Lock, Eye, EyeOff, LogIn } from "lucide-react";
import { AxiosError } from "axios";

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

export function LoginForm() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true);
    setServerError(null);

    try {
      const response = await authService.login(data);
      if (response.token && response.data?.user) {
        login(response.token, response.data.user);
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
              <FormLabel
                className={`ml-1 text-sm font-medium ${fieldState.error ? "text-red-600" : "text-gray-700"}`}
              >
                Email
              </FormLabel>
              <FormControl>
                <div className="group relative transition-all duration-200 focus-within:scale-[1.01]">
                  <Mail
                    className={`absolute top-3.5 left-4 h-5 w-5 transition-colors duration-200 ${
                      fieldState.error
                        ? "text-red-500"
                        : "text-gray-400 group-focus-within:text-indigo-600"
                    }`}
                  />
                  <Input
                    placeholder="name@example.com"
                    type="email"
                    className={`h-12 rounded-xl border bg-gray-50/50 pl-11 text-base shadow-sm transition-all duration-200 focus:bg-white focus:ring-2 ${
                      fieldState.error
                        ? "border-red-500 placeholder:text-red-300 focus:border-red-500 focus:ring-red-100"
                        : "border-gray-200 hover:border-gray-300 focus:border-indigo-500 focus:ring-indigo-100"
                    }`}
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage className="ml-1 text-xs text-red-600" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field, fieldState }) => (
            <FormItem className="space-y-1.5">
              <FormLabel
                className={`ml-1 text-sm font-medium ${fieldState.error ? "text-red-600" : "text-gray-700"}`}
              >
                Password
              </FormLabel>
              <FormControl>
                <div className="group relative transition-all duration-200 focus-within:scale-[1.01]">
                  <Lock
                    className={`absolute top-3.5 left-4 h-5 w-5 transition-colors duration-200 ${
                      fieldState.error
                        ? "text-red-500"
                        : "text-gray-400 group-focus-within:text-indigo-600"
                    }`}
                  />
                  <Input
                    placeholder="••••••••"
                    type={showPassword ? "text" : "password"}
                    className={`h-12 rounded-xl border bg-gray-50/50 pr-10 pl-11 text-base shadow-sm transition-all duration-200 focus:bg-white focus:ring-2 ${
                      fieldState.error
                        ? "border-red-500 placeholder:text-red-300 focus:border-red-500 focus:ring-red-100"
                        : "border-gray-200 hover:border-gray-300 focus:border-indigo-500 focus:ring-indigo-100"
                    }`}
                    {...field}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-3.5 right-4 text-gray-400 transition-colors hover:text-indigo-600 focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </FormControl>
              <FormMessage className="ml-1 text-xs text-red-600" />
            </FormItem>
          )}
        />

        {serverError && (
          <div className="animate-in fade-in slide-in-from-top-2 mb-2 rounded-xl border border-red-100 bg-red-50 p-3 text-center text-sm font-medium text-red-600">
            {serverError}
          </div>
        )}

        <Button
          className="mt-6 h-12 w-full rounded-xl bg-indigo-600 text-base font-semibold text-white shadow-lg shadow-indigo-600/20 transition-all hover:-translate-y-0.5 hover:bg-indigo-700 hover:shadow-xl active:scale-[0.98]"
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
