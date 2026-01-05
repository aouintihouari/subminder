import { ArrowUpRight, ArrowDownRight, CreditCard, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type Subscription,
  Frequency,
} from "@/features/subscriptions/types/types";

interface DashboardStatsProps {
  subscriptions: Subscription[];
}

export function DashboardStats({ subscriptions }: DashboardStatsProps) {
  const monthlyRecurringTotal = subscriptions.reduce((acc, sub) => {
    if (!sub.isActive) return acc;

    switch (sub.frequency) {
      case Frequency.WEEKLY:
        return acc + (sub.price * 52) / 12;

      case Frequency.MONTHLY:
        return acc + sub.price;

      case Frequency.YEARLY:
        return acc + sub.price / 12;

      case Frequency.ONCE:
        return acc;

      default:
        return acc;
    }
  }, 0);

  const yearlyProjection = monthlyRecurringTotal * 12;

  const mostExpensive = subscriptions.reduce(
    (prev, current) => {
      return prev.price > current.price ? prev : current;
    },
    subscriptions[0] || { name: "N/A", price: 0, currency: "EUR" },
  );

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Monthly Cost</CardTitle>
          <CreditCard className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {monthlyRecurringTotal.toFixed(2)} €
          </div>
          <p className="text-muted-foreground text-xs">
            Recurring expenses (smoothed)
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Yearly Projection
          </CardTitle>
          <Wallet className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {yearlyProjection.toFixed(2)} €
          </div>
          <p className="text-muted-foreground text-xs">
            Estimated annual recurring cost
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Subs</CardTitle>
          <ArrowUpRight className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{subscriptions.length}</div>
          <p className="text-muted-foreground text-xs">
            Across {new Set(subscriptions.map((s) => s.category)).size}{" "}
            categories
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Top Expense</CardTitle>
          <ArrowDownRight className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {mostExpensive.price.toFixed(2)} €
          </div>
          <p className="text-muted-foreground truncate text-xs">
            {mostExpensive.name}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
