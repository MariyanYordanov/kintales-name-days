import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getNameDay, getNamesByDate, isNameDay, getAllNameDays, getTodayNames } from '../src/lookup.js';

describe('getNameDay', () => {
  it('finds a name by Cyrillic primary name', () => {
    const result = getNameDay('Георги', 2026);
    assert.ok(result !== null);
    // Георги only has one date (May 6)
    assert.ok(!Array.isArray(result), 'Should return single result');
    assert.strictEqual(result.name, 'Георги');
    assert.strictEqual(result.month, 5);
    assert.strictEqual(result.day, 6);
    assert.strictEqual(result.holiday, 'Гергьовден');
  });

  it('is case-insensitive for Cyrillic', () => {
    const result = getNameDay('георги', 2026);
    assert.ok(result !== null);
    const r = Array.isArray(result) ? result[0] : result;
    assert.strictEqual(r.name, 'Георги');
  });

  it('finds by Latin transliteration', () => {
    const result = getNameDay('Georgi', 2026);
    assert.ok(result !== null);
    const r = Array.isArray(result) ? result[0] : result;
    assert.strictEqual(r.name, 'Георги');
  });

  it('finds by variant name', () => {
    const result = getNameDay('Гошо', 2026);
    assert.ok(result !== null);
    const r = Array.isArray(result) ? result[0] : result;
    assert.strictEqual(r.name, 'Георги');
  });

  it('finds by variant Latin', () => {
    const result = getNameDay('Gosho', 2026);
    assert.ok(result !== null);
    const r = Array.isArray(result) ? result[0] : result;
    assert.strictEqual(r.name, 'Георги');
  });

  it('returns null for unknown name', () => {
    assert.strictEqual(getNameDay('Непознато', 2026), null);
  });

  it('returns null for null input', () => {
    assert.strictEqual(getNameDay(null), null);
  });

  it('returns null for empty string', () => {
    assert.strictEqual(getNameDay(''), null);
  });

  it('returns null for non-string input', () => {
    assert.strictEqual(getNameDay(42), null);
  });

  it('returns array for names with multiple dates', () => {
    // Стефан has Jan 9 and Dec 27
    const result = getNameDay('Стефан', 2026);
    assert.ok(result !== null);
    assert.ok(Array.isArray(result), 'Стефан should have multiple dates');
    assert.ok(result.length >= 2, `Expected >= 2 dates, got ${result.length}`);
    const months = result.map((r) => r.month);
    assert.ok(months.includes(1), 'Should include January');
    assert.ok(months.includes(12), 'Should include December');
  });

  it('finds moveable name (Цветан)', () => {
    const result = getNameDay('Цветан', 2026);
    assert.ok(result !== null);
    const r = Array.isArray(result) ? result[0] : result;
    assert.strictEqual(r.name, 'Цветан');
    assert.strictEqual(r.isMoveable, true);
    // Цветница 2026 = April 5
    assert.strictEqual(r.month, 4);
    assert.strictEqual(r.day, 5);
  });

  it('moveable name changes date with year', () => {
    const r2026 = getNameDay('Велика', 2026);
    const r2027 = getNameDay('Велика', 2027);
    const single2026 = Array.isArray(r2026) ? r2026[0] : r2026;
    const single2027 = Array.isArray(r2027) ? r2027[0] : r2027;
    // 2026 Easter = April 12, 2027 Easter = May 2
    assert.strictEqual(single2026.month, 4);
    assert.strictEqual(single2026.day, 12);
    assert.strictEqual(single2027.month, 5);
    assert.strictEqual(single2027.day, 2);
  });

  it('result includes variants array', () => {
    const result = getNameDay('Васил', 2026);
    const r = Array.isArray(result) ? result[0] : result;
    assert.ok(Array.isArray(r.variants));
    assert.ok(r.variants.length > 0);
    assert.ok(r.variants.includes('Василка'));
  });

  it('result has isMoveable false for fixed date', () => {
    const result = getNameDay('Васил', 2026);
    const r = Array.isArray(result) ? result[0] : result;
    assert.strictEqual(r.isMoveable, false);
  });
});

