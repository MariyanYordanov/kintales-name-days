# bg-name-days

Bulgarian name days calendar library. Pure JavaScript, zero dependencies.
800+ names with variants, diminutives, Latin transliteration, and moveable Orthodox feast date computation.

## Installation

```bash
npm install bg-name-days
```

## Usage

```js
import {
  getNameDay,
  getNamesByDate,
  isNameDay,
  getTodayNames,
  searchNames,
  getNamesByHoliday,
  getUpcomingNameDays,
  getAllNameDays,
  transliterate,
  orthodoxEaster,
} from 'bg-name-days';
```

### Find name day by name

```js
getNameDay('Георги');
// {
//   name: 'Георги', month: 5, day: 6,
//   holiday: 'Гергьовден', holidayLatin: 'Gergyovden',
//   tradition: 'orthodox', variants: ['Георгина', 'Гергана', ...],
//   isMoveable: false
// }

getNameDay('Georgi');  // Latin input works too
getNameDay('гошо');    // Case-insensitive, finds via variants → Георги

getNameDay('Стефан');
// Returns array — Стефан has multiple name days (Jan 9 + Dec 27)

getNameDay('Непознато');
// null
```

### Get names by date

```js
getNamesByDate('05-06');
// ['Георги', 'Георгина', 'Гергана', 'Гошо', 'Жоро', ...]

getNamesByDate(new Date(2026, 0, 1));
// ['Васил', 'Василка', 'Василена', ...]
```

### Check if today is someone's name day

```js
isNameDay('Георги', new Date('2026-05-06'));  // true
isNameDay('Георги', new Date('2026-05-07'));  // false
isNameDay('Цветан', new Date('2026-04-05')); // true (Цветница 2026)
```

### Get today's celebrating names

```js
getTodayNames();
// ['Валентин', 'Валентина', 'Трифон', ...] (on Feb 14)
```

### Search names by prefix

```js
searchNames('Гео');
// [{ name: 'Георги', date: '05-06', holiday: 'Гергьовден' }]

searchNames('Geo');  // Latin prefix search works too
```

### Get names by holiday

```js
getNamesByHoliday('Гергьовден');
// ['Георги', 'Георгина', 'Гергана', 'Гошо', 'Жоро', ...]

getNamesByHoliday('Цветница');
// 100+ flower-related names (Цветан, Роза, Виолета, Маргарита, ...)
```

### Upcoming name days

```js
getUpcomingNameDays(7);
// [
//   { month: 2, day: 14, holiday: 'Трифон Зарезан', names: ['Трифон', ...] },
//   { month: 2, day: 17, holiday: '...', names: [...] },
//   ...
// ]

getUpcomingNameDays(7, new Date('2026-05-01'));  // Custom start date
```

### Transliterate

```js
transliterate('Георги');   // 'Georgi'
transliterate('Yordan');   // 'Йордан'
transliterate('Щерьо');    // 'Shteryo'
```

### Orthodox Easter

```js
orthodoxEaster(2026);  // Date: April 12, 2026
orthodoxEaster(2027);  // Date: May 2, 2027
```

### Get all name days

```js
const all = getAllNameDays(2026);
// Array of 263 NameDayResult objects (fixed + resolved moveable for the year)
```

## API Reference

| Function | Parameters | Returns | Description |
|---|---|---|---|
| `getNameDay(name, year?)` | `string, number?` | `NameDayResult \| NameDayResult[] \| null` | Find name day by name (Cyrillic or Latin) |
| `getNamesByDate(date, year?)` | `string \| Date, number?` | `string[]` | Get all celebrating names for a date |
| `isNameDay(name, date)` | `string, Date` | `boolean` | Check if a name celebrates on a date |
| `getTodayNames()` | - | `string[]` | Get names celebrating today |
| `searchNames(prefix, year?)` | `string, number?` | `SearchResult[]` | Search names by prefix |
| `getNamesByHoliday(name, year?)` | `string, number?` | `string[]` | Get all names for a holiday |
| `getUpcomingNameDays(days, start?)` | `number, Date?` | `UpcomingNameDay[]` | Get upcoming name days |
| `getAllNameDays(year?)` | `number?` | `NameDayResult[]` | Get full dataset |
| `transliterate(text)` | `string` | `string` | Auto-detect and transliterate (CYR↔LAT) |
| `orthodoxEaster(year)` | `number` | `Date` | Calculate Orthodox Easter date |

## Moveable Feasts

Seven Bulgarian name days are tied to moveable Orthodox feasts (based on Easter):

| Holiday | Offset | Example names |
|---|---|---|
| Тодоровден | Easter − 43 | Тодор, Теодор, Дора, Божидар |
| Лазаровден | Easter − 8 | Лазар, Лъчезар |
| Цветница | Easter − 7 | Цветан, Роза, Виолета, Маргарита, 100+ |
| Великден | Easter | Велика, Велико, Паскал |
| Спасовден | Easter + 39 | Спас, Спасена |
| Петдесетница | Easter + 49 | Трайко, Траян |
| Духов ден | Easter + 50 | Пламен |

The library automatically computes the correct dates for any year using the Gauss algorithm for Orthodox Easter.

## Transliteration

Follows the official Bulgarian transliteration law (2009):

| А | Б | В | Г | Д | Е | Ж | З | И | Й | К | Л | М | Н | О |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| A | B | V | G | D | E | Zh | Z | I | Y | K | L | M | N | O |

| П | Р | С | Т | У | Ф | Х | Ц | Ч | Ш | Щ | Ъ | Ь | Ю | Я |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| P | R | S | T | U | F | H | Ts | Ch | Sh | Sht | A | Y | Yu | Ya |

## Data Sources

- Bulgarian Orthodox Church calendar
- imeniden.com — comprehensive Bulgarian name day reference
- Wikipedia: Именни дни в България
- bg-patriarshia.bg — Patriarch's official calendar

## Contributing Names

Know a Bulgarian name that's missing? PRs welcome!

1. Find the correct month file in `src/data/` (e.g., `may.js` for May names)
2. Add your entry following the format in existing files
3. Run `npm test` to verify data integrity
4. Submit PR with source reference

## License

MIT
