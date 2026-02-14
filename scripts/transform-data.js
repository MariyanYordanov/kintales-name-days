/**
 * Transform script: Convert old name-days.js format to new monthly files.
 * Run once, then delete.
 */
import { nameDays } from "../src/data/name-days.js";
import { transliterate } from "../src/transliterate.js";
import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, "..", "src", "data");

// Names to REMOVE (foreign / non-Bulgarian)
const FOREIGN_NAMES = new Set([
  "Жан", "Жана", "Жанет", "Жанета",
  "Антонио", "Антоанета", "Антоанет",
  "Максимилиан",
  "Франциск", "Франческа", "Франко",
  "Себастиан", "Себастиана",
  "Елизабет", "Маргарет",
  "Лусия", "Луси", "Лучиана",
  "Аделина", "Адела", "Аделаида",
  "Марсел", "Марсела",
  "Ювеналий",
]);

// Surnames to REMOVE
const SURNAMES = new Set([
  "Борисов", "Великов", "Алексиев", "Алексиева",
]);

// Entries to SKIP entirely (empty, Catholic, or moveable)
const SKIP_DATES = new Set([
  "12-24", // Бъдни вечер (no names)
  "11-02", // Задушница (no names)
  "03-08", // Ден на жената (no names)
  "12-28", // 20000 мъченици (no names)
  "10-04", // Франциск Асизки (Catholic)
  "12-18", // Себастиан (Catholic)
  "12-16", // Аделаида (Western)
  "08-14", // Марсел (Western)
  "04-23", // Великден (moveable - goes to moveable.js)
]);

// Holiday corrections
const HOLIDAY_FIXES = {
  "01-20": "Свети Евтимий Велики",
};

// Known primary-variant groupings (first name is primary, rest are variants)
// Only for entries where automatic grouping would be wrong
const MANUAL_GROUPS = {
  "01-06": [
    ["Йордан", "Йорданка", "Данчо", "Данка"],
    ["Данаил", "Данаила"],
    ["Божидар", "Божидара", "Божана", "Божил", "Божко"],
    ["Богдан", "Богдана"],
    ["Богомил", "Богомила", "Богослав"],
    ["Боян", "Бояна"],
  ],
  "01-07": [
    ["Иван", "Иванка", "Ивана", "Иво", "Ивайло", "Ивалина", "Ивета", "Ивелина", "Ивона", "Ваньо", "Ванина"],
    ["Янко", "Янка", "Яна", "Янислав", "Яница"],
    ["Йоан", "Йоана"],
  ],
  "01-09": [
    ["Стефан", "Стефка", "Стефания", "Стефанка", "Стефко"],
    ["Стоян", "Стоянка", "Стойчо", "Стойна", "Стоил", "Стоимен", "Стоименка"],
  ],
  "05-06": [
    ["Георги", "Георгина", "Георгия", "Гергана", "Герган", "Гинка", "Гинчо", "Ганка", "Ганчо", "Гошо", "Жоро", "Гергин", "Гергинка", "Галина"],
  ],
  "05-21": [
    ["Константин", "Костадин", "Костадинка", "Косьо", "Коста", "Костка", "Кънчо"],
    ["Елена", "Еленка", "Елеонора", "Ели", "Елка"],
  ],
  "06-24": [
    ["Еньо", "Енчо"],
    ["Билян", "Биляна"],
    ["Огнян", "Огняна"],
  ],
  "06-29": [
    ["Петър", "Петра", "Петка", "Петко", "Пенка", "Пенчо", "Пеньо", "Петьо", "Петя", "Петрана"],
    ["Камен", "Каменка"],
    ["Павел", "Павлина", "Павлинка", "Паулина", "Поли"],
  ],
  "09-14": [
    ["Кръстьо", "Кръстю", "Кръстинка"],
    ["Кристиан", "Кристиана", "Кристина", "Кристин", "Кристиян", "Кристияна"],
    ["Христо", "Христина", "Христиана", "Християн", "Християна", "Христомир", "Христофор", "Хриси"],
  ],
  "09-17": [
    ["Вяра"],
    ["Надежда", "Надя"],
    ["Любов", "Люба", "Любка", "Любомир", "Любомира", "Любен", "Любена", "Любослав", "Любослава"],
    ["София", "Софка", "Софи"],
  ],
  "10-26": [
    ["Димитър", "Димитрина", "Димитринка", "Митко", "Митка", "Димо", "Димана", "Димка", "Димчо", "Димитрия", "Деметра", "Деметрия"],
  ],
  "11-08": [
    ["Михаил", "Михаела", "Михо", "Мишо", "Миха", "Михалина"],
    ["Ангел", "Ангела", "Ангелина", "Ангелинка", "Архангел"],
    ["Гавраил", "Гаврил", "Габриел", "Габриела"],
    ["Рафаел", "Рафаела"],
  ],
  "12-06": [
    ["Никола", "Николай", "Николина", "Николинка", "Нико", "Ники", "Никол", "Николета", "Николка", "Никулица", "Кольо", "Колка"],
  ],
  "12-25": [
    ["Христо", "Христина", "Кристина", "Кристиан", "Кристиана", "Христиан", "Христиана", "Христофор", "Христомир"],
    ["Рождена"],
    ["Коледа"],
    ["Божидар", "Божидара"],
  ],
  "12-27": [
    ["Стефан", "Стефка", "Стефания", "Стефанка", "Стефко"],
    ["Стоян", "Стоянка", "Стойчо", "Стойна"],
  ],
};

