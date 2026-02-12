# CLAUDE.md — @kintales/name-days

> Bulgarian name days calendar library. Pure JavaScript, zero dependencies.
> Published as an independent npm package under MIT license.
> This is a SEPARATE project — it has no dependency on KinTales or React Native.

---

## WHO YOU ARE

You are a **data engineer and library architect** building a clean, well-tested, well-documented npm package. Your priorities:

1. **Data accuracy** — name day dates must be correct. Cross-reference multiple Bulgarian sources.
2. **Complete coverage** — include name variants, diminutives, and less common names.
3. **Clean API** — simple functions, no side effects, no state, no async.
4. **Zero dependencies** — this is a pure data + utility library.
5. **Good documentation** — examples in both Bulgarian and English.

---

## WHAT THIS LIBRARY DOES

`@kintales/name-days` provides a programmatic interface to the Bulgarian name day calendar (именни дни). It maps Bulgarian given names to their corresponding dates and Orthodox holidays.

### Use Cases
- KinTales: show "Today is Georgi's name day — Гергьовден" on the dashboard
- Calendar apps: highlight name days
- Greeting card apps: remind users to wish happy name day
- Any Bulgarian app that needs name day data

### Features
- Look up name day by name: `getNameDay('Георги')` → `{ month: 5, day: 6, holiday: 'Гергьовден' }`
- Look up names by date: `getNamesByDate(5, 6)` → `['Георги', 'Гергана', 'Герго', ...]`
- Check if today is someone's name day: `isNameDay('Георги', new Date())`
- Get all names for a holiday: `getNamesByHoliday('Гергьовден')`
- Get upcoming name days: `getUpcomingNameDays(7)` → next 7 days
- Case-insensitive and accent-insensitive matching
- Supports both Cyrillic (`Георги`) and Latin transliteration (`Georgi`)
- 500+ names with variants and diminutives

---

## API

```javascript
import {
  getNameDay,
  getNamesByDate,
  isNameDay,
  getNamesByHoliday,
  getUpcomingNameDays,
  getAllNameDays,
  searchNames,
} from '@kintales/name-days';

// ── Look up by name ──────────────────────────────────────────
getNameDay('Георги');
// → {
//     name: 'Георги',
//     month: 5,
//     day: 6,
//     holiday: 'Гергьовден',
//     tradition: 'orthodox',
//     variants: ['Гергана', 'Герго', 'Жоро', 'Гошо', 'Гергина', 'Ганка']
//   }

getNameDay('Georgi');  // Latin transliteration works too
// → same result

getNameDay('жоро');  // Case-insensitive, finds via variants
// → same result (finds parent name Георги)

getNameDay('Непознато');
// → null (name not found)

// Names with multiple name days (rare)
getNameDay('Атанас');
// → [
//     { name: 'Атанас', month: 1, day: 18, holiday: 'Атанасовден', ... },
//     { name: 'Атанас', month: 5, day: 2, holiday: 'Св. Атанасий Велики', ... }
//   ]
// Note: returns array when multiple dates exist

// ── Look up by date ──────────────────────────────────────────
getNamesByDate(5, 6);  // May 6
// → ['Георги', 'Гергана', 'Герго', 'Жоро', 'Гошо', 'Гергина', 'Ганка', 'Борис', ...]

getNamesByDate(12, 25);  // December 25
// → [] (Christmas — no traditional name day on this date, or specific names if applicable)

// ── Check specific date ──────────────────────────────────────
isNameDay('Георги', new Date('2026-05-06'));
// → true

isNameDay('Георги', new Date('2026-05-07'));
// → false

// ── Look up by holiday ───────────────────────────────────────
getNamesByHoliday('Гергьовден');
// → ['Георги', 'Гергана', 'Герго', 'Жоро', 'Гошо', 'Гергина', 'Ганка', 'Борис']

// ── Upcoming name days ───────────────────────────────────────
getUpcomingNameDays(7);  // Next 7 days from today
// → [
//     { month: 2, day: 14, holiday: 'Св. Валентин / Трифон Зарезан', names: ['Валентин', 'Валентина', 'Трифон'] },
//     { month: 2, day: 17, holiday: '...', names: [...] },
//     ...
//   ]

getUpcomingNameDays(7, new Date('2026-05-01'));  // Custom start date
// → [{ month: 5, day: 2, ... }, { month: 5, day: 6, ... }, ...]

// ── Search names ─────────────────────────────────────────────
searchNames('Гер');
// → ['Георги', 'Гергана', 'Герго', 'Гергина', 'Герасим']

searchNames('Mar');  // Latin prefix search
// → ['Мария', 'Марин', 'Марина', 'Маргарита', 'Марко']

// ── Full dataset ─────────────────────────────────────────────
getAllNameDays();
// → Array of all entries (for bulk import / seeding database)
// → [{ name: 'Васил', month: 1, day: 1, holiday: 'Васильовден', variants: [...] }, ...]
```

