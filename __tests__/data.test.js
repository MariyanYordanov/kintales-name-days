import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getAllFixed, getIndex, getAllEntries } from '../src/data/nameDays.js';
import { moveableHolidays } from '../src/moveable.js';

const fixedEntries = getAllFixed();

describe('Data integrity — fixed entries', () => {
  it('has at least 200 fixed entries', () => {
    assert.ok(fixedEntries.length >= 200, `Expected >= 200, got ${fixedEntries.length}`);
  });

  it('every entry has required string fields', () => {
    for (const e of fixedEntries) {
      assert.ok(typeof e.name === 'string' && e.name.length > 0, `Invalid name: ${JSON.stringify(e)}`);
      assert.ok(typeof e.holiday === 'string' && e.holiday.length > 0, `Invalid holiday for "${e.name}"`);
      assert.ok(typeof e.holidayLatin === 'string' && e.holidayLatin.length > 0, `Invalid holidayLatin for "${e.name}"`);
    }
  });

  it('every entry has valid month (1-12) and day', () => {
    const maxDays = [0, 31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    for (const e of fixedEntries) {
      assert.ok(e.month >= 1 && e.month <= 12, `Invalid month ${e.month} for "${e.name}"`);
      assert.ok(e.day >= 1 && e.day <= maxDays[e.month], `Invalid day ${e.day} for month ${e.month}, name "${e.name}"`);
    }
  });

  it('every entry has latin array with at least 1 element', () => {
    for (const e of fixedEntries) {
      assert.ok(Array.isArray(e.latin) && e.latin.length >= 1, `Missing latin for "${e.name}"`);
    }
  });

  it('every entry has variants array', () => {
    for (const e of fixedEntries) {
      assert.ok(Array.isArray(e.variants), `Missing variants for "${e.name}"`);
    }
  });

  it('tradition is orthodox, folk, or both', () => {
    for (const e of fixedEntries) {
      assert.ok(['orthodox', 'folk', 'both'].includes(e.tradition), `Invalid tradition "${e.tradition}" for "${e.name}"`);
    }
  });

  it('moveable is null for all fixed entries', () => {
    for (const e of fixedEntries) {
      assert.strictEqual(e.moveable, null, `"${e.name}" should have moveable: null`);
    }
  });

  it('no duplicate name+date combinations', () => {
    const seen = new Set();
    for (const e of fixedEntries) {
      const key = `${e.name}|${e.month}-${e.day}`;
      assert.ok(!seen.has(key), `Duplicate: "${e.name}" on ${e.month}-${e.day}`);
      seen.add(key);
    }
  });

  it('names are properly capitalized (first letter uppercase)', () => {
    const upperRegex = /^[А-ЯA-Z]/;
    for (const e of fixedEntries) {
      assert.ok(upperRegex.test(e.name), `Name not capitalized: "${e.name}"`);
      for (const v of e.variants) {
        assert.ok(upperRegex.test(v), `Variant not capitalized: "${v}"`);
      }
    }
  });

  it('no trailing/leading whitespace in any string field', () => {
    for (const e of fixedEntries) {
      assert.strictEqual(e.name, e.name.trim(), `Whitespace in name: "${e.name}"`);
      assert.strictEqual(e.holiday, e.holiday.trim(), `Whitespace in holiday`);
      assert.strictEqual(e.holidayLatin, e.holidayLatin.trim(), `Whitespace in holidayLatin`);
      for (const v of e.variants) {
        assert.strictEqual(v, v.trim(), `Whitespace in variant "${v}"`);
      }
      for (const l of e.latin) {
        assert.strictEqual(l, l.trim(), `Whitespace in latin "${l}"`);
      }
    }
  });

  it('no empty strings in variants or latin arrays', () => {
    for (const e of fixedEntries) {
      for (const v of e.variants) {
        assert.ok(v.length > 0, `Empty variant for "${e.name}"`);
      }
      for (const l of e.latin) {
        assert.ok(l.length > 0, `Empty latin for "${e.name}"`);
      }
    }
  });

  it('all 12 months have at least 5 entries', () => {
    const counts = {};
    for (let m = 1; m <= 12; m++) counts[m] = 0;
    for (const e of fixedEntries) counts[e.month]++;
    for (let m = 1; m <= 12; m++) {
      assert.ok(counts[m] >= 5, `Month ${m} has only ${counts[m]} entries`);
    }
  });

  it('does not contain known foreign names', () => {
    const foreign = new Set([
      'Жан', 'Жана', 'Жанет', 'Жанета', 'Антонио', 'Франциск', 'Франческа',
      'Себастиан', 'Себастиана', 'Елизабет', 'Маргарет', 'Аделина', 'Адела',
      'Аделаида', 'Марсел', 'Марсела', 'Ювеналий',
    ]);
    for (const e of fixedEntries) {
      assert.ok(!foreign.has(e.name), `Foreign name: "${e.name}"`);
      for (const v of e.variants) {
        assert.ok(!foreign.has(v), `Foreign variant: "${v}"`);
      }
    }
  });

  it('does not contain surnames', () => {
    const surnames = new Set(['Борисов', 'Великов', 'Алексиев', 'Алексиева']);
    for (const e of fixedEntries) {
      assert.ok(!surnames.has(e.name), `Surname: "${e.name}"`);
      for (const v of e.variants) {
        assert.ok(!surnames.has(v), `Surname variant: "${v}"`);
      }
    }
  });

  it('specific well-known entries are present', () => {
    const names = fixedEntries.map((e) => e.name);
    assert.ok(names.includes('Васил'), 'Missing Васил');
    assert.ok(names.includes('Иван'), 'Missing Иван');
    assert.ok(names.includes('Георги'), 'Missing Георги');
    assert.ok(names.includes('Димитър'), 'Missing Димитър');
    assert.ok(names.includes('Петър'), 'Missing Петър');
    assert.ok(names.includes('Никола'), 'Missing Никола');
    assert.ok(names.includes('Стефан'), 'Missing Стефан');
    assert.ok(names.includes('Мария'), 'Missing Мария');
    assert.ok(names.includes('Елена'), 'Missing Елена');
  });
});

describe('Data integrity — index', () => {
  it('getIndex returns valid index with byName, byDate, byHoliday', () => {
    const idx = getIndex(2026);
    assert.ok(idx.byName instanceof Map);
    assert.ok(idx.byDate instanceof Map);
    assert.ok(idx.byHoliday instanceof Map);
    assert.strictEqual(idx.year, 2026);
  });

  it('index includes both fixed and moveable entries', () => {
    const all = getAllEntries(2026);
    assert.ok(all.length > fixedEntries.length, 'Should have more entries than fixed alone');
  });

  it('index caches by year', () => {
    const idx1 = getIndex(2026);
    const idx2 = getIndex(2026);
    assert.strictEqual(idx1, idx2, 'Same year should return cached index');
  });

  it('different years produce different indexes', () => {
    const idx2026 = getIndex(2026);
    const idx2027 = getIndex(2027);
    assert.notStrictEqual(idx2026, idx2027);
  });
});

describe('Data integrity — moveable holidays', () => {
  it('has 7 moveable holidays', () => {
    assert.strictEqual(moveableHolidays.length, 7);
  });

  it('every moveable holiday has required fields', () => {
    for (const h of moveableHolidays) {
      assert.ok(typeof h.id === 'string' && h.id.length > 0);
      assert.ok(typeof h.holiday === 'string' && h.holiday.length > 0);
      assert.ok(typeof h.holidayLatin === 'string' && h.holidayLatin.length > 0);
      assert.ok(typeof h.offsetFromEaster === 'number');
      assert.ok(Array.isArray(h.entries) && h.entries.length > 0);
    }
  });

  it('moveable holiday entries have name, variants, latin', () => {
    for (const h of moveableHolidays) {
      for (const e of h.entries) {
        assert.ok(typeof e.name === 'string' && e.name.length > 0);
        assert.ok(Array.isArray(e.variants));
        assert.ok(Array.isArray(e.latin) && e.latin.length >= 1);
      }
    }
  });
});
