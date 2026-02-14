import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { searchNames, getNamesByHoliday } from '../src/search.js';

describe('searchNames', () => {
  it('finds names by Cyrillic prefix', () => {
    const results = searchNames('Гео', 2026);
    assert.ok(results.length > 0);
    const names = results.map((r) => r.name);
    assert.ok(names.includes('Георги'));
  });

  it('finds names by Latin prefix', () => {
    const results = searchNames('Geo', 2026);
    assert.ok(results.length > 0);
    const names = results.map((r) => r.name);
    assert.ok(names.includes('Георги'));
  });

  it('is case-insensitive', () => {
    const results = searchNames('гео', 2026);
    assert.ok(results.length > 0);
    const names = results.map((r) => r.name);
    assert.ok(names.includes('Георги'));
  });

  it('returns empty array for unknown prefix', () => {
    assert.deepStrictEqual(searchNames('Xyz', 2026), []);
  });

  it('returns empty array for null input', () => {
    assert.deepStrictEqual(searchNames(null), []);
  });

  it('returns empty array for empty string', () => {
    assert.deepStrictEqual(searchNames(''), []);
  });

  it('results have name, date, and holiday fields', () => {
    const results = searchNames('Васил', 2026);
    assert.ok(results.length > 0);
    for (const r of results) {
      assert.ok(typeof r.name === 'string');
      assert.ok(typeof r.date === 'string');
      assert.ok(typeof r.holiday === 'string');
      assert.ok(/^\d{2}-\d{2}$/.test(r.date));
    }
  });

  it('includes moveable names', () => {
    const results = searchNames('Цвет', 2026);
    assert.ok(results.length > 0);
    const names = results.map((r) => r.name);
    assert.ok(names.includes('Цветан'));
  });

  it('does not return duplicate entries', () => {
    const results = searchNames('Ива', 2026);
    const keys = results.map((r) => `${r.name}|${r.date}`);
    const unique = [...new Set(keys)];
    assert.strictEqual(keys.length, unique.length, 'Results should be unique');
  });
});

describe('getNamesByHoliday', () => {
  it('finds names by exact holiday name', () => {
    const names = getNamesByHoliday('Гергьовден', 2026);
    assert.ok(names.length > 0);
    assert.ok(names.includes('Георги'));
  });

  it('is case-insensitive', () => {
    const names = getNamesByHoliday('гергьовден', 2026);
    assert.ok(names.includes('Георги'));
  });

  it('partial match works', () => {
    const names = getNamesByHoliday('Герг', 2026);
    assert.ok(names.includes('Георги'));
  });

  it('includes both primary names and variants', () => {
    const names = getNamesByHoliday('Гергьовден', 2026);
    assert.ok(names.includes('Георги'));
    assert.ok(names.includes('Гошо'));
  });

  it('finds moveable holidays (Цветница)', () => {
    const names = getNamesByHoliday('Цветница', 2026);
    assert.ok(names.length > 30, `Expected 30+ names for Цветница, got ${names.length}`);
    assert.ok(names.includes('Цветан'));
    assert.ok(names.includes('Роза'));
    assert.ok(names.includes('Виолета'));
  });

  it('finds Тодоровден', () => {
    const names = getNamesByHoliday('Тодоровден', 2026);
    assert.ok(names.length > 5);
    assert.ok(names.includes('Тодор'));
    assert.ok(names.includes('Теодор'));
  });

  it('returns empty array for unknown holiday', () => {
    assert.deepStrictEqual(getNamesByHoliday('Непознат празник', 2026), []);
  });

  it('returns empty array for null input', () => {
    assert.deepStrictEqual(getNamesByHoliday(null), []);
  });

  it('returns deduplicated names', () => {
    const names = getNamesByHoliday('Гергьовден', 2026);
    const unique = [...new Set(names)];
    assert.strictEqual(names.length, unique.length, 'Names should be deduplicated');
  });
});
