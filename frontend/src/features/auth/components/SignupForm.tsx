import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import axios from "axios";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { signupSchema, type SignupFormValues } from "../schemas/signup.schema";

/**
 * Define the structure of your backend error response
 * to ensure type safety when accessing err.response.data
 */
interface ApiErrorResponse {
  message: string;
}

export function SignupForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", password: "", passwordConfirm: "" },
  });

  async function onSubmit(data: SignupFormValues) {
    setIsLoading(true);
    setServerError(null);

    try {
      const response = await axios.post(
        "http://localhost:8000/api/v1/auth/signup",
        {
          name: data.name,
          email: data.email,
          password: data.password,
          passwordConfirm: data.passwordConfirm,
        },
      );

      console.log("Success:", response.data);
      // In a real app, you would use a toast notification and router.push() here
      alert("Account created successfully! (Redirection pending)");
    } catch (err: unknown) {
      let errorMessage = "Something went wrong. Please try again.";

      // Check if the error is specifically an Axios error
      if (axios.isAxiosError<ApiErrorResponse>(err)) {
        errorMessage = err.response?.data?.message || err.message;
      } else if (err instanceof Error) {
        // Handle generic JavaScript errors
        errorMessage = err.message;
      }

      setServerError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-slate-900">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="mb-4 flex justify-center">
            <div className="bg-primary text-primary-foreground flex h-10 w-10 items-center justify-center rounded-lg text-xl font-bold">
              SM
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">SubMinder</CardTitle>
          <CardDescription>
            Manage your subscriptions intelligently.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="signup" className="w-full">
            <TabsList className="mb-6 grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <div className="text-muted-foreground p-4 text-center text-sm">
                Login form is not implemented yet.
              </div>
            </TabsContent>

            <TabsContent value="signup">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Professional Email</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="name@example.com"
                            type="email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="********"
                            type="password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="passwordConfirm"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="********"
                            type="password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {serverError && (
                    <div className="bg-destructive/15 text-destructive rounded-md p-3 text-center text-sm font-medium">
                      {serverError}
                    </div>
                  )}

                  <Button className="w-full" type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      "Create my account →"
                    )}
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
