/**
 * Data validation script for bg-name-days.
 * Run: node scripts/validateData.js
 * Checks all data integrity rules from the spec.
 */
import { getAllFixed } from '../src/data/nameDays.js';
import { moveableHolidays } from '../src/moveable.js';

const entries = getAllFixed();
let errors = 0;
let warnings = 0;

function error(msg) {
  errors++;
  console.error(`  ERROR: ${msg}`);
}

function warn(msg) {
  warnings++;
  console.warn(`  WARN:  ${msg}`);
}

// Max days per month (non-leap year)
const maxDays = [0, 31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

console.log('=== bg-name-days Data Validation ===\n');

// 1. Check every entry has required fields
console.log('1. Required fields...');
for (const e of entries) {
  if (!e.name || typeof e.name !== 'string') {
    error(`Missing or invalid name: ${JSON.stringify(e)}`);
  }
  if (!e.holiday || typeof e.holiday !== 'string') {
    error(`Missing or invalid holiday for "${e.name}"`);
  }
  if (!Array.isArray(e.variants)) {
    error(`Missing variants array for "${e.name}"`);
  }
  if (!Array.isArray(e.latin) || e.latin.length === 0) {
    error(`Missing or empty latin array for "${e.name}"`);
  }
  if (!e.holidayLatin || typeof e.holidayLatin !== 'string') {
    error(`Missing or invalid holidayLatin for "${e.name}"`);
  }
  if (!['orthodox', 'folk', 'both'].includes(e.tradition)) {
    error(`Invalid tradition "${e.tradition}" for "${e.name}"`);
  }
}

// 2. Valid months (1-12) and days
console.log('2. Valid dates...');
for (const e of entries) {
  if (e.month < 1 || e.month > 12) {
    error(`Invalid month ${e.month} for "${e.name}"`);
  }
  if (e.day < 1 || e.day > maxDays[e.month]) {
    error(`Invalid day ${e.day} for month ${e.month} for "${e.name}"`);
  }
}

// 3. No duplicate name+date combinations
console.log('3. No duplicate name+date...');
const nameDateSet = new Set();
for (const e of entries) {
  const key = `${e.name}|${e.month}-${e.day}`;
  if (nameDateSet.has(key)) {
    error(`Duplicate name+date: "${e.name}" on ${e.month}-${e.day}`);
  }
  nameDateSet.add(key);
}

// 4. Proper Bulgarian capitalization
console.log('4. Proper capitalization...');
const bgUpperRegex = /^[А-ЯA-Z]/;
for (const e of entries) {
  if (!bgUpperRegex.test(e.name)) {
    error(`Name not capitalized: "${e.name}"`);
  }
  for (const v of e.variants) {
    if (v && !bgUpperRegex.test(v)) {
      error(`Variant not capitalized: "${v}" (parent: "${e.name}")`);
    }
  }
  for (const l of e.latin) {
    if (l && !bgUpperRegex.test(l)) {
      error(`Latin not capitalized: "${l}" (parent: "${e.name}")`);
    }
  }
}

// 5. No trailing/leading whitespace
console.log('5. No whitespace...');
for (const e of entries) {
  if (e.name !== e.name.trim()) error(`Whitespace in name: "${e.name}"`);
  if (e.holiday !== e.holiday.trim()) error(`Whitespace in holiday: "${e.holiday}"`);
  if (e.holidayLatin !== e.holidayLatin.trim()) error(`Whitespace in holidayLatin: "${e.holidayLatin}"`);
  for (const v of e.variants) {
    if (v !== v.trim()) error(`Whitespace in variant: "${v}" (parent: "${e.name}")`);
  }
  for (const l of e.latin) {
    if (l !== l.trim()) error(`Whitespace in latin: "${l}" (parent: "${e.name}")`);
  }
}

// 6. No empty strings in variants/latin
console.log('6. No empty strings in arrays...');
for (const e of entries) {
  for (const v of e.variants) {
    if (!v) error(`Empty variant for "${e.name}"`);
  }
  for (const l of e.latin) {
    if (!l) error(`Empty latin for "${e.name}"`);
  }
}

// 7. Latin array should include transliteration of primary name
console.log('7. Latin includes primary name transliteration...');
for (const e of entries) {
  if (e.latin.length < 1 + e.variants.length) {
    warn(`Latin array (${e.latin.length}) shorter than name+variants (${1 + e.variants.length}) for "${e.name}"`);
  }
}

// 8. All 12 months have at least 5 entries
console.log('8. Monthly coverage...');
const monthCounts = {};
for (let m = 1; m <= 12; m++) monthCounts[m] = 0;
for (const e of entries) monthCounts[e.month]++;
const monthNames = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
for (let m = 1; m <= 12; m++) {
  if (monthCounts[m] < 5) {
    error(`Month ${monthNames[m]} has only ${monthCounts[m]} entries (minimum 5)`);
  }
}

// 9. moveable field is null for fixed entries
console.log('9. Fixed entries have moveable: null...');
for (const e of entries) {
  if (e.moveable !== null) {
    error(`Fixed entry "${e.name}" has moveable: "${e.moveable}"`);
  }
}

// 10. No foreign names in the dataset
console.log('10. No foreign names...');
const foreignNames = new Set([
  'Жан', 'Жана', 'Жанет', 'Жанета', 'Антонио', 'Антоанета', 'Антоанет',
  'Максимилиан', 'Франциск', 'Франческа', 'Франко', 'Себастиан', 'Себастиана',
  'Елизабет', 'Маргарет', 'Лусия', 'Луси', 'Лучиана', 'Аделина', 'Адела',
  'Аделаида', 'Марсел', 'Марсела', 'Ювеналий',
]);
const surnames = new Set(['Борисов', 'Великов', 'Алексиев', 'Алексиева']);

for (const e of entries) {
  if (foreignNames.has(e.name)) error(`Foreign name as primary: "${e.name}"`);
  if (surnames.has(e.name)) error(`Surname as primary: "${e.name}"`);
  for (const v of e.variants) {
    if (foreignNames.has(v)) error(`Foreign name as variant: "${v}" (parent: "${e.name}")`);
    if (surnames.has(v)) error(`Surname as variant: "${v}" (parent: "${e.name}")`);
  }
}

// 11. Validate moveable holidays
console.log('11. Moveable holidays...');
for (const holiday of moveableHolidays) {
  if (!holiday.id || typeof holiday.id !== 'string') {
    error(`Moveable holiday missing id`);
  }
  if (!holiday.holiday || typeof holiday.holiday !== 'string') {
    error(`Moveable holiday "${holiday.id}" missing holiday name`);
  }
  if (typeof holiday.offsetFromEaster !== 'number') {
    error(`Moveable holiday "${holiday.id}" missing offsetFromEaster`);
  }
  if (!holiday.entries || holiday.entries.length === 0) {
    error(`Moveable holiday "${holiday.id}" has no entries`);
  }
  for (const entry of holiday.entries) {
    if (!entry.name) error(`Moveable entry missing name in "${holiday.id}"`);
    if (!Array.isArray(entry.variants)) error(`Moveable entry "${entry.name}" missing variants in "${holiday.id}"`);
    if (!Array.isArray(entry.latin) || entry.latin.length === 0) error(`Moveable entry "${entry.name}" missing latin in "${holiday.id}"`);
  }
}

// Summary
console.log('\n=== Summary ===');
console.log(`Fixed entries: ${entries.length}`);
console.log(`Moveable holidays: ${moveableHolidays.length}`);
let moveableNameCount = 0;
for (const h of moveableHolidays) moveableNameCount += h.entries.length;
console.log(`Moveable entries: ${moveableNameCount}`);
console.log(`Total entries: ${entries.length + moveableNameCount}`);

let totalNames = 0;
for (const e of entries) totalNames += 1 + e.variants.length;
for (const h of moveableHolidays) {
  for (const e of h.entries) totalNames += 1 + e.variants.length;
}
console.log(`Total names (primary + variants): ${totalNames}`);

console.log(`\nMonthly distribution:`);
for (let m = 1; m <= 12; m++) {
  console.log(`  ${monthNames[m]}: ${monthCounts[m]} entries`);
}

console.log(`\nErrors: ${errors}`);
console.log(`Warnings: ${warnings}`);

if (errors > 0) {
  process.exit(1);
} else {
  console.log('\nAll checks passed!');
}
