/**
 * Formats a number to Bangladeshi Taka format with ৳ symbol and commas (e.g. ৳189,999)
 * Safely handles null, undefined, NaN, or string values.
 */
export function formatBDT(amount?: number | string | null): string {
  if (amount === undefined || amount === null) {
    return "৳0";
  }
  const numericVal = typeof amount === "number" ? amount : parseFloat(String(amount));
  if (isNaN(numericVal)) {
    return "৳0";
  }
  return `৳${numericVal.toLocaleString("en-IN")}`;
}