---

## DATA STRUCTURE

```javascript
// Internal data format (src/data/nameDays.js)
const nameDays = [
  {
    name: 'Васил',              // Primary name (canonical form)
    variants: ['Василка', 'Васко', 'Ваня', 'Васа'],  // All variant forms
    latin: ['Vasil', 'Vasilka', 'Vasko', 'Vanya'],    // Latin transliterations
    month: 1,
    day: 1,
    holiday: 'Васильовден',      // Holiday name in Bulgarian
    holidayLatin: 'Vasilyovden', // Latin transliteration
    tradition: 'orthodox',       // orthodox | folk | both
  },
  {
    name: 'Йордан',
    variants: ['Йорданка', 'Данчо', 'Данка', 'Данко'],
    latin: ['Yordan', 'Yordanka', 'Dancho', 'Danka'],
    month: 1,
    day: 6,
    holiday: 'Йорданов ден / Богоявление',
    holidayLatin: 'Yordanovden / Bogoyavlenie',
    tradition: 'orthodox',
  },
  // ... 500+ entries
];
```

---

## DATA SOURCES & ACCURACY

Name day data must be cross-referenced from multiple sources:

1. **Bulgarian Orthodox Church calendar** — authoritative for Orthodox name days
2. **imeniden.com** — comprehensive Bulgarian name day reference
3. **Wikipedia: Именни дни в България** — good starting point
4. **bg-patriarshia.bg** — Patriarch's official calendar
5. **Folk tradition sources** — some name days come from folk traditions, not church

Rules for data accuracy:
- When sources conflict, prefer the Bulgarian Orthodox Church calendar
- Include BOTH Orthodox and folk tradition dates when they differ
- Mark `tradition: 'orthodox'` or `tradition: 'folk'` or `tradition: 'both'`
- Some names have TWO name days (e.g., Атанас: Jan 18 AND May 2) — include both
- Include diminutives (Гошо → Георги, Пешо → Петър) as variants
- Include female variants (Георги → Гергана, Петър → Петра)

---

## PRIORITY NAMES

### Tier 1: Must-have (most common Bulgarian names, ~100)
Георги, Иван, Димитър, Петър, Николай, Стоян, Тодор, Христо, Мария, Елена, Йорданка, Стефан, Васил, Атанас, Михаил, Ангел, Борис, Александър, Калоян, Красимир, Пламен, Валентин, Емил, Живко, Йордан, Кирил, Методий, Никола, Симеон, Филип, Лъчезар, Божидар, Владимир, Светослав, Радослав, Ивана, Десислава, Силвия, Даниела, Мариана, Калина, Росица, Цветана, Надежда, Вяра, Любов, Павел, Андрей, Антон...

### Tier 2: Important (~200 more)
Less common but still active names, older/traditional names, regional names.

### Tier 3: Complete (~200+ more)
Rare names, archaic names, full diminutive coverage.

---

## PROJECT STRUCTURE

```
kintales-name-days/
├── src/
│   ├── index.js                  # Public API exports
│   ├── lookup.js                 # getNameDay, getNamesByDate, isNameDay
│   ├── search.js                 # searchNames, getNamesByHoliday
│   ├── upcoming.js               # getUpcomingNameDays
│   ├── normalize.js              # Case/accent normalization, Cyrillic↔Latin matching
│   ├── data/
│   │   ├── nameDays.js           # Full dataset (~500 entries)
│   │   ├── january.js            # Split by month for maintainability
│   │   ├── february.js
│   │   ├── march.js
│   │   ├── april.js
│   │   ├── may.js
│   │   ├── june.js
│   │   ├── july.js
│   │   ├── august.js
│   │   ├── september.js
│   │   ├── october.js
│   │   ├── november.js
│   │   └── december.js
│   └── types.js                  # JSDoc type definitions
├── __tests__/
│   ├── lookup.test.js            # getNameDay, getNamesByDate, isNameDay
│   ├── search.test.js            # searchNames, getNamesByHoliday
│   ├── upcoming.test.js          # getUpcomingNameDays
│   ├── normalize.test.js         # Cyrillic/Latin matching
│   ├── data.test.js              # Data integrity: no duplicates, valid dates, all months covered
│   └── edgeCases.test.js         # Unknown names, empty input, null, Feb 29
├── scripts/
│   └── validateData.js           # Run: node scripts/validateData.js — checks data integrity
├── package.json
├── LICENSE                       # MIT
├── CHANGELOG.md
├── CLAUDE.md
└── README.md                    # npm README: installation, usage, full API, contribution guide
```

---

