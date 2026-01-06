import { CreditCard } from "lucide-react";
import { useSearchParams } from "react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { SignupForm } from "../components/SignupForm";
import { LoginForm } from "../components/LoginForm";

export function AuthPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get("tab") || "login";

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center px-4 py-6 font-sans transition-colors duration-300">
      <div className="animate-in slide-in-from-top-4 fade-in mb-6 space-y-2 text-center duration-700">
        <div className="flex justify-center">
          <div className="dark:bg-primary text-primary-foreground dark:shadow-primary/20 mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-600/20 transition-transform duration-300 hover:scale-105">
            <CreditCard className="h-7 w-7" />
          </div>
        </div>
        <h1 className="text-foreground my-3 text-4xl font-extrabold tracking-tight">
          SubMinder
        </h1>
        <p className="text-muted-foreground text-base">
          Manage your subscriptions intelligently.
        </p>
      </div>

      <Card className="animate-in fade-in zoom-in-95 slide-in-from-bottom-4 border-border bg-card w-full max-w-md p-4 shadow-xl duration-500 sm:p-6">
        <CardContent className="p-0">
          <Tabs
            value={currentTab}
            onValueChange={handleTabChange}
            className="w-full"
          >
            <TabsList className="border-border mb-6 grid h-auto w-full grid-cols-2 border-b bg-transparent p-0">
              <TabsTrigger
                value="login"
                className="text-muted-foreground hover:text-primary dark:data-[state=active]:border-b-primary data-[state=active]:text-primary cursor-pointer rounded-none border-b-2 border-transparent pt-2 pb-3 text-base font-medium transition-all data-[state=active]:border-b-indigo-600 data-[state=active]:shadow-none"
              >
                Login
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                className="text-muted-foreground hover:text-primary dark:data-[state=active]:border-b-primary data-[state=active]:text-primary cursor-pointer rounded-none border-b-2 bg-transparent pt-2 pb-3 text-base font-medium transition-all data-[state=active]:border-b-indigo-600 data-[state=active]:shadow-none"
              >
                Sign Up
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="mt-0">
              <LoginForm />
            </TabsContent>

            <TabsContent value="signup" className="mt-0">
              <SignupForm />
            </TabsContent>
          </Tabs>

          <div className="text-muted-foreground mt-6 text-center text-xs">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
