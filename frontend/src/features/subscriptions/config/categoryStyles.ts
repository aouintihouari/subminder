import { Category } from "../types/types";
import {
  Clapperboard,
  Activity,
  Briefcase,
  Utensils,
  Book,
  Zap,
  Box,
} from "lucide-react";

export const categoryStyles: Record<Category, string> = {
  [Category.ENTERTAINMENT]:
    "text-purple-600 bg-purple-50 border-purple-100 dark:bg-purple-500/10 dark:text-purple-300 dark:border-purple-500/20",
  [Category.LEARNING]:
    "text-blue-600 bg-blue-50 border-blue-100 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/20",
  [Category.UTILITIES]:
    "text-slate-600 bg-slate-50 border-slate-100 dark:bg-slate-800/50 dark:text-slate-300 dark:border-slate-700",
  [Category.WORK]:
    "text-gray-600 bg-gray-50 border-gray-100 dark:bg-gray-500/10 dark:text-gray-300 dark:border-gray-500/20",
  [Category.HEALTH]:
    "text-emerald-600 bg-emerald-50 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20",
  [Category.FOOD]:
    "text-orange-600 bg-orange-50 border-orange-100 dark:bg-orange-500/10 dark:text-orange-300 dark:border-orange-500/20",
  [Category.OTHER]:
    "text-pink-600 bg-pink-50 border-pink-100 dark:bg-pink-500/10 dark:text-pink-300 dark:border-pink-500/20",
};

export const accentStyles: Record<Category, string> = {
  [Category.ENTERTAINMENT]: "bg-purple-600 dark:bg-purple-500",
  [Category.LEARNING]: "bg-blue-600 dark:bg-blue-500",
  [Category.UTILITIES]: "bg-slate-600 dark:bg-slate-500",
  [Category.WORK]: "bg-gray-600 dark:bg-gray-500",
  [Category.HEALTH]: "bg-emerald-600 dark:bg-emerald-500",
  [Category.FOOD]: "bg-orange-600 dark:bg-orange-500",
  [Category.OTHER]: "bg-pink-600 dark:bg-pink-500",
};

export const categoryIcons: Record<Category, React.ElementType> = {
  [Category.ENTERTAINMENT]: Clapperboard,
  [Category.HEALTH]: Activity,
  [Category.WORK]: Briefcase,
  [Category.FOOD]: Utensils,
  [Category.LEARNING]: Book,
  [Category.UTILITIES]: Zap,
  [Category.OTHER]: Box,
};
