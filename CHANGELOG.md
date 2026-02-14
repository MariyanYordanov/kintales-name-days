# Changelog

## [2.0.0] - 2026-02-14

### Breaking Changes
- `getAllNameDays()` now returns `NameDayResult[]` (was `Record<string, {holiday, names[]}>`)
- `getNameDay()` returns `NameDayResult` with structured fields (was `{date, holiday, names}`)
- `getNamesByDate()` returns `string[]` (was `{date, holiday, names} | null`)
- Data structure changed from date-keyed object to name-centric entries with primary/variant distinction

### Added
- `isNameDay(name, date)` — check if a name celebrates on a specific date
- `getNamesByHoliday(holidayName)` — get all names for a holiday
- `getUpcomingNameDays(days, startDate?)` — get upcoming name days
- `orthodoxEaster(year)` — calculate Orthodox Easter date (Gauss algorithm)
- Moveable feast date computation — 7 holidays with dynamic date resolution:
  - Тодоровден, Лазаровден, Цветница, Великден, Спасовден, Петдесетница, Духов ден
- Year-aware API — all functions accept optional `year` parameter for moveable dates
- Pre-computed indexes (byName, byDate, byHoliday) for O(1) lookups
- Data split into 12 monthly files for maintainability
- Comprehensive data validation script (`npm run validate`)
- 146 tests across 7 test files
- JSDoc type definitions

### Changed
- Data restructured: each entry now has primary name + variants + latin transliterations
- 875 total names (263 entries: 211 fixed + 52 moveable)
- Removed non-Bulgarian names (Жан, Франциск, Себастиан, etc.)
- Removed surnames (Борисов, Великов, etc.)
- Fixed holiday name: "Еврейски ден" → "Свети Евтимий Велики"
- Fixed duplicate key "12-22" in original data

### Kept
- `transliterate()` — unchanged
- `getTodayNames()` — preserved
- Zero dependencies

## [1.0.0] - 2026-02-12

### Added
- Initial release with 500+ Bulgarian names
- `getNameDay()`, `getNamesByDate()`, `getTodayNames()`, `searchNames()`, `getAllNameDays()`
- Bidirectional Bulgarian transliteration (official law 2009)
- 23 tests
