import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { normalize, formatDate, extractYear } from '../src/normalize.js';

describe('normalize', () => {
  it('lowercases Cyrillic text', () => {
    assert.strictEqual(normalize('Георги'), 'георги');
  });

  it('lowercases Latin text', () => {
    assert.strictEqual(normalize('Georgi'), 'georgi');
  });

  it('trims whitespace', () => {
    assert.strictEqual(normalize('  Георги  '), 'георги');
  });

  it('returns empty string for null', () => {
    assert.strictEqual(normalize(null), '');
  });

  it('returns empty string for undefined', () => {
    assert.strictEqual(normalize(undefined), '');
  });

  it('returns empty string for empty string', () => {
    assert.strictEqual(normalize(''), '');
  });

  it('returns empty string for non-string input', () => {
    assert.strictEqual(normalize(42), '');
  });

  it('handles mixed case', () => {
    assert.strictEqual(normalize('ГЕОРГИ'), 'георги');
  });
});

describe('formatDate', () => {
  it('passes through valid MM-DD string', () => {
    assert.strictEqual(formatDate('05-06'), '05-06');
  });

  it('formats Date object to MM-DD', () => {
    assert.strictEqual(formatDate(new Date(2026, 4, 6)), '05-06');
  });

  it('returns null for null input', () => {
    assert.strictEqual(formatDate(null), null);
  });

  it('returns null for invalid string', () => {
    assert.strictEqual(formatDate('invalid'), null);
  });

  it('returns null for invalid Date', () => {
    assert.strictEqual(formatDate(new Date('invalid')), null);
  });

  it('handles January correctly', () => {
    assert.strictEqual(formatDate(new Date(2026, 0, 1)), '01-01');
  });

  it('handles December 31 correctly', () => {
    assert.strictEqual(formatDate(new Date(2026, 11, 31)), '12-31');
  });

  it('parses ISO date string', () => {
    const result = formatDate('2026-05-06');
    assert.ok(result === '05-06' || result === '05-05', 'Should parse ISO date');
  });
});

describe('extractYear', () => {
  it('extracts year from Date object', () => {
    assert.strictEqual(extractYear(new Date(2026, 4, 6)), 2026);
  });

  it('extracts year from ISO string', () => {
    assert.strictEqual(extractYear('2026-05-06'), 2026);
  });

  it('returns current year for invalid input', () => {
    const currentYear = new Date().getFullYear();
    assert.strictEqual(extractYear('invalid'), currentYear);
  });
});
