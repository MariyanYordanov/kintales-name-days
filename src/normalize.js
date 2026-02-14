/** @typedef {import('./types.js').NameDayEntry} NameDayEntry */

/**
 * Normalize a string for case-insensitive matching.
 * Trims whitespace and lowercases.
 * @param {string} str
 * @returns {string}
 */
export function normalize(str) {
  if (!str || typeof str !== 'string') return '';
  return str.trim().toLowerCase();
}

/**
 * Format a Date or "MM-DD" string to "MM-DD".
 * @param {string|Date} date
 * @returns {string|null}
 */
export function formatDate(date) {
  if (!date) return null;

  if (typeof date === 'string') {
    // Validate "MM-DD" format
    if (/^\d{2}-\d{2}$/.test(date)) return date;
    // Try to parse as Date string
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return null;
    return pad(parsed.getMonth() + 1) + '-' + pad(parsed.getDate());
  }

  if (date instanceof Date) {
    if (Number.isNaN(date.getTime())) return null;
    return pad(date.getMonth() + 1) + '-' + pad(date.getDate());
  }

  return null;
}

/**
 * Extract year from a Date.
 * @param {string|Date} date
 * @returns {number}
 */
export function extractYear(date) {
  if (date instanceof Date) return date.getFullYear();
  if (typeof date === 'string') {
    const parsed = new Date(date);
    if (!Number.isNaN(parsed.getTime())) return parsed.getFullYear();
  }
  return new Date().getFullYear();
}

/**
 * Pad a number to 2 digits.
 * @param {number} n
 * @returns {string}
 */
function pad(n) {
  return String(n).padStart(2, '0');
}
