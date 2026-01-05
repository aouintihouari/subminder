import { useEffect, useState, useCallback } from "react";
import { Loader2, LogOut, CreditCard } from "lucide-react";
import { useAuth } from "@/hooks/authContext";
import { Button } from "@/components/ui/button";
import { subscriptionService } from "@/features/subscriptions/services/subscription.service";
import { type Subscription } from "@/features/subscriptions/types/types";
import { SubscriptionCard } from "@/features/subscriptions/components/SubscriptionCard";
import { CreateSubscriptionModal } from "@/features/subscriptions/components/CreateSubscriptionModal";
import { DashboardStats } from "../components/DashboardStats";

export function DashboardPage() {
  const { user, logout } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editingSubscription, setEditingSubscription] =
    useState<Subscription | null>(null);

  const fetchSubscriptions = useCallback(async () => {
    try {
      setError(null);
      const response = await subscriptionService.getAll();
      if (response.data.subscriptions) {
        setSubscriptions(response.data.subscriptions);
      }
    } catch (err) {
      setError("Failed to load subscriptions.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  return (
    <div className="min-h-screen bg-gray-50/50">
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 px-6 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 font-bold text-white">
              S
            </div>
            <h1 className="text-xl font-bold text-gray-900">SubMinder</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm font-medium text-gray-600 sm:inline-block">
              {user?.email}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="text-gray-500 hover:text-red-600"
            >
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl p-6">
        <div className="mb-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
              <p className="text-muted-foreground">
                Manage your recurring expenses.
              </p>
            </div>
            <CreateSubscriptionModal onSuccess={fetchSubscriptions} />
          </div>

          <DashboardStats subscriptions={subscriptions} />
        </div>

        {/* Loading / Error / Empty / List */}
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          </div>
        ) : error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center text-red-700">
            {error}{" "}
            <Button
              variant="link"
              onClick={fetchSubscriptions}
              className="ml-2 text-red-700 underline"
            >
              Retry
            </Button>
          </div>
        ) : subscriptions.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-white p-8 text-center">
            <div className="mb-4 rounded-full bg-indigo-50 p-3">
              <CreditCard className="h-6 w-6 text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              No subscriptions yet
            </h3>
            <p className="text-muted-foreground mb-4 max-w-sm text-sm">
              Add your first subscription to start tracking.
            </p>
            <CreateSubscriptionModal onSuccess={fetchSubscriptions} />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {subscriptions.map((sub) => (
              <SubscriptionCard
                key={sub.id}
                subscription={sub}
                onEdit={(s) => setEditingSubscription(s)}
                onDeleteSuccess={fetchSubscriptions}
              />
            ))}
          </div>
        )}

        <CreateSubscriptionModal
          isOpen={!!editingSubscription}
          onClose={() => setEditingSubscription(null)}
          subscriptionToEdit={editingSubscription}
          onSuccess={() => {
            fetchSubscriptions();
            setEditingSubscription(null);
          }}
        />
      </main>
    </div>
  );
}
