import { DashboardStats } from "../components/DashboardStats";
import { DashboardToolbar } from "../components/DashboardToolbar";
import { useDashboard } from "../../../hooks/useDashboard";

import { SubscriptionCard } from "@/features/subscriptions/components/SubscriptionCard";
import { CreateSubscriptionModal } from "@/features/subscriptions/components/CreateSubscriptionModal";
import { Button } from "@/components/ui/button";
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
import { Plus, MoreVertical, Edit, Trash2, Loader2 } from "lucide-react";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { UserNav } from "@/components/UserNav";
import { categoryStyles } from "@/features/subscriptions/config/categoryStyles";

export function DashboardPage() {
  const { stats, subscriptions, isLoading, uiState, actions } = useDashboard();

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
            <UserNav />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl p-4 sm:p-6">
        <div className="mb-8 space-y-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-foreground text-2xl font-bold">Dashboard</h2>
              <p className="text-muted-foreground">
                Manage your recurring expenses.
              </p>
            </div>
            <Button
              onClick={actions.openCreateModal}
              className="gap-2 border-0 bg-linear-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/30 transition-all duration-200 hover:scale-[1.02] hover:shadow-indigo-500/50 dark:from-indigo-500 dark:to-violet-500 dark:shadow-indigo-900/50"
            >
              <Plus className="h-4 w-4" /> Add Subscription
            </Button>
          </div>

          <DashboardStats stats={stats} isLoading={isLoading} />

          <DashboardToolbar
            searchQuery={uiState.searchQuery}
            onSearchChange={actions.setSearchQuery}
            categoryFilter={uiState.categoryFilter}
            onCategoryChange={actions.setCategoryFilter}
            sortOrder={uiState.sortOrder}
            onSortChange={actions.setSortOrder}
            viewMode={uiState.viewMode}
            onViewModeChange={actions.setViewMode}
            onCreateClick={actions.openCreateModal}
          />

          {isLoading && subscriptions.length === 0 ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="text-primary h-8 w-8 animate-spin" />
            </div>
          ) : subscriptions.length === 0 ? (
            <div className="animate-in fade-in-50 border-border bg-card flex min-h-100 flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-500/10">
                <Plus className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-foreground mt-6 text-xl font-semibold">
                {stats.totalMonthly === 0
                  ? "No subscriptions yet"
                  : "No results found"}
              </h3>
              <p className="text-muted-foreground mt-2 max-w-sm text-center">
                {stats.totalMonthly === 0
                  ? "Track your recurring expenses by adding your first subscription."
                  : "Try adjusting your search or filters to find what you're looking for."}
              </p>
              {stats.totalMonthly === 0 && (
                <Button
                  onClick={actions.openCreateModal}
                  className="mt-6 gap-2"
                >
                  <Plus className="h-4 w-4" /> Add your first subscription
                </Button>
              )}
            </div>
          ) : uiState.viewMode === "grid" ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {subscriptions.map((sub) => (
                <SubscriptionCard
                  key={sub.id}
                  subscription={sub}
                  onEdit={actions.openEditModal}
                  onDelete={actions.requestDelete}
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
                  {subscriptions.map((sub) => (
                    <TableRow key={sub.id} className="hover:bg-muted/50">
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
                      <TableCell className="hidden md:table-cell">
                        <Badge
                          variant="outline"
                          className={`border text-[10px] font-semibold tracking-wider uppercase ${categoryStyles[sub.category]}`}
                        >
                          {sub.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-foreground text-right font-semibold md:text-left">
                        {formatCurrency(sub.price, sub.currency)}
                      </TableCell>
                      <TableCell className="text-muted-foreground hidden capitalize md:table-cell">
                        {sub.frequency.toLowerCase()}
                      </TableCell>
                      <TableCell className="text-muted-foreground hidden md:table-cell">
                        {formatDate(sub.startDate)}
                      </TableCell>
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
                              onClick={() => actions.openEditModal(sub)}
                            >
                              <Edit className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => actions.requestDelete(sub.id)}
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
        isOpen={uiState.isModalOpen}
        onClose={actions.closeModal}
        onSuccess={actions.closeModal}
        subscriptionToEdit={uiState.editingSubscription}
      />

      <AlertDialog
        open={uiState.deleteDialogOpen}
        onOpenChange={actions.setDeleteDialogOpen}
      >
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
              disabled={uiState.isDeleting}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                actions.confirmDelete();
              }}
              disabled={uiState.isDeleting}
              className="cursor-pointer bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
            >
              {uiState.isDeleting ? (
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
