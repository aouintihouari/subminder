import { Calendar, Tag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { type Subscription, Category } from "../types/types";

const getCategoryColor = (category: Category) => {
  switch (category) {
    case Category.ENTERTAINMENT:
      return "bg-purple-100 text-purple-700 hover:bg-purple-100/80";
    case Category.UTILITIES:
      return "bg-blue-100 text-blue-700 hover:bg-blue-100/80";
    case Category.FOOD:
      return "bg-orange-100 text-orange-700 hover:bg-orange-100/80";
    case Category.HEALTH:
      return "bg-green-100 text-green-700 hover:bg-green-100/80";
    case Category.LEARNING:
      return "bg-yellow-100 text-yellow-700 hover:bg-yellow-100/80";
    case Category.WORK:
      return "bg-slate-100 text-slate-700 hover:bg-slate-100/80";
    default:
      return "bg-gray-100 text-gray-700 hover:bg-gray-100/80";
  }
};

interface SubscriptionCardProps {
  subscription: Subscription;
}

export function SubscriptionCard({ subscription }: SubscriptionCardProps) {
  return (
    <Card className="transition-all hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-semibold text-gray-900">
          {subscription.name}
        </CardTitle>
        <Badge
          variant="secondary"
          className={`pointer-events-none border-0 ${getCategoryColor(subscription.category)}`}
        >
          {subscription.category}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900">
          {subscription.price.toFixed(2)}{" "}
          <span className="text-lg font-medium text-gray-500">
            {subscription.currency}
          </span>
        </div>
        <div className="mt-3 flex flex-col gap-2 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            <span className="capitalize">
              {subscription.frequency.toLowerCase()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>
              Started {new Date(subscription.startDate).toLocaleDateString()}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