## DEVELOPMENT PHASES

### v0.1 — Core with Top 100 Names (1 week)

```
/plan "Build @kintales/name-days v0.1. 1) Create data structure for name days: name, variants, latin, month, day, holiday, tradition. 2) Populate January through December with the top 100 most common Bulgarian names — cross-reference imeniden.com, Wikipedia:Именни_дни_в_България, and Orthodox calendar. Include 3-5 variants per name. 3) Implement getNameDay(name) with case-insensitive Cyrillic matching and variant lookup. 4) Implement getNamesByDate(month, day). 5) Implement isNameDay(name, date). 6) Data integrity test: no duplicate entries, all dates valid (month 1-12, day 1-31, no Feb 30/31), every name has at least 1 variant, every entry has holiday name. TDD."
```
```
/tdd
/code-review
```
```bash
git commit -m "feat: v0.1 core API with top 100 Bulgarian names"
```

### v0.5 — 300+ Names, Latin Support, Search (1 week)

```
/plan "Expand to 300+ names. 1) Add Tier 2 names (~200 more entries) with variants and diminutives. 2) Add Latin transliterations for all names. 3) Implement normalize.js: case folding, Cyrillic↔Latin transliteration matching (Георги↔Georgi, Жоро↔Zhoro). 4) Implement searchNames(prefix) — prefix search across all names and variants, both Cyrillic and Latin. 5) Implement getNamesByHoliday(holidayName). 6) Implement getUpcomingNameDays(days, startDate). 7) Handle edge cases: names with multiple name days, February 29 name days in non-leap years, empty/null input. TDD."
```
```
/tdd
/code-review
```
```bash
git commit -m "feat: v0.5 expanded to 300+ names with Latin and search"
```

### v1.0 — Complete & Publish (1 week)

```
/plan "Finalize for publish. 1) Add Tier 3 names (total 500+). 2) Final data validation: run validateData.js script — check every entry has holiday, variants, latin, valid date. 3) Implement getAllNameDays() for bulk export. 4) Write comprehensive README: installation, all API functions with examples, contribution guide for adding names, data sources cited. 5) Write CHANGELOG. 6) Package.json: set up main/module/exports, add keywords (bulgarian, name-days, именни-дни, calendar). 7) npm publish as @kintales/name-days."
```
```
/code-review
```
```bash
git commit -m "feat: v1.0 complete with 500+ names, published to npm"
npm publish
```

---

## DATA VALIDATION RULES

The `validateData.js` script and `data.test.js` must verify:

- [ ] No duplicate name+date combinations
- [ ] All months between 1-12
- [ ] All days valid for their month (no Feb 30, no Apr 31)
- [ ] Every entry has: name (string, non-empty), month, day, holiday (string, non-empty)
- [ ] Every entry has at least 1 variant
- [ ] Every entry has latin transliteration
- [ ] No empty strings in variants array
- [ ] All 12 months have at least 5 entries
- [ ] Names are in proper Bulgarian capitalization (first letter uppercase)
- [ ] Latin transliterations match standard BGS transliteration rules
- [ ] No trailing/leading whitespace in any string field
- [ ] tradition is one of: 'orthodox', 'folk', 'both'

---

## TESTING

```bash
npm test                    # Run all tests
node scripts/validateData.js # Validate data integrity
```

Tests cover:
- Happy path: known names return correct dates
- Variants: diminutives map to primary name
- Latin: transliterations return correct results
- Case insensitivity: 'георги', 'ГЕОРГИ', 'Георги' all work
- Unknown names: return null, not throw
- Invalid input: null, undefined, empty string, numbers → return null
- Date edge cases: Feb 29, Dec 31, Jan 1
- Multiple name days: names with 2+ dates return array
- Upcoming: correctly wraps around year boundary (Dec 28 + 7 days includes Jan)

---

## CONTRIBUTION GUIDE (for README)

```markdown
## Contributing Names

Know a Bulgarian name that's missing? PRs welcome!

1. Find the correct month file in `src/data/` (e.g., `may.js` for May names)
2. Add your entry following this format:
   ```javascript
   {
     name: 'ИмеНаКирилица',
     variants: ['Вариант1', 'Вариант2', 'Умалително'],
     latin: ['NameInLatin', 'Variant1', 'Variant2'],
     month: 5,
     day: 6,
     holiday: 'Име на празника',
     holidayLatin: 'Holiday Name',
     tradition: 'orthodox',  // or 'folk' or 'both'
   }
   ```
3. Run `npm test` to verify data integrity
4. Submit PR with source reference (link to imeniden.com, church calendar, etc.)
```

---

## GIT & NPM

npm package name: `@kintales/name-days`
License: MIT
Keywords: bulgarian, name-days, именни-дни, calendar, orthodox, имен-ден
