import { test } from 'node:test';
import assert from 'node:assert/strict';
import { escapeCSVField, rowsToCSV } from './csv.ts';
import { formatMoney } from '../format/currency.ts';

test('escapeCSVField - simple field', () => {
  const result = escapeCSVField('hello');
  assert.equal(result, 'hello');
});

test('escapeCSVField - field with comma', () => {
  const result = escapeCSVField('hello, world');
  assert.equal(result, '"hello, world"');
});

test('escapeCSVField - field with quotes', () => {
  const result = escapeCSVField('say "hello"');
  assert.equal(result, '"say ""hello"""');
});

test('escapeCSVField - field with newline', () => {
  const result = escapeCSVField('line1\nline2');
  assert.equal(result, '"line1\nline2"');
});

test('escapeCSVField - field with accents', () => {
  const result = escapeCSVField('Café à Paris');
  assert.equal(result, 'Café à Paris');
});

test('escapeCSVField - field with comma and quotes', () => {
  const result = escapeCSVField('Product "A", brand');
  assert.equal(result, '"Product ""A"", brand"');
});

test('rowsToCSV - simple data', () => {
  const rows = [
    ['Name', 'Age'],
    ['Alice', '30'],
    ['Bob', '25'],
  ];
  const result = rowsToCSV(rows);
  assert.equal(result, 'Name,Age\nAlice,30\nBob,25');
});

test('rowsToCSV - data with commas and quotes', () => {
  const rows = [
    ['Product', 'Description'],
    ['Item "A"', 'Nice, clean product'],
  ];
  const result = rowsToCSV(rows);
  assert.equal(result, 'Product,Description\n"Item ""A""","Nice, clean product"');
});

test('formatMoney - millimes to TND', () => {
  const result = formatMoney(129000);
  // formatMoney divides by 1000 internally and adds thousands separator
  assert.equal(result, '129 000 TND');
});

test('formatMoney - zero', () => {
  const result = formatMoney(0);
  assert.equal(result, '0 TND');
});

test('formatMoney - negative', () => {
  const result = formatMoney(-5000);
  assert.equal(result, '-5 000 TND');
});
