import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines class names using clsx and tailwind-merge utilities.
 *
 * @param inputs - Array of class values to be merged
 * @returns A string of merged class names
 *
 * @example
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
