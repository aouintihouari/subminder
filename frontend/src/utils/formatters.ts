export const formatCurrency = (
  amount: number,
  currencyCode: string = "EUR",
): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

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
