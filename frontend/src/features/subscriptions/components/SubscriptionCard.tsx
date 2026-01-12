import { Calendar, MoreVertical, Edit, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatCurrency } from "@/utils/formatters";
import { type Subscription } from "../types/types";
import { categoryStyles, accentStyles } from "../config/categoryStyles";
import { getNextPaymentDate, formatNextPayment } from "@/utils/dates";

interface SubscriptionCardProps {
  subscription: Subscription;
  onEdit: (sub: Subscription) => void;
  onDelete: (id: number) => void;
}

export function SubscriptionCard({
  subscription,
  onEdit,
  onDelete,
}: SubscriptionCardProps) {
  const nextPayment = getNextPaymentDate(
    subscription.startDate,
    subscription.frequency,
  );

  const isUrgent =
    nextPayment &&
    new Date(nextPayment).getTime() - new Date().getTime() <
      3 * 24 * 60 * 60 * 1000;

  return (
    <Card className="group border-border bg-card relative flex h-full flex-col gap-0 overflow-hidden border py-0 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/5">
      <div
        className={`absolute top-0 left-0 transition-opacity ${accentStyles[subscription.category]} h-1 w-full sm:h-full sm:w-1`}
      />
      <CardHeader className="flex flex-row items-start justify-between space-y-0 p-4 pl-4 sm:pl-5">
        <div className="flex flex-col gap-1.5 overflow-hidden">
          <CardTitle className="text-foreground truncate text-base leading-tight font-bold">
            {subscription.name}
          </CardTitle>
          <Badge
            variant="outline"
            className={`${categoryStyles[subscription.category]} h-5 w-fit border px-1.5 text-[10px] font-semibold tracking-wider uppercase`}
          >
            {subscription.category}
          </Badge>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="text-muted-foreground hover:text-foreground data-[state=open]:text-foreground -mr-2 h-7 w-7 p-0"
            >
              <span className="sr-only">Open menu</span>
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(subscription)}>
              <Edit className="mr-2 h-4 w-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(subscription.id)}
              className="text-red-600 focus:bg-red-50 focus:text-red-600 dark:focus:bg-red-950/30"
            >
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col p-4 pt-0 pl-4 sm:pl-5">
        <div className="mb-3">
          <span className="text-foreground text-xl font-extrabold tracking-tight sm:text-2xl">
            {formatCurrency(subscription.price, subscription.currency)}
          </span>
          <span className="text-muted-foreground ml-1 text-xs font-medium">
            /
            {subscription.frequency === "ONCE"
              ? "one-time"
              : subscription.frequency === "YEARLY"
                ? "yr"
                : subscription.frequency === "WEEKLY"
                  ? "wk"
                  : "mo"}
          </span>
        </div>
        <div className="border-border mt-auto flex flex-col gap-2 border-t pt-3">
          {subscription.description && (
            <p className="text-muted-foreground line-clamp-2 text-xs leading-normal">
              {subscription.description}
            </p>
          )}
          <div
            className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
              isUrgent
                ? "text-orange-600 dark:text-orange-400"
                : "text-muted-foreground"
            }`}
          >
            <Calendar className="h-3.5 w-3.5 opacity-70" />
            <span>
              {subscription.frequency === "ONCE"
                ? "One-time payment"
                : `Next: ${formatNextPayment(nextPayment)}`}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
