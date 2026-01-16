import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, Menu } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { UserNav } from "@/components/UserNav";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"; // Ensure you installed this in Step 1
import { Button } from "@/components/ui/button";

export function ProtectedLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) navigate("/auth?tab=login");
  }, [isLoading, isAuthenticated, navigate]);

  if (isLoading) {
    return (
      <div className="dark:bg-background flex h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return isAuthenticated ? (
    <div className="dark:bg-background flex h-screen overflow-hidden bg-gray-50">
      <aside className="dark:bg-card hidden w-64 flex-col border-r bg-white md:flex">
        <div className="flex-1 overflow-y-auto">
          <Sidebar />
        </div>
        <div className="border-t p-4">
          <UserNav />
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="dark:bg-card flex h-16 items-center justify-between border-b bg-white px-4 md:hidden">
          <div className="flex items-center gap-2">
            <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <Sidebar />
                <div className="border-t p-4">
                  <UserNav />
                </div>
              </SheetContent>
            </Sheet>
            <span className="text-lg font-bold">SubMinder</span>
          </div>
          <UserNav />
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="animate-in fade-in-50 mx-auto max-w-6xl duration-500">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  ) : null;
}
