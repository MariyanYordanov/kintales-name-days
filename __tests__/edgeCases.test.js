import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  getNameDay,
  getNamesByDate,
  isNameDay,
  searchNames,
  getNamesByHoliday,
  getUpcomingNameDays,
  getAllNameDays,
  transliterate,
  orthodoxEaster,
} from '../src/index.js';

describe('Edge cases — invalid input', () => {
  it('getNameDay(null) → null', () => {
    assert.strictEqual(getNameDay(null), null);
  });

  it('getNameDay(undefined) → null', () => {
    assert.strictEqual(getNameDay(undefined), null);
  });

  it('getNameDay("") → null', () => {
    assert.strictEqual(getNameDay(''), null);
  });

  it('getNameDay(42) → null', () => {
    assert.strictEqual(getNameDay(42), null);
  });

  it('getNamesByDate(null) → []', () => {
    assert.deepStrictEqual(getNamesByDate(null), []);
  });

  it('getNamesByDate("invalid") → []', () => {
    assert.deepStrictEqual(getNamesByDate('invalid'), []);
  });

  it('isNameDay(null, new Date()) → false', () => {
    assert.strictEqual(isNameDay(null, new Date()), false);
  });

  it('isNameDay("Георги", null) → false', () => {
    assert.strictEqual(isNameDay('Георги', null), false);
  });

  it('searchNames(null) → []', () => {
    assert.deepStrictEqual(searchNames(null), []);
  });

  it('searchNames("") → []', () => {
    assert.deepStrictEqual(searchNames(''), []);
  });

  it('getNamesByHoliday(null) → []', () => {
    assert.deepStrictEqual(getNamesByHoliday(null), []);
  });

  it('getUpcomingNameDays(0) → []', () => {
    assert.deepStrictEqual(getUpcomingNameDays(0), []);
  });

  it('getUpcomingNameDays(-1) → []', () => {
    assert.deepStrictEqual(getUpcomingNameDays(-1), []);
  });
});

describe('Edge cases — date boundaries', () => {
  it('Feb 29 handling', () => {
    // Feb 29 in a leap year
    const names = getNamesByDate(new Date(2024, 1, 29));
    assert.ok(Array.isArray(names));
  });

  it('Dec 31 has entries', () => {
    const names = getNamesByDate('12-31', 2026);
    assert.ok(names.length > 0, 'Dec 31 should have name day entries');
  });

  it('Jan 1 has entries', () => {
    const names = getNamesByDate('01-01', 2026);
    assert.ok(names.length > 0, 'Jan 1 should have name day entries');
    assert.ok(names.includes('Васил'));
  });
});

describe('Edge cases — multiple name days', () => {
  it('Стефан has at least 2 dates (Jan 9 + Dec 27)', () => {
    const result = getNameDay('Стефан', 2026);
    assert.ok(Array.isArray(result), 'Стефан should return array');
    assert.ok(result.length >= 2);
  });

  it('Никола has multiple dates', () => {
    const result = getNameDay('Никола', 2026);
    assert.ok(result !== null);
    // Никола appears on multiple dates in the data
    if (Array.isArray(result)) {
      assert.ok(result.length >= 2);
    }
  });

  it('isNameDay works for name with multiple dates', () => {
    // Стефан: Jan 9 and Dec 27
    assert.strictEqual(isNameDay('Стефан', new Date(2026, 0, 9)), true);
    assert.strictEqual(isNameDay('Стефан', new Date(2026, 11, 27)), true);
    assert.strictEqual(isNameDay('Стефан', new Date(2026, 5, 15)), false);
  });
});

describe('Edge cases — moveable dates', () => {
  it('isNameDay("Цветан", correct Цветница date) → true', () => {
    // Цветница 2026 = April 5
    assert.strictEqual(isNameDay('Цветан', new Date(2026, 3, 5)), true);
  });

  it('isNameDay("Цветан", wrong date) → false', () => {
    assert.strictEqual(isNameDay('Цветан', new Date(2026, 3, 6)), false);
  });

  it('Цветница moves between years', () => {
    // 2026: Easter April 12, Цветница April 5
    // 2027: Easter May 2, Цветница April 25
    assert.strictEqual(isNameDay('Цветан', new Date(2026, 3, 5)), true);
    assert.strictEqual(isNameDay('Цветан', new Date(2027, 3, 25)), true);
  });

  it('Великден entry has correct year-specific date', () => {
    const r2026 = getNameDay('Велика', 2026);
    const single = Array.isArray(r2026) ? r2026[0] : r2026;
    assert.strictEqual(single.month, 4);
    assert.strictEqual(single.day, 12);
    assert.strictEqual(single.isMoveable, true);
  });
});

describe('Edge cases — exports', () => {
  it('transliterate is exported and works', () => {
    assert.strictEqual(typeof transliterate, 'function');
    assert.strictEqual(transliterate('Георги'), 'Georgi');
  });

  it('orthodoxEaster is exported and works', () => {
    assert.strictEqual(typeof orthodoxEaster, 'function');
    const d = orthodoxEaster(2026);
    assert.strictEqual(d.getMonth() + 1, 4);
    assert.strictEqual(d.getDate(), 12);
  });

  it('getAllNameDays returns array', () => {
    const all = getAllNameDays(2026);
    assert.ok(Array.isArray(all));
    assert.ok(all.length > 200);
  });
});
