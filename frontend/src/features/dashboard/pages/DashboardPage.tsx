import { Button } from "@/components/ui/button";
import { Link } from "react-router";

export function DashboardPage() {
  return (
    <div className="p-6">
      <div className="flex flex-col items-start gap-4">
        <h1 className="text-3xl font-bold tracking-tight">
          Dashboard Overview
        </h1>
        <p className="text-muted-foreground">
          Welcome to SubMinder V2. This page is under construction.
        </p>
        <Button asChild>
          <Link to="/subscriptions">Go to Subscriptions</Link>
        </Button>
      </div>
    </div>
  );
}
