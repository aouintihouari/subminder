import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Loader2,
  Mail,
  Lock,
  User,
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

import { signupSchema, type SignupFormValues } from "../schemas/signup.schema";
import { authService } from "../services/auth.service";

export function SignupForm() {
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
    } catch (error: any) {
      let message = "Something went wrong. Please try again.";
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        message = error.response.data.message;
      } else if (error.message) {
        message = error.message;
      }
      setServerError(message);
    } finally {
      setIsLoading(false);
    }
  }

  // --- SUCCESS STATE ---
  if (success) {
    return (
      <Card className="animate-in fade-in zoom-in-95 w-full border-x-0 border-t-4 border-b-0 border-t-indigo-600 shadow-none duration-500">
        <CardContent className="flex flex-col items-center space-y-4 pt-8 pb-8 text-center">
          <div className="animate-in zoom-in flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 shadow-sm duration-300">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            Please verify your email
          </h2>
          <Button
            className="mt-6 h-11 w-full bg-indigo-600 text-white shadow-md transition-all hover:scale-[1.02] hover:bg-indigo-700"
            onClick={() => window.location.reload()}
          >
            Go to Login <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  // --- FORM ---
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="animate-in fade-in slide-in-from-right-4 space-y-4 duration-300"
      >
        {/* FULL NAME */}
        <FormField
          control={form.control}
          name="name"
          render={({ field, fieldState }) => (
            <FormItem className="space-y-1.5">
              <FormLabel
                className={`ml-1 text-sm font-medium ${fieldState.error ? "text-red-600" : "text-gray-700"}`}
              >
                Full Name
              </FormLabel>
              <FormControl>
                <div className="group relative transition-all duration-200 focus-within:scale-[1.01]">
                  <User
                    className={`absolute top-3.5 left-4 h-5 w-5 transition-colors duration-200 ${fieldState.error ? "text-red-500" : "text-gray-400 group-focus-within:text-indigo-600"}`}
                  />
                  <Input
                    placeholder="John Doe"
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

        {/* EMAIL */}
        <FormField
          control={form.control}
          name="email"
          render={({ field, fieldState }) => (
            <FormItem className="space-y-1.5">
              <FormLabel
                className={`ml-1 text-sm font-medium ${fieldState.error ? "text-red-600" : "text-gray-700"}`}
              >
                Professional Email
              </FormLabel>
              <FormControl>
                <div className="group relative transition-all duration-200 focus-within:scale-[1.01]">
                  <Mail
                    className={`absolute top-3.5 left-4 h-5 w-5 transition-colors duration-200 ${fieldState.error ? "text-red-500" : "text-gray-400 group-focus-within:text-indigo-600"}`}
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

        {/* PASSWORD */}
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
                    className={`absolute top-3.5 left-4 h-5 w-5 transition-colors duration-200 ${fieldState.error ? "text-red-500" : "text-gray-400 group-focus-within:text-indigo-600"}`}
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

        {/* CONFIRM PASSWORD */}
        <FormField
          control={form.control}
          name="passwordConfirm"
          render={({ field, fieldState }) => (
            <FormItem className="space-y-1.5">
              <FormLabel
                className={`ml-1 text-sm font-medium ${fieldState.error ? "text-red-600" : "text-gray-700"}`}
              >
                Confirm Password
              </FormLabel>
              <FormControl>
                <div className="group relative transition-all duration-200 focus-within:scale-[1.01]">
                  <Lock
                    className={`absolute top-3.5 left-4 h-5 w-5 transition-colors duration-200 ${fieldState.error ? "text-red-500" : "text-gray-400 group-focus-within:text-indigo-600"}`}
                  />
                  <Input
                    placeholder="••••••••"
                    type={showConfirmPassword ? "text" : "password"}
                    className={`h-12 rounded-xl border bg-gray-50/50 pr-10 pl-11 text-base shadow-sm transition-all duration-200 focus:bg-white focus:ring-2 ${
                      fieldState.error
                        ? "border-red-500 placeholder:text-red-300 focus:border-red-500 focus:ring-red-100"
                        : "border-gray-200 hover:border-gray-300 focus:border-indigo-500 focus:ring-indigo-100"
                    }`}
                    {...field}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute top-3.5 right-4 text-gray-400 transition-colors hover:text-indigo-600 focus:outline-none"
                  >
                    {showConfirmPassword ? (
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
