/** @typedef {import('./types.js').UpcomingNameDay} UpcomingNameDay */

import { getIndex } from './data/nameDays.js';

/**
 * Get upcoming name days within a given number of days.
 * Handles year boundaries (December → January).
 *
 * @param {number} days - Number of days to look ahead
 * @param {Date} [startDate] - Start date (default: today)
 * @returns {UpcomingNameDay[]} Sorted by date
 */
export function getUpcomingNameDays(days, startDate) {
  if (!days || typeof days !== 'number' || days < 1) return [];

  const start = startDate instanceof Date && !Number.isNaN(startDate.getTime())
    ? startDate
    : new Date();

  /** @type {UpcomingNameDay[]} */
  const results = [];

  for (let i = 0; i < days; i++) {
    const current = new Date(start);
    current.setDate(current.getDate() + i);

    const month = current.getMonth() + 1;
    const day = current.getDate();
    const year = current.getFullYear();
    const dateKey = `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    const idx = getIndex(year);
    const entries = idx.byDate.get(dateKey);

    if (!entries || entries.length === 0) continue;

    // Collect all names for this date, grouped by holiday
    /** @type {Map<string, {holiday: string, names: string[]}>} */
    const byHoliday = new Map();

    for (const entry of entries) {
      const key = entry.holiday;
      if (!byHoliday.has(key)) {
        byHoliday.set(key, { holiday: entry.holiday, names: [] });
      }
      const group = byHoliday.get(key);
      group.names.push(entry.name);
      for (const variant of entry.variants) {
        group.names.push(variant);
      }
    }

    for (const group of byHoliday.values()) {
      results.push({
        month,
        day,
        holiday: group.holiday,
        names: [...new Set(group.names)],
      });
    }
  }

  return results;
}
