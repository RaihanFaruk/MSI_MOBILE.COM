/**
 * Formats a number to Bangladeshi Taka format with ৳ symbol and commas (e.g. ৳189,999)
 */
export function formatBDT(amount: number): string {
  return `৳${amount.toLocaleString('en-IN')}`;
}