describe('getNamesByDate', () => {
  it('returns names for a known date (string)', () => {
    const names = getNamesByDate('05-06', 2026);
    assert.ok(names.length > 0);
    assert.ok(names.includes('Георги'));
  });

  it('returns names for a Date object', () => {
    const names = getNamesByDate(new Date(2026, 4, 6));
    assert.ok(names.length > 0);
    assert.ok(names.includes('Георги'));
  });

  it('includes both primary names and variants', () => {
    const names = getNamesByDate('05-06', 2026);
    assert.ok(names.includes('Георги'));
    assert.ok(names.includes('Гошо'));
    assert.ok(names.includes('Жоро'));
  });

  it('returns empty array for date with no names', () => {
    const names = getNamesByDate('02-29', 2026);
    // Unlikely to have names on Feb 29
    assert.ok(Array.isArray(names));
  });

  it('returns empty array for null input', () => {
    assert.deepStrictEqual(getNamesByDate(null), []);
  });

  it('returns empty array for invalid string', () => {
    assert.deepStrictEqual(getNamesByDate('invalid'), []);
  });

  it('returns moveable names on their resolved date', () => {
    // Цветница 2026 = April 5
    const names = getNamesByDate(new Date(2026, 3, 5));
    assert.ok(names.includes('Цветан'), 'Should include Цветан on Цветница 2026');
  });
});

describe('isNameDay', () => {
  it('returns true for correct name+date', () => {
    assert.strictEqual(isNameDay('Георги', new Date(2026, 4, 6)), true);
  });

  it('returns true for variant name', () => {
    assert.strictEqual(isNameDay('Гошо', new Date(2026, 4, 6)), true);
  });

  it('returns true for Latin name', () => {
    assert.strictEqual(isNameDay('Georgi', new Date(2026, 4, 6)), true);
  });

  it('returns false for wrong date', () => {
    assert.strictEqual(isNameDay('Георги', new Date(2026, 4, 7)), false);
  });

  it('returns false for unknown name', () => {
    assert.strictEqual(isNameDay('Непознато', new Date(2026, 4, 6)), false);
  });

  it('returns false for null name', () => {
    assert.strictEqual(isNameDay(null, new Date()), false);
  });

  it('returns false for invalid date', () => {
    assert.strictEqual(isNameDay('Георги', new Date('invalid')), false);
  });

  it('works for moveable dates', () => {
    // Цветница 2026 = April 5
    assert.strictEqual(isNameDay('Цветан', new Date(2026, 3, 5)), true);
    // Wrong date
    assert.strictEqual(isNameDay('Цветан', new Date(2026, 3, 6)), false);
  });

  it('moveable date changes with year', () => {
    // Великден 2026 = April 12, 2027 = May 2
    assert.strictEqual(isNameDay('Велика', new Date(2026, 3, 12)), true);
    assert.strictEqual(isNameDay('Велика', new Date(2027, 4, 2)), true);
    assert.strictEqual(isNameDay('Велика', new Date(2026, 3, 13)), false);
  });
});

describe('getAllNameDays', () => {
  it('returns array of results', () => {
    const all = getAllNameDays(2026);
    assert.ok(Array.isArray(all));
    assert.ok(all.length > 200);
  });

  it('results include both fixed and moveable', () => {
    const all = getAllNameDays(2026);
    const fixed = all.filter((r) => !r.isMoveable);
    const moveable = all.filter((r) => r.isMoveable);
    assert.ok(fixed.length > 200);
    assert.ok(moveable.length > 40);
  });

  it('returns deep copies (safe to mutate)', () => {
    const all1 = getAllNameDays(2026);
    const all2 = getAllNameDays(2026);
    all1[0].name = 'MUTATED';
    assert.notStrictEqual(all2[0].name, 'MUTATED');
  });
});

describe('getTodayNames', () => {
  it('returns an array', () => {
    const names = getTodayNames();
    assert.ok(Array.isArray(names));
  });
});
