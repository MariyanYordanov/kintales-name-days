/** @typedef {import('./types.js').MoveableHoliday} MoveableHoliday */
/** @typedef {import('./types.js').NameDayEntry} NameDayEntry */

/**
 * Calculate Orthodox Easter (Pascha) date for a given year.
 * Uses the Gauss algorithm for Julian Easter + Julian-to-Gregorian correction.
 * Valid for years 1900-2099 (13-day offset).
 * @param {number} year
 * @returns {Date}
 */
export function orthodoxEaster(year) {
  const a = year % 19;
  const b = year % 4;
  const c = year % 7;
  const d = (19 * a + 15) % 30;
  const e = (2 * b + 4 * c + 6 * d + 6) % 7;

  // Julian calendar date in March
  const marchDay = d + e + 22;

  // Convert from Julian to Gregorian (add 13 days for 1900-2099)
  const julianOffset = 13;
  const date = new Date(year, 2, marchDay + julianOffset); // month 2 = March

  return date;
}

/**
 * Add days to a Date (returns new Date, does not mutate).
 * @param {Date} date
 * @param {number} days
 * @returns {Date}
 */
function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Calculate all moveable feast dates for a given year.
 * @param {number} year
 * @returns {Map<string, {month: number, day: number}>}
 */
export function getMoveableDates(year) {
  const easter = orthodoxEaster(year);
  const dates = new Map();

  for (const holiday of moveableHolidays) {
    const d = addDays(easter, holiday.offsetFromEaster);
    dates.set(holiday.id, { month: d.getMonth() + 1, day: d.getDate() });
  }

  return dates;
}

/**
 * Resolve a moveable entry to concrete month/day for a given year.
 * @param {NameDayEntry} entry
 * @param {number} year
 * @returns {{month: number, day: number}}
 */
export function resolveMoveableDate(entry, year) {
  if (!entry.moveable) return { month: entry.month, day: entry.day };

  const dates = getMoveableDates(year);
  const resolved = dates.get(entry.moveable);
  if (!resolved) return { month: entry.month, day: entry.day };

  return resolved;
}

/**
 * Build NameDayEntry objects for all moveable holidays, resolved for a given year.
 * @param {number} year
 * @returns {NameDayEntry[]}
 */
export function getMoveableEntries(year) {
  const dates = getMoveableDates(year);
  const entries = [];

  for (const holiday of moveableHolidays) {
    const resolved = dates.get(holiday.id);
    if (!resolved) continue;

    for (const nameEntry of holiday.entries) {
      entries.push({
        name: nameEntry.name,
        variants: [...nameEntry.variants],
        latin: [...nameEntry.latin],
        month: resolved.month,
        day: resolved.day,
        holiday: holiday.holiday,
        holidayLatin: holiday.holidayLatin,
        tradition: holiday.tradition,
        moveable: holiday.id,
      });
    }
  }

  return entries;
}

