import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getUpcomingNameDays } from '../src/upcoming.js';

describe('getUpcomingNameDays', () => {
  it('returns upcoming name days', () => {
    const results = getUpcomingNameDays(30, new Date(2026, 0, 1)); // Jan 1
    assert.ok(results.length > 0);
  });

  it('first result on Jan 1 is Васильовден', () => {
    const results = getUpcomingNameDays(1, new Date(2026, 0, 1));
    assert.ok(results.length > 0);
    assert.strictEqual(results[0].month, 1);
    assert.strictEqual(results[0].day, 1);
    assert.ok(results[0].holiday.includes('Васильовден'));
    assert.ok(results[0].names.includes('Васил'));
  });

  it('results include both primary names and variants', () => {
    const results = getUpcomingNameDays(7, new Date(2026, 0, 1));
    // Jan 1 = Васильовден
    const jan1 = results.find((r) => r.month === 1 && r.day === 1);
    assert.ok(jan1);
    assert.ok(jan1.names.includes('Васил'));
    assert.ok(jan1.names.includes('Василка'));
  });

  it('results are sorted by date', () => {
    const results = getUpcomingNameDays(30, new Date(2026, 0, 1));
    for (let i = 1; i < results.length; i++) {
      const prev = results[i - 1].month * 100 + results[i - 1].day;
      const curr = results[i].month * 100 + results[i].day;
      assert.ok(curr >= prev, `Results not sorted: ${results[i - 1].month}-${results[i - 1].day} > ${results[i].month}-${results[i].day}`);
    }
  });

  it('handles year boundary (December → January)', () => {
    const results = getUpcomingNameDays(10, new Date(2026, 11, 28)); // Dec 28
    assert.ok(results.length > 0);
    // Should include some January dates
    const janResults = results.filter((r) => r.month === 1);
    assert.ok(janResults.length > 0, 'Should include January entries after year boundary');
  });

  it('includes moveable dates within range', () => {
    // Цветница 2026 = April 5
    const results = getUpcomingNameDays(7, new Date(2026, 3, 1)); // April 1
    const tsvetnitsa = results.find((r) => r.month === 4 && r.day === 5 && r.holiday.includes('Цветница'));
    assert.ok(tsvetnitsa, 'Should find Цветница on April 5');
    assert.ok(tsvetnitsa.names.includes('Цветан'));
  });

  it('returns empty array for invalid days', () => {
    assert.deepStrictEqual(getUpcomingNameDays(0), []);
    assert.deepStrictEqual(getUpcomingNameDays(-1), []);
    assert.deepStrictEqual(getUpcomingNameDays(null), []);
  });

  it('names are deduplicated', () => {
    const results = getUpcomingNameDays(1, new Date(2026, 0, 1));
    for (const r of results) {
      const unique = [...new Set(r.names)];
      assert.strictEqual(r.names.length, unique.length, `Duplicate names in ${r.holiday}`);
    }
  });

  it('uses today as default start date', () => {
    const results = getUpcomingNameDays(30);
    assert.ok(Array.isArray(results));
  });

  it('handles invalid start date gracefully', () => {
    const results = getUpcomingNameDays(7, new Date('invalid'));
    assert.ok(Array.isArray(results));
  });
});
