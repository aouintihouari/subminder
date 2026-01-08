import {
  Search,
  Filter,
  ArrowUpDown,
  LayoutGrid,
  List,
  Plus,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Category } from "@/features/subscriptions/types/types";

interface DashboardToolbarProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  categoryFilter: string;
  onCategoryChange: (val: string) => void;
  sortOrder: "asc" | "desc";
  onSortChange: (val: "asc" | "desc") => void;
  viewMode: "grid" | "list";
  onViewModeChange: (val: "grid" | "list") => void;
  onCreateClick: () => void;
}

export function DashboardToolbar({
  searchQuery,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  sortOrder,
  onSortChange,
  viewMode,
  onViewModeChange,
  onCreateClick,
}: DashboardToolbarProps) {
  // Mapping pour afficher les icônes de catégories si besoin,
  // sinon on garde le texte simple comme dans ton code original.

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      {/* 1. Barre de Recherche */}
      <div className="relative w-full sm:w-[320px]">
        <Search className="text-muted-foreground absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2" />
        <Input
          placeholder="Search..."
          className="dark:border-border dark:bg-card dark:text-foreground h-10 w-full rounded-xl border-gray-200 bg-white pl-10 shadow-sm outline-none focus-visible:border-indigo-500 focus-visible:ring-1 focus-visible:ring-indigo-500"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {/* 2. Filtres et Toggles */}
      <div className="flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row">
        {/* Filtre Catégorie */}
        <Select value={categoryFilter} onValueChange={onCategoryChange}>
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
            {Object.values(Category).map((cat) => (
              <SelectItem
                key={cat}
                value={cat}
                className="focus:bg-accent cursor-pointer rounded-lg py-2.5"
              >
                {cat.charAt(0) + cat.slice(1).toLowerCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Tri (Sort) */}
        <Select
          value={sortOrder}
          onValueChange={(val) => onSortChange(val as "asc" | "desc")}
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

        {/* Séparateur Vertical */}
        <div className="dark:bg-border hidden h-8 w-px bg-gray-200 sm:block"></div>

        {/* View Toggle (Grid/List) */}
        <div className="dark:border-border dark:bg-card flex h-10 items-center rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
          <button
            onClick={() => onViewModeChange("grid")}
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
            onClick={() => onViewModeChange("list")}
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

        {/* Bouton Ajouter (Mobile seulement, optionnel car déjà en haut) */}
        <Button onClick={onCreateClick} className="w-full sm:hidden">
          <Plus className="mr-2 h-4 w-4" /> Add
        </Button>
      </div>
    </div>
  );
}