/** @type {MoveableHoliday[]} */
export const moveableHolidays = [
  {
    id: "todorovden",
    holiday: "Тодоровден (Конски Великден)",
    holidayLatin: "Todorovden (Konski Velikden)",
    offsetFromEaster: -43,
    tradition: "orthodox",
    entries: [
      { name: "Тодор", variants: ["Тодорка", "Тодорин", "Тошо", "Тотьо", "Тото", "Тода"], latin: ["Todor", "Todorka", "Todorin", "Tosho", "Totyo", "Toto", "Toda"] },
      { name: "Теодор", variants: ["Теодора", "Теди", "Теодоси", "Теодосий", "Теодосия"], latin: ["Teodor", "Teodora", "Tedi", "Teodosi", "Teodosiy", "Teodosiya"] },
      { name: "Дора", variants: ["Дорка", "Дориана", "Доротея", "Доротей"], latin: ["Dora", "Dorka", "Doriana", "Doroteya", "Dorotey"] },
      { name: "Божидар", variants: ["Божидара", "Божана", "Божан", "Божил", "Божко"], latin: ["Bozhidar", "Bozhidara", "Bozhana", "Bozhan", "Bozhil", "Bozhko"] },
      { name: "Дарин", variants: ["Дарина", "Дарко", "Дарка", "Дария", "Дариян", "Дарислав", "Дарислава"], latin: ["Darin", "Darina", "Darko", "Darka", "Dariya", "Dariyan", "Darislav", "Darislava"] },
    ],
  },
  {
    id: "lazarovden",
    holiday: "Лазаровден",
    holidayLatin: "Lazarovden",
    offsetFromEaster: -8,
    tradition: "orthodox",
    entries: [
      { name: "Лазар", variants: ["Лазарка", "Лазарина", "Лазо"], latin: ["Lazar", "Lazarka", "Lazarina", "Lazo"] },
      { name: "Лъчезар", variants: ["Лъчезара"], latin: ["Lachezar", "Lachezara"] },
    ],
  },
  {
    id: "tsvetnitsa",
    holiday: "Цветница (Връбница)",
    holidayLatin: "Tsvetnitsa (Vrabnitsa)",
    offsetFromEaster: -7,
    tradition: "orthodox",
    entries: [
      { name: "Цветан", variants: ["Цветана", "Цветанка", "Цвете", "Цветин", "Цветина", "Цветка", "Цвятко", "Цено"], latin: ["Tsvetan", "Tsvetana", "Tsvetanka", "Tsvete", "Tsvetin", "Tsvetina", "Tsvetka", "Tsvyatko", "Tseno"] },
      { name: "Цветелин", variants: ["Цветелина"], latin: ["Tsvetelin", "Tsvetelina"] },
      { name: "Цветомир", variants: ["Цветомира", "Цветомила", "Цветослав", "Цветослава", "Цветимир"], latin: ["Tsvetomir", "Tsvetomira", "Tsvetomila", "Tsvetoslav", "Tsvetoslava", "Tsvetimir"] },
      { name: "Виолета", variants: ["Виола"], latin: ["Violeta", "Viola"] },
      { name: "Роза", variants: ["Розалия", "Розалина", "Ружа"], latin: ["Roza", "Rozaliya", "Rozalina", "Ruzha"] },
      { name: "Маргарита", variants: ["Маргарет"], latin: ["Margarita", "Margaret"] },
      { name: "Невен", variants: ["Невена", "Невян", "Невяна", "Ненка"], latin: ["Neven", "Nevena", "Nevyan", "Nevyana", "Nenka"] },
      { name: "Росен", variants: ["Росица", "Росина"], latin: ["Rosen", "Rositsa", "Rosina"] },
      { name: "Камелия", variants: [], latin: ["Kameliya"] },
      { name: "Лилия", variants: ["Лиляна", "Лила", "Лили"], latin: ["Liliya", "Lilyana", "Lila", "Lili"] },
      { name: "Ясен", variants: ["Ясена", "Ясмина", "Жасмина"], latin: ["Yasen", "Yasena", "Yasmina", "Zhasmina"] },
      { name: "Явор", variants: ["Яворка"], latin: ["Yavor", "Yavorka"] },
      { name: "Калина", variants: ["Калинка"], latin: ["Kalina", "Kalinka"] },
      { name: "Здравко", variants: ["Здравка"], latin: ["Zdravko", "Zdravka"] },
      { name: "Детелина", variants: ["Делян", "Делянка", "Деляна", "Дилян", "Диляна"], latin: ["Detelina", "Delyan", "Delyanka", "Delyana", "Dilyan", "Dilyana"] },
      { name: "Карамфил", variants: ["Карамфила"], latin: ["Karamfil", "Karamfila"] },
      { name: "Латинка", variants: ["Латин"], latin: ["Latinka", "Latin"] },
      { name: "Теменужка", variants: [], latin: ["Temenushka"] },
      { name: "Дафина", variants: ["Далия"], latin: ["Dafina", "Daliya"] },
      { name: "Трендафил", variants: ["Трендафила"], latin: ["Trendafil", "Trendafila"] },
      { name: "Божура", variants: [], latin: ["Bozhura"] },
      { name: "Гроздена", variants: ["Гроздан", "Гроздана"], latin: ["Grozdena", "Grozdan", "Grozdana"] },
      { name: "Ива", variants: ["Ивана"], latin: ["Iva", "Ivana"] },
      { name: "Малина", variants: [], latin: ["Malina"] },
      { name: "Ралица", variants: [], latin: ["Ralitsa"] },
      { name: "Елица", variants: [], latin: ["Elitsa"] },
      { name: "Върбан", variants: ["Върбинка", "Върба"], latin: ["Varban", "Varbinka", "Varba"] },
      { name: "Магнолия", variants: [], latin: ["Magnoliya"] },
      { name: "Иглика", variants: ["Иглена"], latin: ["Iglika", "Iglena"] },
      { name: "Зюмбюла", variants: [], latin: ["Zyumbyula"] },
      { name: "Люляна", variants: ["Люлин", "Люлина"], latin: ["Lyulyana", "Lyulin", "Lyulina"] },
      { name: "Лоза", variants: ["Лозана"], latin: ["Loza", "Lozana"] },
      { name: "Ренета", variants: [], latin: ["Reneta"] },
      { name: "Китка", variants: [], latin: ["Kitka"] },
      { name: "Орхидея", variants: [], latin: ["Orhideya"] },
      { name: "Аглика", variants: [], latin: ["Aglika"] },
      { name: "Гергина", variants: ["Гергинка"], latin: ["Gergina", "Gerginka"] },
    ],
  },
  {
    id: "velikden",
    holiday: "Великден (Възкресение Христово)",
    holidayLatin: "Velikden (Vazskresenie Hristovo)",
    offsetFromEaster: 0,
    tradition: "orthodox",
    entries: [
      { name: "Велика", variants: ["Величка", "Вела", "Велислава"], latin: ["Velika", "Velichka", "Vela", "Velislava"] },
      { name: "Велико", variants: ["Велин", "Велко", "Вельо", "Велимир", "Велислав"], latin: ["Veliko", "Velin", "Velko", "Velyo", "Velimir", "Velislav"] },
      { name: "Велина", variants: ["Велка", "Велимира"], latin: ["Velina", "Velka", "Velimira"] },
      { name: "Паскал", variants: ["Паска", "Паскалина"], latin: ["Paskal", "Paska", "Paskalina"] },
    ],
  },
  {
    id: "spasovden",
    holiday: "Спасовден (Възнесение Господне)",
    holidayLatin: "Spasovden (Vaznesenie Gospodne)",
    offsetFromEaster: 39,
    tradition: "orthodox",
    entries: [
      { name: "Спас", variants: ["Спасен", "Спасимир", "Спасимира"], latin: ["Spas", "Spasen", "Spasimir", "Spasimira"] },
      { name: "Спасена", variants: ["Спасия", "Спаска"], latin: ["Spasena", "Spasiya", "Spaska"] },
    ],
  },
  {
    id: "petdesetnitsa",
    holiday: "Петдесетница (Света Троица)",
    holidayLatin: "Petdesetnitsa (Sveta Troitsa)",
    offsetFromEaster: 49,
    tradition: "orthodox",
    entries: [
      { name: "Трайко", variants: ["Траян", "Траяна", "Троянка"], latin: ["Trayko", "Trayan", "Trayana", "Troyanka"] },
    ],
  },
  {
    id: "duhovden",
    holiday: "Духов ден (Свети Дух)",
    holidayLatin: "Duhov den (Sveti Duh)",
    offsetFromEaster: 50,
    tradition: "orthodox",
    entries: [
      { name: "Пламен", variants: ["Пламена"], latin: ["Plamen", "Plamena"] },
    ],
  },
];
