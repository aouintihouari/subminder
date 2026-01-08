import { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "sonner";
import { subscriptionService } from "@/features/subscriptions/services/subscription.service";
import { type Subscription } from "@/features/subscriptions/types/types";
import { type DashboardStatsData } from "../features/dashboard/components/DashboardStats";

export function useDashboard() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [stats, setStats] = useState<DashboardStatsData>({
    totalMonthly: 0,
    totalYearly: 0,
    activeCount: 0,
    categoryCount: 0,
    mostExpensive: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<
    Subscription | undefined
  >(undefined);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [subToDelete, setSubToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      const [subsData, statsData] = await Promise.all([
        subscriptionService.getAll(),
        subscriptionService.getStats(),
      ]);

      if (subsData.status === "success" && subsData.data.subscriptions) {
        setSubscriptions(subsData.data.subscriptions);
      }

      if (statsData.status === "success" && statsData.data) {
        setStats(statsData.data);
      }
    } catch (error) {
      toast.error("Failed to load dashboard data");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

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

  const openCreateModal = () => {
    setEditingSubscription(undefined);
    setIsModalOpen(true);
  };

  const openEditModal = (sub: Subscription) => {
    setEditingSubscription(sub);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    fetchDashboardData();
  };

  const requestDelete = (id: number) => {
    setSubToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!subToDelete) return;
    setIsDeleting(true);
    try {
      await subscriptionService.delete(subToDelete);
      await fetchDashboardData();
      toast.success("Subscription deleted");
      setDeleteDialogOpen(false);
    } catch {
      toast.error("Failed to delete subscription");
    } finally {
      setIsDeleting(false);
      setSubToDelete(null);
    }
  };

  return {
    stats,
    subscriptions: filteredSubscriptions,
    isLoading,

    uiState: {
      viewMode,
      searchQuery,
      categoryFilter,
      sortOrder,
      isModalOpen,
      editingSubscription,
      deleteDialogOpen,
      isDeleting,
    },

    actions: {
      setViewMode,
      setSearchQuery,
      setCategoryFilter,
      setSortOrder,
      setDeleteDialogOpen,
      openCreateModal,
      openEditModal,
      closeModal,
      requestDelete,
      confirmDelete,
    },
  };
}
