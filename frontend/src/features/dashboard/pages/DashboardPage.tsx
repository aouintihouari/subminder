import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/hooks/authContext";
import { subscriptionService } from "@/features/subscriptions/services/subscription.service";
import {
  type Subscription,
  Category,
} from "@/features/subscriptions/types/types";
import { DashboardStats } from "../components/DashboardStats";
import { SubscriptionCard } from "@/features/subscriptions/components/SubscriptionCard";
import { CreateSubscriptionModal } from "@/features/subscriptions/components/CreateSubscriptionModal";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  LayoutGrid,
  List,
  MoreVertical,
  Edit,
  Trash2,
  Clapperboard,
  Activity,
  Briefcase,
  Utensils,
  Book,
  Zap,
  Box,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { formatCurrency, formatDate } from "@/utils/formatters";

const categoryIcons: Record<Category, React.ElementType> = {
  [Category.ENTERTAINMENT]: Clapperboard,
  [Category.HEALTH]: Activity,
  [Category.WORK]: Briefcase,
  [Category.FOOD]: Utensils,
  [Category.LEARNING]: Book,
  [Category.UTILITIES]: Zap,
  [Category.OTHER]: Box,
};

const categoryStyles: Record<Category, string> = {
  ENTERTAINMENT:
    "text-purple-600 bg-purple-50 border-purple-100 dark:bg-purple-500/10 dark:text-purple-300 dark:border-purple-500/20",
  LEARNING:
    "text-blue-600 bg-blue-50 border-blue-100 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/20",
  UTILITIES:
    "text-slate-600 bg-slate-50 border-slate-100 dark:bg-slate-800/50 dark:text-slate-300 dark:border-slate-700",
  WORK: "text-gray-600 bg-gray-50 border-gray-100 dark:bg-gray-500/10 dark:text-gray-300 dark:border-gray-500/20",
  HEALTH:
    "text-emerald-600 bg-emerald-50 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20",
  FOOD: "text-orange-600 bg-orange-50 border-orange-100 dark:bg-orange-500/10 dark:text-orange-300 dark:border-orange-500/20",
  OTHER:
    "text-pink-600 bg-pink-50 border-pink-100 dark:bg-pink-500/10 dark:text-pink-300 dark:border-pink-500/20",
};

