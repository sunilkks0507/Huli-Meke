import test from 'node:test';
import assert from 'node:assert/strict';
import {
  loadSettings,
  saveSettings,
  loadStats,
  saveStats,
  recordGameResult,
  resetAllStats
} from '../src/js/storage.js';

// Setup in-memory global localStorage mock for Node test environment
const mockStorage = new Map();
global.localStorage = {
  getItem: (key) => mockStorage.get(key) || null,
  setItem: (key, val) => mockStorage.set(key, String(val)),
  removeItem: (key) => mockStorage.delete(key),
  clear: () => mockStorage.clear()
};

test('Storage: default settings and saving settings', () => {
  mockStorage.clear();
  const def = loadSettings();
  assert.equal(def.sound, true);
  assert.equal(def.hints, true);

  saveSettings({ sound: false, hints: true });
  const updated = loadSettings();
  assert.equal(updated.sound, false);
  assert.equal(updated.hints, true);
});

test('Storage: default stats and recording results', () => {
  mockStorage.clear();
  const stats = loadStats();
  assert.equal(stats['standard-tiger'].played, 0);
  assert.equal(stats['standard-tiger'].won, 0);

  // Human won as Tiger on Standard
  recordGameResult('standard', 'T', 'T');
  let current = loadStats();
  assert.equal(current['standard-tiger'].played, 1);
  assert.equal(current['standard-tiger'].won, 1);

  // Human lost as Goat on Mini
  recordGameResult('mini', 'G', 'T');
  current = loadStats();
  assert.equal(current['mini-goat'].played, 1);
  assert.equal(current['mini-goat'].won, 0);

  // Reset all stats
  resetAllStats();
  const reset = loadStats();
  assert.equal(reset['standard-tiger'].played, 0);
  assert.equal(reset['mini-goat'].played, 0);
});
