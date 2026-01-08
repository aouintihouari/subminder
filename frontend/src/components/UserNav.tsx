import { useNavigate } from "react-router";
import { LogOut, User, Moon, Sun, Laptop } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";

export function UserNav() {
  const { user, logout } = useAuth();
  const { setTheme } = useTheme();
  const navigate = useNavigate();

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user?.email?.charAt(0).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-10 w-10 rounded-full p-0 hover:bg-transparent"
        >
          <div className="flex h-full w-full items-center justify-center rounded-full bg-linear-to-br from-indigo-500 to-purple-600 text-white shadow-md ring-2 ring-white transition-transform duration-200 hover:scale-105 hover:shadow-lg dark:ring-slate-800">
            <span className="text-sm font-bold tracking-wide">{initials}</span>
          </div>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56 p-2" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1 p-1">
            <p className="text-sm leading-none font-semibold">
              {user?.name || "User"}
            </p>
            <p className="text-muted-foreground truncate text-xs font-normal">
              {user?.email}
            </p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="my-2" />

        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() => navigate("/settings")}
            className="cursor-pointer gap-3 rounded-md py-2 focus:bg-indigo-50 dark:focus:bg-indigo-900/20"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-indigo-100 dark:bg-indigo-900/50">
              <User className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="font-medium">Profile</span>
              <span className="text-muted-foreground text-[10px]">
                Account settings
              </span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="my-2" />

        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="cursor-pointer gap-3 rounded-md py-2 focus:bg-slate-100 dark:focus:bg-slate-800">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-100 dark:bg-slate-800">
                <Sun className="h-4 w-4 scale-100 rotate-0 text-orange-500 transition-all dark:scale-0 dark:-rotate-90" />
                <Moon className="absolute h-4 w-4 scale-0 rotate-90 text-blue-400 transition-all dark:scale-100 dark:rotate-0" />
              </div>
              <span className="font-medium">Appearance</span>
            </DropdownMenuSubTrigger>

            <DropdownMenuSubContent className="p-1">
              <DropdownMenuItem
                onClick={() => setTheme("light")}
                className="cursor-pointer gap-2"
              >
                <Sun className="h-4 w-4 text-orange-500" /> <span>Light</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setTheme("dark")}
                className="cursor-pointer gap-2"
              >
                <Moon className="h-4 w-4 text-blue-400" /> <span>Dark</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setTheme("system")}
                className="cursor-pointer gap-2"
              >
                <Laptop className="h-4 w-4 text-slate-500" />{" "}
                <span>System</span>
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="my-2" />

        <DropdownMenuItem
          onClick={logout}
          className="cursor-pointer gap-3 rounded-md py-2 text-red-600 focus:bg-red-50 focus:text-red-600 dark:focus:bg-red-950/30"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-red-100 dark:bg-red-900/30">
            <LogOut className="h-4 w-4 text-red-600 dark:text-red-400" />
          </div>
          <span className="font-medium">Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