export function DashboardPage() {
  const { user, logout } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<
    Subscription | undefined
  >(undefined);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [subToDelete, setSubToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const response = await subscriptionService.getAll();
      if (response.status === "success" && response.data.subscriptions)
        setSubscriptions(response.data.subscriptions);
    } catch {
      toast.error("Failed to load subscriptions");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateClick = () => {
    setEditingSubscription(undefined);
    setIsModalOpen(true);
  };

  const handleEditClick = (sub: Subscription) => {
    setEditingSubscription(sub);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id: number) => {
    setSubToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!subToDelete) return;

    setIsDeleting(true);
    try {
      await subscriptionService.delete(subToDelete);
      setSubscriptions((prev) => prev.filter((sub) => sub.id !== subToDelete));
      toast.success("Subscription deleted");
      setDeleteDialogOpen(false);
    } catch {
      toast.error("Failed to delete subscription");
    } finally {
      setIsDeleting(false);
      setSubToDelete(null);
    }
  };

  const handleModalSuccess = () => {
    setIsModalOpen(false);
    fetchSubscriptions();
  };

  const filteredSubscriptions = useMemo(() => {
    return subscriptions
      .filter((sub) => {
        const matchesSearch = sub.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
        const matchesCategory =
          categoryFilter === "ALL" || sub.category === categoryFilter;

        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        return sortOrder === "desc" ? b.price - a.price : a.price - b.price;
      });
  }, [subscriptions, searchQuery, categoryFilter, sortOrder]);

  if (isLoading)
    return (
      <div className="bg-background flex h-screen items-center justify-center">
        <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
      </div>
    );

  return (
    <div className="dark:bg-background min-h-screen bg-gray-50 transition-colors duration-300">
      <header className="border-border dark:bg-background/80 sticky top-0 z-10 border-b bg-white/80 px-6 py-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 font-bold text-white dark:bg-indigo-500">
              S
            </div>
            <h1 className="text-foreground text-xl font-bold">SubMinder</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground hidden text-sm font-medium sm:inline-block">
              {user?.email}
            </span>
            <ModeToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="text-muted-foreground hover:text-red-600 dark:hover:text-red-400"
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl p-4 sm:p-6">
        <div className="mb-8 space-y-6">
          {/* HEADER SECTION */}
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-foreground text-2xl font-bold">Dashboard</h2>
              <p className="text-muted-foreground">
                Manage your recurring expenses.
              </p>
            </div>
            <Button
              onClick={handleCreateClick}
              className="gap-2 border-0 bg-linear-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/30 transition-all duration-200 hover:scale-[1.02] hover:shadow-indigo-500/50 dark:from-indigo-500 dark:to-violet-500 dark:shadow-indigo-900/50"
            >
              <Plus className="h-4 w-4" /> Add Subscription
            </Button>
          </div>

          {/* STATS SECTION */}
          <DashboardStats subscriptions={subscriptions} />

          {/* TOOLBAR SECTION */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Search Input */}
            <div className="relative w-full sm:w-[320px]">
              <Search className="text-muted-foreground absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder="Search..."
                className="dark:border-border dark:bg-card dark:text-foreground h-10 w-full rounded-xl border-gray-200 bg-white pl-10 shadow-sm outline-none focus-visible:border-indigo-500 focus-visible:ring-1 focus-visible:ring-indigo-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filters & View Toggle Group */}
            <div className="flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row">
              {/* Category Filter */}
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="dark:border-border dark:bg-card dark:text-foreground h-10 w-full rounded-xl border-gray-200 bg-white shadow-sm outline-none focus:ring-1 focus:ring-indigo-500 sm:w-45">
                  <div className="flex items-center gap-2 truncate">
                    <Filter className="text-muted-foreground h-4 w-4" />
                    <SelectValue placeholder="Category" />
                  </div>
                </SelectTrigger>
                <SelectContent className="min-w-50">
                  <SelectItem
                    value="ALL"
                    className="focus:bg-accent cursor-pointer rounded-lg py-2.5"
                  >
                    All Categories
                  </SelectItem>
                  {Object.values(Category).map((cat) => {
                    const Icon = categoryIcons[cat];
                    return (
                      <SelectItem
                        key={cat}
                        value={cat}
                        className="focus:bg-accent cursor-pointer rounded-lg py-2.5"
                      >
                        <div className="flex items-center">
                          <Icon className="text-muted-foreground mr-2 size-4" />
                          <span>
                            {cat.charAt(0) + cat.slice(1).toLowerCase()}
                          </span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>

              {/* Sort Filter */}
              <Select
                value={sortOrder}
                onValueChange={(val: "asc" | "desc") => setSortOrder(val)}
              >
                <SelectTrigger className="dark:border-border dark:bg-card dark:text-foreground h-10 w-full rounded-xl border-gray-200 bg-white shadow-sm outline-none focus:ring-1 focus:ring-indigo-500 sm:w-50">
                  <div className="flex items-center gap-2 truncate">
                    <ArrowUpDown className="text-muted-foreground h-4 w-4" />
                    <SelectValue placeholder="Sort" />
                  </div>
                </SelectTrigger>
                <SelectContent className="min-w-50">
                  <SelectItem
                    value="desc"
                    className="focus:bg-accent cursor-pointer rounded-lg py-2.5"
                  >
                    Price: High to Low
                  </SelectItem>
                  <SelectItem
                    value="asc"
                    className="focus:bg-accent cursor-pointer rounded-lg py-2.5"
                  >
                    Price: Low to High
                  </SelectItem>
                </SelectContent>
              </Select>

              {/* Separator */}
              <div className="dark:bg-border hidden h-8 w-px bg-gray-200 sm:block"></div>

              {/* View Toggles */}
              <div className="dark:border-border dark:bg-card flex h-10 items-center rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`flex h-full flex-1 items-center justify-center rounded-lg px-3 transition-colors outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 sm:flex-none ${
                    viewMode === "grid"
                      ? "bg-gray-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  aria-label="Grid view"
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`flex h-full flex-1 items-center justify-center rounded-lg px-3 transition-colors outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 sm:flex-none ${
                    viewMode === "list"
                      ? "bg-gray-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  aria-label="List view"
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {filteredSubscriptions.length === 0 ? (
            <div className="animate-in fade-in-50 border-border bg-card flex min-h-100 flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-500/10">
                <Plus className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-foreground mt-6 text-xl font-semibold">
                {subscriptions.length === 0
                  ? "No subscriptions yet"
                  : "No results found"}
              </h3>
              <p className="text-muted-foreground mt-2 max-w-sm text-center">
                {subscriptions.length === 0
                  ? "Track your recurring expenses by adding your first subscription."
                  : "Try adjusting your search or filters to find what you're looking for."}
              </p>
              {subscriptions.length === 0 && (
                <Button onClick={handleCreateClick} className="mt-6 gap-2">
                  <Plus className="h-4 w-4" /> Add your first subscription
                </Button>
              )}
            </div>
          ) : viewMode === "grid" ? (
            // VUE GRILLE
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {filteredSubscriptions.map((sub) => (
                <SubscriptionCard
                  key={sub.id}
                  subscription={sub}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteClick}
                />
              ))}
            </div>
          ) : (
            <div className="border-border bg-card overflow-hidden rounded-xl border shadow-sm">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Category
                    </TableHead>
                    <TableHead className="text-right md:text-left">
                      Price
                    </TableHead>
                    <TableHead className="hidden md:table-cell">
                      Frequency
                    </TableHead>
                    <TableHead className="hidden md:table-cell">
                      Start Date
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubscriptions.map((sub) => (
                    <TableRow key={sub.id} className="hover:bg-muted/50">
                      {/* Name + Mobile Badge */}
                      <TableCell className="text-foreground font-medium">
                        <div className="flex flex-col gap-1">
                          <span>{sub.name}</span>
                          <Badge
                            variant="outline"
                            className={`w-fit border text-[10px] font-semibold tracking-wider uppercase md:hidden ${categoryStyles[sub.category]}`}
                          >
                            {sub.category}
                          </Badge>
                        </div>
                      </TableCell>

                      {/* Desktop Badge Column */}
                      <TableCell className="hidden md:table-cell">
                        <Badge
                          variant="outline"
                          className={`border text-[10px] font-semibold tracking-wider uppercase ${categoryStyles[sub.category]}`}
                        >
                          {sub.category}
                        </Badge>
                      </TableCell>

                      {/* Price (Align Right on Mobile) */}
                      <TableCell className="text-foreground text-right font-semibold md:text-left">
                        {formatCurrency(sub.price, sub.currency)}
                      </TableCell>

                      {/* Secondary Info (Hidden on Mobile) */}
                      <TableCell className="text-muted-foreground hidden capitalize md:table-cell">
                        {sub.frequency.toLowerCase()}
                      </TableCell>
                      <TableCell className="text-muted-foreground hidden md:table-cell">
                        {formatDate(sub.startDate)}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              className="text-muted-foreground hover:text-foreground h-8 w-8 p-0"
                            >
                              <span className="sr-only">Open menu</span>
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleEditClick(sub)}
                            >
                              <Edit className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteClick(sub.id)}
                              className="text-red-600 focus:bg-red-50 focus:text-red-600 dark:focus:bg-red-950/30"
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </main>

      <CreateSubscriptionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
        subscriptionToEdit={editingSubscription}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              subscription from your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="cursor-pointer bg-white"
              disabled={isDeleting}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                confirmDelete();
              }}
              disabled={isDeleting}
              className="cursor-pointer bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Subscription
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
