export const formatCurrency = (
  amount: number,
  currencyCode: string,
): string => {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount} ${currencyCode}`;
  }
};

/**
 * Formats a date string into a standardized format (e.g., "Jan 1, 2023").
 *
 * @param dateString - The date string to format. Can be any valid date string format.
 * @returns The formatted date string in "en-US" locale format (day month year).
 *          Returns empty string if input is empty.
 *          Returns original string if input is not a valid date.
 */
/**
 * Formats a date string into a standardized format (e.g., "Jan 1, 2023").
 *
 * @param {string} dateString - The input date string to be formatted.
 * @returns {string} The formatted date string in "en-US" locale format.
 *                   Returns an empty string if input is empty.
 *                   Returns the original string if it's not a valid date.
 */
export const formatDate = (dateString: string): string => {
  if (!dateString) return "";
  const date = new Date(dateString);

  if (isNaN(date.getTime())) return dateString;

  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
};
