import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  orthodoxEaster,
  getMoveableDates,
  getMoveableEntries,
  resolveMoveableDate,
} from '../src/moveable.js';

describe('orthodoxEaster', () => {
  it('returns correct date for 2024 (May 5)', () => {
    const d = orthodoxEaster(2024);
    assert.strictEqual(d.getMonth() + 1, 5);
    assert.strictEqual(d.getDate(), 5);
  });

  it('returns correct date for 2025 (April 20)', () => {
    const d = orthodoxEaster(2025);
    assert.strictEqual(d.getMonth() + 1, 4);
    assert.strictEqual(d.getDate(), 20);
  });

  it('returns correct date for 2026 (April 12)', () => {
    const d = orthodoxEaster(2026);
    assert.strictEqual(d.getMonth() + 1, 4);
    assert.strictEqual(d.getDate(), 12);
  });

  it('returns correct date for 2027 (May 2)', () => {
    const d = orthodoxEaster(2027);
    assert.strictEqual(d.getMonth() + 1, 5);
    assert.strictEqual(d.getDate(), 2);
  });

  it('returns correct date for 2028 (April 16)', () => {
    const d = orthodoxEaster(2028);
    assert.strictEqual(d.getMonth() + 1, 4);
    assert.strictEqual(d.getDate(), 16);
  });
});

describe('getMoveableDates', () => {
  it('returns 7 moveable dates', () => {
    const dates = getMoveableDates(2026);
    assert.strictEqual(dates.size, 7);
  });

  it('Цветница 2026 is April 5 (Easter-7)', () => {
    const dates = getMoveableDates(2026);
    const tsvetnitsa = dates.get('tsvetnitsa');
    assert.deepStrictEqual(tsvetnitsa, { month: 4, day: 5 });
  });

  it('Великден 2026 is April 12 (Easter)', () => {
    const dates = getMoveableDates(2026);
    const velikden = dates.get('velikden');
    assert.deepStrictEqual(velikden, { month: 4, day: 12 });
  });

  it('Спасовден 2026 is May 21 (Easter+39)', () => {
    const dates = getMoveableDates(2026);
    const spasovden = dates.get('spasovden');
    assert.deepStrictEqual(spasovden, { month: 5, day: 21 });
  });

  it('Лазаровден 2026 is April 4 (Easter-8)', () => {
    const dates = getMoveableDates(2026);
    const lazarovden = dates.get('lazarovden');
    assert.deepStrictEqual(lazarovden, { month: 4, day: 4 });
  });

  it('Тодоровден 2026 is February 28 (Easter-43)', () => {
    const dates = getMoveableDates(2026);
    const todorovden = dates.get('todorovden');
    assert.deepStrictEqual(todorovden, { month: 2, day: 28 });
  });

  it('Тодоровден always falls on Saturday', () => {
    for (const year of [2024, 2025, 2026, 2027, 2028, 2029, 2030]) {
      const dates = getMoveableDates(year);
      const tod = dates.get('todorovden');
      const d = new Date(year, tod.month - 1, tod.day);
      assert.strictEqual(d.getDay(), 6, `Тодоровден ${year}: expected Saturday, got day ${d.getDay()}`);
    }
  });
});

describe('getMoveableEntries', () => {
  it('returns NameDayEntry objects with resolved dates', () => {
    const entries = getMoveableEntries(2026);
    assert.ok(entries.length > 0);

    for (const e of entries) {
      assert.ok(typeof e.name === 'string');
      assert.ok(Array.isArray(e.variants));
      assert.ok(Array.isArray(e.latin));
      assert.ok(e.month >= 1 && e.month <= 12);
      assert.ok(e.day >= 1 && e.day <= 31);
      assert.ok(typeof e.holiday === 'string');
      assert.ok(typeof e.moveable === 'string');
    }
  });

  it('Цветница entries have correct date for 2026', () => {
    const entries = getMoveableEntries(2026);
    const tsvetEntries = entries.filter((e) => e.moveable === 'tsvetnitsa');
    assert.ok(tsvetEntries.length > 30, `Expected 30+ Цветница entries, got ${tsvetEntries.length}`);
    for (const e of tsvetEntries) {
      assert.strictEqual(e.month, 4);
      assert.strictEqual(e.day, 5);
    }
  });

  it('different year produces different dates for same entries', () => {
    const e2026 = getMoveableEntries(2026);
    const e2027 = getMoveableEntries(2027);
    const vel2026 = e2026.find((e) => e.moveable === 'velikden');
    const vel2027 = e2027.find((e) => e.moveable === 'velikden');
    // 2026: April 12, 2027: May 2
    assert.strictEqual(vel2026.month, 4);
    assert.strictEqual(vel2026.day, 12);
    assert.strictEqual(vel2027.month, 5);
    assert.strictEqual(vel2027.day, 2);
  });
});

describe('resolveMoveableDate', () => {
  it('returns original date for non-moveable entry', () => {
    const entry = { month: 5, day: 6, moveable: null };
    const result = resolveMoveableDate(entry, 2026);
    assert.deepStrictEqual(result, { month: 5, day: 6 });
  });

  it('resolves moveable entry to correct year', () => {
    const entry = { month: 0, day: 0, moveable: 'velikden' };
    const result = resolveMoveableDate(entry, 2026);
    assert.deepStrictEqual(result, { month: 4, day: 12 });
  });
});
