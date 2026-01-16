import { Link, useLocation } from "react-router";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  CreditCard,
  Receipt,
  BarChart3,
  Settings,
} from "lucide-react";

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Subscriptions",
    href: "/subscriptions",
    icon: CreditCard,
  },
  {
    title: "Expenses",
    href: "/expenses",
    icon: Receipt,
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

// ✅ FIX: Change 'interface' to 'type' to satisfy the linter
type SidebarProps = React.HTMLAttributes<HTMLDivElement>;

export function Sidebar({ className }: SidebarProps) {
  const location = useLocation();

  return (
    <div className={cn("pb-12", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="mb-6 flex items-center px-4">
            <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 font-bold text-white dark:bg-indigo-500">
              S
            </div>
            <h2 className="text-xl font-bold tracking-tight">SubMinder</h2>
          </div>
          <div className="space-y-1">
            {sidebarItems.map((item) => {
              const isActive = location.pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "hover:bg-accent hover:text-accent-foreground flex items-center rounded-md px-4 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"
                      : "text-muted-foreground",
                  )}
                >
                  <item.icon className="mr-3 h-4 w-4" />
                  {item.title}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
