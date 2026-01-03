import { CreditCard } from "lucide-react";
import { useSearchParams } from "react-router";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { SignupForm } from "../components/SignupForm";
import { LoginForm } from "../components/LoginForm";

export function AuthPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const currentTab = searchParams.get("tab") || "signup";

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F8F9FC] px-4 py-6 font-sans">
      <div className="animate-in slide-in-from-top-4 fade-in mb-6 space-y-2 text-center duration-700">
        <div className="flex justify-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 transition-transform duration-300 hover:scale-105">
            <CreditCard className="h-7 w-7" />
          </div>
        </div>
        <h1 className="my-3 text-4xl font-extrabold tracking-tight text-gray-900">
          SubMinder
        </h1>
        <p className="text-muted-foreground text-base">
          Manage your subscriptions intelligently.
        </p>
      </div>

      <Card className="animate-in fade-in zoom-in-95 slide-in-from-bottom-4 w-full max-w-110 border-none bg-white p-4 shadow-xl duration-500 sm:p-6">
        <CardHeader className="p-0 pb-0"></CardHeader>

        <CardContent className="p-0">
          <Tabs
            value={currentTab}
            onValueChange={handleTabChange}
            className="w-full"
          >
            <TabsList className="mb-6 grid h-auto w-full grid-cols-2 border-b border-gray-100 bg-transparent p-0">
              <TabsTrigger
                value="login"
                className="text-muted-foreground cursor-pointer rounded-none border-t-0 border-r-0 border-b-2 border-l-0 border-transparent bg-transparent pt-2 pb-3 text-base font-medium transition-all hover:text-indigo-600 data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 data-[state=active]:shadow-none"
              >
                Login
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                className="text-muted-foreground cursor-pointer rounded-none border-t-0 border-r-0 border-b-2 border-l-0 border-transparent bg-transparent pt-2 pb-3 text-base font-medium transition-all hover:text-indigo-600 data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 data-[state=active]:shadow-none"
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
