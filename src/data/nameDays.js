/** @typedef {import('../types.js').NameDayEntry} NameDayEntry */

import { january } from './january.js';
import { february } from './february.js';
import { march } from './march.js';
import { april } from './april.js';
import { may } from './may.js';
import { june } from './june.js';
import { july } from './july.js';
import { august } from './august.js';
import { september } from './september.js';
import { october } from './october.js';
import { november } from './november.js';
import { december } from './december.js';
import { getMoveableEntries } from '../moveable.js';

/** All fixed-date entries (no year dependency). */
const fixedEntries = [
  ...january, ...february, ...march, ...april,
  ...may, ...june, ...july, ...august,
  ...september, ...october, ...november, ...december,
];

/**
 * @typedef {Object} NameDayIndex
 * @property {Map<string, NameDayEntry[]>} byName - lowercase name → entries
 * @property {Map<string, NameDayEntry[]>} byDate - "MM-DD" → entries
 * @property {Map<string, NameDayEntry[]>} byHoliday - lowercase holiday → entries
 * @property {number} year - year this index was built for
 */

/** @type {Map<number, NameDayIndex>} */
const indexCache = new Map();

/**
 * Pad a number to 2 digits.
 * @param {number} n
 * @returns {string}
 */
function pad(n) {
  return String(n).padStart(2, '0');
}

/**
 * Build name/date/holiday indexes for a given year.
 * Moveable entries are resolved for that year.
 * @param {NameDayEntry[]} entries
 * @param {number} year
 * @returns {NameDayIndex}
 */
function buildIndex(entries, year) {
  /** @type {Map<string, NameDayEntry[]>} */
  const byName = new Map();
  /** @type {Map<string, NameDayEntry[]>} */
  const byDate = new Map();
  /** @type {Map<string, NameDayEntry[]>} */
  const byHoliday = new Map();

  for (const entry of entries) {
    // Index by primary name (lowercase)
    const primaryKey = entry.name.toLowerCase();
    if (!byName.has(primaryKey)) byName.set(primaryKey, []);
    byName.get(primaryKey).push(entry);

    // Index by each variant (lowercase)
    for (const variant of entry.variants) {
      const variantKey = variant.toLowerCase();
      if (!byName.has(variantKey)) byName.set(variantKey, []);
      byName.get(variantKey).push(entry);
    }

    // Index by each latin name (lowercase)
    for (const latin of entry.latin) {
      const latinKey = latin.toLowerCase();
      if (!byName.has(latinKey)) byName.set(latinKey, []);
      byName.get(latinKey).push(entry);
    }

    // Index by date "MM-DD"
    const dateKey = `${pad(entry.month)}-${pad(entry.day)}`;
    if (!byDate.has(dateKey)) byDate.set(dateKey, []);
    byDate.get(dateKey).push(entry);

    // Index by holiday (lowercase)
    const holidayKey = entry.holiday.toLowerCase();
    if (!byHoliday.has(holidayKey)) byHoliday.set(holidayKey, []);
    byHoliday.get(holidayKey).push(entry);
  }

  return { byName, byDate, byHoliday, year };
}

/**
 * Get the index for a given year. Uses cache for performance.
 * @param {number} [year] - defaults to current year
 * @returns {NameDayIndex}
 */
export function getIndex(year) {
  const y = year ?? new Date().getFullYear();

  if (indexCache.has(y)) {
    return /** @type {NameDayIndex} */ (indexCache.get(y));
  }

  const moveableEntries = getMoveableEntries(y);
  const allEntries = [...fixedEntries, ...moveableEntries];
  const index = buildIndex(allEntries, y);

  indexCache.set(y, index);
  return index;
}

/**
 * Get all fixed-date entries (no moveable).
 * Returns a shallow copy.
 * @returns {NameDayEntry[]}
 */
export function getAllFixed() {
  return [...fixedEntries];
}

/**
 * Get all entries for a given year (fixed + resolved moveable).
 * Returns a shallow copy.
 * @param {number} [year] - defaults to current year
 * @returns {NameDayEntry[]}
 */
export function getAllEntries(year) {
  const y = year ?? new Date().getFullYear();
  const moveableEntries = getMoveableEntries(y);
  return [...fixedEntries, ...moveableEntries];
}
