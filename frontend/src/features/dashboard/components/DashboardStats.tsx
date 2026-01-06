import { ArrowUpRight, CreditCard, Wallet, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type Subscription,
  Frequency,
} from "@/features/subscriptions/types/types";
import { formatCurrency } from "@/utils/formatters";

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

  const cardClasses =
    "bg-card shadow-sm border-border/60 py-4 sm:py-6 gap-4 sm:gap-6";
  const headerClasses =
    "flex flex-row items-center justify-between space-y-0 pb-2 px-4 sm:px-6";
  const contentClasses = "px-4 sm:px-6";
  const priceClasses = "text-2xl sm:text-3xl font-bold text-foreground";
  const subtitleClasses =
    "text-xs sm:text-sm text-muted-foreground mt-1 truncate";

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <Card className={cardClasses}>
        <CardHeader className={headerClasses}>
          <CardTitle className="text-muted-foreground text-sm font-medium">
            Monthly
          </CardTitle>
          <div className="rounded-full bg-purple-100 p-2 dark:bg-purple-500/20">
            <CreditCard className="h-4 w-4 text-purple-600 dark:text-purple-300" />
          </div>
        </CardHeader>
        <CardContent className={contentClasses}>
          <div className={priceClasses}>
            {formatCurrency(monthlyRecurringTotal, "EUR")}
          </div>
          <p className={subtitleClasses}>Recurring expenses</p>
        </CardContent>
      </Card>

      <Card className={cardClasses}>
        <CardHeader className={headerClasses}>
          <CardTitle className="text-muted-foreground text-sm font-medium">
            Yearly
          </CardTitle>
          <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-500/20">
            <Wallet className="h-4 w-4 text-blue-600 dark:text-blue-300" />
          </div>
        </CardHeader>
        <CardContent className={contentClasses}>
          <div className={priceClasses}>
            {formatCurrency(yearlyProjection, "EUR")}
          </div>
          <p className={subtitleClasses}>Estimated cost</p>
        </CardContent>
      </Card>

      <Card className={cardClasses}>
        <CardHeader className={headerClasses}>
          <CardTitle className="text-muted-foreground text-sm font-medium">
            Active
          </CardTitle>
          <div className="rounded-full bg-emerald-100 p-2 dark:bg-emerald-500/20">
            <Activity className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
          </div>
        </CardHeader>
        <CardContent className={contentClasses}>
          <div className={priceClasses}>{subscriptions.length}</div>
          <p className={subtitleClasses}>
            Across {new Set(subscriptions.map((s) => s.category)).size}{" "}
            categories
          </p>
        </CardContent>
      </Card>

      <Card className={cardClasses}>
        <CardHeader className={headerClasses}>
          <CardTitle className="text-muted-foreground text-sm font-medium">
            Top
          </CardTitle>
          <div className="rounded-full bg-red-100 p-2 dark:bg-red-500/20">
            <ArrowUpRight className="h-4 w-4 text-red-600 dark:text-red-300" />
          </div>
        </CardHeader>
        <CardContent className={contentClasses}>
          <div className={priceClasses}>
            {formatCurrency(mostExpensive.price, mostExpensive.currency)}
          </div>
          <p className={subtitleClasses}>{mostExpensive.name}</p>
        </CardContent>
      </Card>
    </div>
  );
}
