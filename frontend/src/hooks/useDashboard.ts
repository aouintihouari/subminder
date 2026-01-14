import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { subscriptionService } from "@/features/subscriptions/services/subscription.service";
import { type Subscription } from "@/features/subscriptions/types/types";
import { type DashboardStatsData } from "../features/dashboard/components/DashboardStats";

const QUERY_KEYS = {
  allSubscriptions: ["subscriptions"],
  stats: ["dashboard-stats"],
};

export function useDashboard() {
  const queryClient = useQueryClient();

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

  const {
    data: subscriptions = [],
    isLoading: isLoadingSubs,
    isError: isSubsError,
    error: subsError,
  } = useQuery({
    queryKey: QUERY_KEYS.allSubscriptions,
    queryFn: async () => {
      const res = await subscriptionService.getAll();
      return res.data?.subscriptions || [];
    },
  });

  const {
    data: stats = {
      totalMonthly: 0,
      totalYearly: 0,
      activeCount: 0,
      categoryCount: 0,
      mostExpensive: null,
    } as DashboardStatsData,
    isLoading: isLoadingStats,
    isError: isStatsError,
    error: statsError,
  } = useQuery({
    queryKey: QUERY_KEYS.stats,
    queryFn: async () => {
      const res = await subscriptionService.getStats();
      return res.data || {};
    },
  });

  const isLoading = isLoadingSubs || isLoadingStats;

  useEffect(() => {
    if (isSubsError) {
      toast.error(
        subsError instanceof Error
          ? subsError.message
          : "Failed to load subscriptions",
      );
    }
    if (isStatsError) {
      toast.error(
        statsError instanceof Error
          ? statsError.message
          : "Failed to load dashboard stats",
      );
    }
  }, [isSubsError, subsError, isStatsError, statsError]);

  const deleteMutation = useMutation({
    mutationFn: (id: number) => subscriptionService.delete(id),
    onSuccess: () => {
      toast.success("Subscription deleted");
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.allSubscriptions });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.stats });
      setDeleteDialogOpen(false);
      setSubToDelete(null);
    },
    onError: () => {
      toast.error("Failed to delete subscription");
    },
  });

  const filteredSubscriptions = useMemo(() => {
    return subscriptions
      .filter((sub: Subscription) => {
        const matchesSearch = sub.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
        const matchesCategory =
          categoryFilter === "ALL" || sub.category === categoryFilter;
        return matchesSearch && matchesCategory;
      })
      .sort((a: Subscription, b: Subscription) => {
        const priceA = a.convertedPrice ?? a.price;
        const priceB = b.convertedPrice ?? b.price;

        return sortOrder === "desc" ? priceB - priceA : priceA - priceB;
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
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.allSubscriptions });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.stats });
  };

  const requestDelete = (id: number) => {
    setSubToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (subToDelete) {
      deleteMutation.mutate(subToDelete);
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
      isDeleting: deleteMutation.isPending,
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
