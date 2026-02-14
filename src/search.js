/** @typedef {import('./types.js').SearchResult} SearchResult */

import { getIndex } from './data/nameDays.js';
import { normalize } from './normalize.js';

/**
 * Search names by prefix. Searches primary names, variants, and Latin transliterations.
 * Case-insensitive. Returns unique SearchResult objects.
 *
 * @param {string} prefix - Prefix to search for (Cyrillic or Latin)
 * @param {number} [year] - Year for moveable dates (default: current year)
 * @returns {SearchResult[]}
 */
export function searchNames(prefix, year) {
  if (!prefix || typeof prefix !== 'string') return [];

  const key = normalize(prefix);
  if (key.length === 0) return [];

  const y = year ?? new Date().getFullYear();
  const idx = getIndex(y);

  /** @type {Map<string, SearchResult>} */
  const resultMap = new Map();

  for (const [nameKey, entries] of idx.byName) {
    if (!nameKey.startsWith(key)) continue;

    for (const entry of entries) {
      const dateStr = `${String(entry.month).padStart(2, '0')}-${String(entry.day).padStart(2, '0')}`;
      const resultKey = `${entry.name}|${dateStr}`;

      if (!resultMap.has(resultKey)) {
        resultMap.set(resultKey, {
          name: entry.name,
          date: dateStr,
          holiday: entry.holiday,
        });
      }
    }
  }

  return [...resultMap.values()];
}

/**
 * Get all names celebrating a specific holiday.
 * Case-insensitive partial match.
 *
 * @param {string} holidayName - Holiday name to search for (Cyrillic or Latin)
 * @param {number} [year] - Year for moveable dates (default: current year)
 * @returns {string[]} Array of all celebrating names (primary + variants)
 */
export function getNamesByHoliday(holidayName, year) {
  if (!holidayName || typeof holidayName !== 'string') return [];

  const key = normalize(holidayName);
  if (key.length === 0) return [];

  const y = year ?? new Date().getFullYear();
  const idx = getIndex(y);

  const names = [];

  for (const [holidayKey, entries] of idx.byHoliday) {
    if (!holidayKey.includes(key)) continue;

    for (const entry of entries) {
      names.push(entry.name);
      for (const variant of entry.variants) {
        names.push(variant);
      }
    }
  }

  // Deduplicate while preserving order
  return [...new Set(names)];
}