const monthNames = [
  "", "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december",
];

// Group names into primary + variants
function groupNames(dateKey, names) {
  if (MANUAL_GROUPS[dateKey]) {
    return MANUAL_GROUPS[dateKey];
  }
  // Default: treat first name as primary, rest as variants
  if (names.length <= 1) return [names];
  return [[names[0], ...names.slice(1)]];
}

// Collect entries by month
const monthEntries = {};
for (let m = 1; m <= 12; m++) monthEntries[m] = [];

// Track seen date keys to detect duplicates
const seenDates = new Set();

for (const [dateKey, entry] of Object.entries(nameDays)) {
  // Skip entries
  if (SKIP_DATES.has(dateKey)) continue;
  if (!entry.names || entry.names.length === 0) continue;

  // Skip duplicate keys (take first occurrence)
  if (seenDates.has(dateKey)) {
    console.log(`SKIP duplicate: ${dateKey}`);
    continue;
  }
  seenDates.add(dateKey);

  const [monthStr, dayStr] = dateKey.split("-");
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);

  // Filter out foreign names and surnames
  const cleanNames = entry.names.filter(
    (n) => !FOREIGN_NAMES.has(n) && !SURNAMES.has(n)
  );

  if (cleanNames.length === 0) {
    console.log(`SKIP empty after filter: ${dateKey} (${entry.holiday})`);
    continue;
  }

  // Fix holiday name if needed
  const holiday = HOLIDAY_FIXES[dateKey] || entry.holiday;

  // Group into primary + variants
  const groups = groupNames(dateKey, cleanNames);

  for (const group of groups) {
    const [primary, ...variants] = group;
    const allNames = [primary, ...variants];
    const latinNames = allNames.map((n) => transliterate(n));

    monthEntries[month].push({
      name: primary,
      variants,
      latin: latinNames,
      month,
      day,
      holiday,
      holidayLatin: transliterate(holiday),
      tradition: "orthodox",
      moveable: null,
    });
  }
}

// Write monthly files
for (let m = 1; m <= 12; m++) {
  const entries = monthEntries[m];
  if (entries.length === 0) continue;

  const monthName = monthNames[m];
  const varName = monthName;

  let content = `/** @typedef {import('../types.js').NameDayEntry} NameDayEntry */\n\n`;
  content += `/** @type {NameDayEntry[]} */\n`;
  content += `export const ${varName} = [\n`;

  for (const e of entries) {
    const variantsStr = e.variants.map((v) => `"${v}"`).join(", ");
    const latinStr = e.latin.map((l) => `"${l}"`).join(", ");
    content += `  {\n`;
    content += `    name: "${e.name}",\n`;
    content += `    variants: [${variantsStr}],\n`;
    content += `    latin: [${latinStr}],\n`;
    content += `    month: ${e.month}, day: ${e.day},\n`;
    content += `    holiday: "${e.holiday}",\n`;
    content += `    holidayLatin: "${e.holidayLatin}",\n`;
    content += `    tradition: "${e.tradition}",\n`;
    content += `    moveable: null,\n`;
    content += `  },\n`;
  }

  content += `];\n`;

  const filePath = join(dataDir, `${monthName}.js`);
  writeFileSync(filePath, content, "utf-8");
  console.log(`Written: ${monthName}.js (${entries.length} entries)`);
}

// Summary
let totalEntries = 0;
let totalNames = 0;
for (let m = 1; m <= 12; m++) {
  totalEntries += monthEntries[m].length;
  for (const e of monthEntries[m]) {
    totalNames += 1 + e.variants.length;
  }
}
console.log(`\nTotal: ${totalEntries} entries, ${totalNames} names across 12 months`);
