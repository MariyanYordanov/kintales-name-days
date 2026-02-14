/**
 * @typedef {Object} NameDayEntry
 * @property {string} name - Primary name (canonical form, Cyrillic)
 * @property {string[]} variants - Variant forms, diminutives, female forms
 * @property {string[]} latin - Latin transliterations of name + variants
 * @property {number} month - Month (1-12), 0 for moveable dates
 * @property {number} day - Day (1-31), 0 for moveable dates
 * @property {string} holiday - Holiday name in Bulgarian
 * @property {string} holidayLatin - Holiday name in Latin transliteration
 * @property {'orthodox'|'folk'|'both'} tradition - Tradition source
 * @property {string|null} moveable - null for fixed dates, offset string for moveable (e.g. "easter", "easter-7", "easter+39")
 */

/**
 * @typedef {Object} NameDayResult
 * @property {string} name - Primary name (Cyrillic)
 * @property {number} month - Month (1-12)
 * @property {number} day - Day (1-31)
 * @property {string} holiday - Holiday name in Bulgarian
 * @property {string} holidayLatin - Holiday name in Latin transliteration
 * @property {'orthodox'|'folk'|'both'} tradition - Tradition source
 * @property {string[]} variants - All variant forms
 * @property {boolean} isMoveable - Whether this is a moveable feast date
 */

/**
 * @typedef {Object} MoveableHoliday
 * @property {string} id - Unique identifier (e.g. "easter", "tsvetnitsa")
 * @property {string} holiday - Holiday name in Bulgarian
 * @property {string} holidayLatin - Holiday name in Latin transliteration
 * @property {number} offsetFromEaster - Days offset from Easter (negative = before, positive = after, 0 = Easter itself)
 * @property {'orthodox'|'folk'|'both'} tradition - Tradition source
 * @property {MoveableNameEntry[]} entries - Name entries for this holiday
 */

/**
 * @typedef {Object} MoveableNameEntry
 * @property {string} name - Primary name (Cyrillic)
 * @property {string[]} variants - Variant forms
 * @property {string[]} latin - Latin transliterations
 */

/**
 * @typedef {Object} UpcomingNameDay
 * @property {number} month - Month (1-12)
 * @property {number} day - Day (1-31)
 * @property {string} holiday - Holiday name in Bulgarian
 * @property {string[]} names - All celebrating names (primary + variants)
 */

/**
 * @typedef {Object} SearchResult
 * @property {string} name - Name found (Cyrillic)
 * @property {string} date - Date string "MM-DD"
 * @property {string} holiday - Holiday name
 */

export {};
