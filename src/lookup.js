/** @typedef {import('./types.js').NameDayEntry} NameDayEntry */
/** @typedef {import('./types.js').NameDayResult} NameDayResult */

import { getIndex, getAllEntries } from './data/nameDays.js';
import { normalize, formatDate, extractYear } from './normalize.js';

/**
 * Convert a NameDayEntry to a NameDayResult (public API shape).
 * Returns a new object — never mutates the original.
 * @param {NameDayEntry} entry
 * @returns {NameDayResult}
 */
function toResult(entry) {
  return {
    name: entry.name,
    month: entry.month,
    day: entry.day,
    holiday: entry.holiday,
    holidayLatin: entry.holidayLatin,
    tradition: entry.tradition,
    variants: [...entry.variants],
    isMoveable: entry.moveable !== null,
  };
}

/**
 * Look up name day(s) for a given name.
 * Searches primary names, variants, and Latin transliterations.
 * Case-insensitive.
 *
 * @param {string} name - Name to look up (Cyrillic or Latin)
 * @param {number} [year] - Year for moveable dates (default: current year)
 * @returns {NameDayResult|NameDayResult[]|null} Single result, array if multiple dates, or null
 */
export function getNameDay(name, year) {
  if (!name || typeof name !== 'string') return null;

  const key = normalize(name);
  if (key.length === 0) return null;

  const y = year ?? new Date().getFullYear();
  const idx = getIndex(y);
  const entries = idx.byName.get(key);

  if (!entries || entries.length === 0) return null;

  // Deduplicate by name+month+day (same entry can appear via primary & variant)
  const seen = new Set();
  const results = [];
  for (const entry of entries) {
    const dedupeKey = `${entry.name}|${entry.month}-${entry.day}`;
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);
    results.push(toResult(entry));
  }

  if (results.length === 1) return results[0];
  return results;
}

/**
 * Get all names celebrating on a specific date.
 * @param {string|Date} date - "MM-DD" string or Date object
 * @param {number} [year] - Year for moveable dates (only used if date is "MM-DD" string)
 * @returns {string[]} Array of all celebrating names (primary + variants)
 */
export function getNamesByDate(date, year) {
  if (!date) return [];

  const dateKey = formatDate(date);
  if (!dateKey) return [];

  const y = (date instanceof Date)
    ? date.getFullYear()
    : (year ?? new Date().getFullYear());

  const idx = getIndex(y);
  const entries = idx.byDate.get(dateKey);

  if (!entries || entries.length === 0) return [];

  const names = [];
  for (const entry of entries) {
    names.push(entry.name);
    for (const variant of entry.variants) {
      names.push(variant);
    }
  }

  return names;
}

/**
 * Check if a given name has its name day on a specific date.
 * @param {string} name - Name to check (Cyrillic or Latin)
 * @param {Date} date - Date to check
 * @returns {boolean}
 */
export function isNameDay(name, date) {
  if (!name || typeof name !== 'string' || !(date instanceof Date)) return false;
  if (Number.isNaN(date.getTime())) return false;

  const key = normalize(name);
  if (key.length === 0) return false;

  const year = date.getFullYear();
  const idx = getIndex(year);
  const entries = idx.byName.get(key);

  if (!entries || entries.length === 0) return false;

  const targetMonth = date.getMonth() + 1;
  const targetDay = date.getDate();

  return entries.some((e) => e.month === targetMonth && e.day === targetDay);
}

/**
 * Get all name day entries (fixed + moveable resolved for the given year).
 * Returns a deep copy — safe to mutate.
 * @param {number} [year] - Year for moveable dates (default: current year)
 * @returns {NameDayResult[]}
 */
export function getAllNameDays(year) {
  const y = year ?? new Date().getFullYear();
  const entries = getAllEntries(y);
  return entries.map(toResult);
}

/**
 * Get names celebrating today.
 * @returns {string[]}
 */
export function getTodayNames() {
  const today = new Date();
  return getNamesByDate(today);
}
