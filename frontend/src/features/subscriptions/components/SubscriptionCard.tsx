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
import { formatCurrency, formatDate } from "@/utils/formatters";
import { type Subscription, Category } from "../types/types";

interface SubscriptionCardProps {
  subscription: Subscription;
  onEdit: (sub: Subscription) => void;
  onDelete: (id: number) => void;
}

const categoryStyles: Record<Category, string> = {
  ENTERTAINMENT:
    "text-purple-600 bg-purple-50 border-purple-100 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800",
  LEARNING:
    "text-blue-600 bg-blue-50 border-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800",
  UTILITIES:
    "text-slate-600 bg-slate-50 border-slate-100 dark:bg-slate-800/50 dark:text-slate-300 dark:border-slate-700",
  WORK: "text-gray-600 bg-gray-50 border-gray-100 dark:bg-gray-800/50 dark:text-gray-300 dark:border-gray-700",
  HEALTH:
    "text-emerald-600 bg-emerald-50 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800",
  FOOD: "text-orange-600 bg-orange-50 border-orange-100 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800",
  OTHER:
    "text-pink-600 bg-pink-50 border-pink-100 dark:bg-pink-900/20 dark:text-pink-300 dark:border-pink-800",
};

const accentStyles: Record<Category, string> = {
  ENTERTAINMENT: "bg-purple-600 dark:bg-purple-500",
  LEARNING: "bg-blue-600 dark:bg-blue-500",
  UTILITIES: "bg-slate-600 dark:bg-slate-500",
  WORK: "bg-gray-600 dark:bg-gray-500",
  HEALTH: "bg-emerald-600 dark:bg-emerald-500",
  FOOD: "bg-orange-600 dark:bg-orange-500",
  OTHER: "bg-pink-600 dark:bg-pink-500",
};

export function SubscriptionCard({
  subscription,
  onEdit,
  onDelete,
}: SubscriptionCardProps) {
  return (
    <Card className="group border-border bg-card relative flex h-full flex-col gap-0 overflow-hidden border py-0 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/5">
      <div
        className={`absolute top-0 left-0 transition-opacity ${accentStyles[subscription.category]} h-1 w-full sm:h-full sm:w-1`}
      />

      {/* HEADER */}
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

        {/* Menu Actions */}
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
                : "mo"}
          </span>
        </div>

        <div className="border-border mt-auto flex flex-col gap-2 border-t pt-3">
          {subscription.description && (
            <p className="text-muted-foreground line-clamp-2 text-xs leading-normal">
              {subscription.description}
            </p>
          )}

          {/* 2. Date */}
          <div className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
            <Calendar className="text-muted-foreground/70 h-3.5 w-3.5" />
            <span>Next: {formatDate(subscription.startDate)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
