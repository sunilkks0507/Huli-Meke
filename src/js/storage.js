// LocalStorage persistence for Settings and Statistics
// Strictly adheres to MASTER_SPEC.md section 7.6

const SETTINGS_KEY = 'hm_settings_v1';
const STATS_KEY = 'hm_stats_v1';

const DEFAULT_SETTINGS = {
  sound: true,
  hints: true
};

const DEFAULT_STATS = {
  'standard-tiger': { played: 0, won: 0 },
  'standard-goat': { played: 0, won: 0 },
  'mini-tiger': { played: 0, won: 0 },
  'mini-goat': { played: 0, won: 0 },
  'custom-tiger': { played: 0, won: 0 },
  'custom-goat': { played: 0, won: 0 }
};

export function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    // Storage quota or privacy restriction
  }
}

export function loadStats() {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return JSON.parse(JSON.stringify(DEFAULT_STATS));
    return { ...DEFAULT_STATS, ...JSON.parse(raw) };
  } catch (e) {
    return JSON.parse(JSON.stringify(DEFAULT_STATS));
  }
}

export function saveStats(stats) {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch (e) {
    // Ignore storage failure
  }
}

export function recordGameResult(mode, humanSide, winner) {
  const stats = loadStats();
  const sideKey = humanSide === 'T' ? 'tiger' : 'goat';
  const key = `${mode}-${sideKey}`;

  if (stats[key]) {
    stats[key].played++;
    if (winner === humanSide) {
      stats[key].won++;
    }
    saveStats(stats);
  }
  return stats;
}

export function resetAllStats() {
  const stats = JSON.parse(JSON.stringify(DEFAULT_STATS));
  saveStats(stats);
  return stats;
}
