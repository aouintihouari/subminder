import { ArrowUpRight, CreditCard, Wallet, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/utils/formatters";
import { type Subscription } from "@/features/subscriptions/types/types";

export interface DashboardStatsData {
  totalMonthly: number;
  totalYearly: number;
  activeCount: number;
  categoryCount: number;
  mostExpensive: Subscription | null;
}

interface DashboardStatsProps {
  stats: DashboardStatsData;
  isLoading?: boolean;
}

const ValueSkeleton = () => (
  <div className="bg-muted h-8 w-24 animate-pulse rounded-md" />
);

export function DashboardStats({
  stats,
  isLoading = false,
}: DashboardStatsProps) {
  const cardClasses =
    "bg-card shadow-sm border-border/60 py-4 sm:py-6 gap-4 sm:gap-6 transition-all duration-200 hover:shadow-md";
  const headerClasses =
    "flex flex-row items-center justify-between space-y-0 pb-2 px-4 sm:px-6";
  const contentClasses = "px-4 sm:px-6";
  const priceClasses =
    "text-2xl sm:text-3xl font-bold text-foreground tracking-tight";
  const subtitleClasses =
    "text-xs sm:text-sm text-muted-foreground mt-1 truncate font-medium";

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {/* 1. MONTHLY */}
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
            {isLoading ? (
              <ValueSkeleton />
            ) : (
              formatCurrency(stats.totalMonthly, "EUR")
            )}
          </div>
          <p className={subtitleClasses}>Recurring expenses</p>
        </CardContent>
      </Card>

      {/* 2. YEARLY */}
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
            {isLoading ? (
              <ValueSkeleton />
            ) : (
              formatCurrency(stats.totalYearly, "EUR")
            )}
          </div>
          <p className={subtitleClasses}>Estimated cost</p>
        </CardContent>
      </Card>

      {/* 3. ACTIVE */}
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
          <div className={priceClasses}>
            {isLoading ? <ValueSkeleton /> : stats.activeCount}
          </div>
          <p className={subtitleClasses}>
            Across {stats.categoryCount} categories
          </p>
        </CardContent>
      </Card>

      {/* 4. TOP */}
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
            {isLoading ? (
              <ValueSkeleton />
            ) : stats.mostExpensive ? (
              formatCurrency(
                stats.mostExpensive.price,
                stats.mostExpensive.currency,
              )
            ) : (
              "—"
            )}
          </div>
          <p className={subtitleClasses}>
            {isLoading
              ? "Loading..."
              : stats.mostExpensive
                ? stats.mostExpensive.name
                : "No subscriptions"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
