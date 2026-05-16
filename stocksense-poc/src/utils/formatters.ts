// Utility functions for formatting numbers, currency, volume, and dates
// Ported from StockSense.html

/**
 * Format number with K/M suffixes
 * @param n - Number to format
 * @returns Formatted string (e.g., "1.2K", "2.5M")
 */
export const fmt = (n: number): string => {
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return n.toLocaleString();
};

/**
 * Format currency in GBP with K/M suffixes
 * @param v - Value to format
 * @returns Formatted string (e.g., "£1.2K", "£2.5M")
 */
export const fmtGBP = (v: number | null | undefined): string => {
  if (v == null || isNaN(v)) return '—';
  if (v >= 1e6) return '£' + (v / 1e6).toFixed(2) + 'M';
  if (v >= 1e3) return '£' + (v / 1e3).toFixed(1) + 'K';
  return '£' + v.toFixed(2);
};

/**
 * Format volume in cubic meters
 * @param v - Volume value
 * @returns Formatted string (e.g., "1.23 m³", "1.2K m³")
 */
export const fmtVol = (v: number | null | undefined): string => {
  if (v == null) return '—';
  if (v >= 1000) return (v / 1000).toFixed(1) + 'K';
  if (v >= 1) return v.toFixed(2);
  return v.toFixed(4);
};

/**
 * Format date in UK format
 * @param d - Date object
 * @returns Formatted string (e.g., "16 May 2026")
 */
export const fmtDate = (d: Date): string => {
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

/**
 * Format number with locale-aware thousands separators
 * @param n - Number to format
 * @returns Formatted string (e.g., "1,234")
 */
export const fmtNumber = (n: number): string => {
  return Math.round(n).toLocaleString('en-GB');
};

/**
 * Format percentage
 * @param v - Value between 0 and 1
 * @returns Formatted string (e.g., "45.2%")
 */
export const fmtPercent = (v: number): string => {
  return (v * 100).toFixed(1) + '%';
};

// Made with Bob
