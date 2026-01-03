import { useAuth } from "@/hooks/authContext";
import { Button } from "@/components/ui/button";

export function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900">
          Dashboard Protégé 🔒
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          Welcome,{" "}
          <span className="font-semibold text-indigo-600">{user?.email}</span>
        </p>
        <div className="mt-8">
          <Button onClick={logout} variant="destructive">
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}
