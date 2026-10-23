// Main Application and Screen Flow Orchestrator for Huli Meke

import { renderBoardSVG } from './board-view.js';
import { initSetupScreens, onModeChanged, renderBoardPicker, updateCustomUI } from './setup-screens.js';

export const appState = {
  currentScreen: 'screen-home',
  boards: [],
  selectedMode: 'standard', // 'standard', 'mini', 'custom'
  selectedBoardId: 'classic',
  boardTab: 'full', // 'full' or 'mini'
  customConfig: {
    tigers: 3,
    goats: 15,
    target: 5
  },
  opponent: {
    type: 'ai', // 'ai' or 'human'
    humanSide: 'T', // 'T', 'G', or 'random'
    difficulty: 'medium' // 'easy', 'medium', 'hard'
  }
};

export function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const target = document.getElementById(screenId);
  if (target) {
    target.classList.add('active');
    appState.currentScreen = screenId;
    window.scrollTo(0, 0);

    if (screenId === 'screen-board') {
      renderBoardPicker(appState);
    } else if (screenId === 'screen-custom') {
      updateCustomUI(appState);
    }
  }
}

export function showModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add('active');
}

export function hideModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('active');
}

export async function initApp() {
  // 1. Fetch Board definitions
  try {
    const res = await fetch('data/boards.json');
    appState.boards = await res.json();
  } catch (err) {
    console.error('Failed to load board data:', err);
    return;
  }

  // 2. Render Home Classic Board Preview
  const classic = appState.boards.find(b => b.id === 'classic');
  const homeBox = document.getElementById('home-preview-box');
  if (classic && homeBox) {
    const pieces = {};
    classic.tigerStart.forEach(t => pieces[t] = 'T');
    homeBox.innerHTML = renderBoardSVG(classic, { pieces, size: 200 });
  }

  // 3. Navigation wiring
  document.querySelectorAll('[data-back]').forEach(btn => {
    btn.addEventListener('click', () => {
      showScreen(btn.dataset.back);
    });
  });

  document.getElementById('btn-home-play')?.addEventListener('click', () => {
    showScreen('screen-mode');
  });

  document.getElementById('btn-home-tutorial')?.addEventListener('click', () => {
    showScreen('screen-tutorial');
  });

  document.getElementById('btn-home-stats')?.addEventListener('click', () => {
    showScreen('screen-stats');
  });

  document.getElementById('btn-home-settings')?.addEventListener('click', () => {
    showScreen('screen-settings');
  });

  // Step 7 Continuations
  document.getElementById('btn-mode-continue')?.addEventListener('click', () => {
    showScreen('screen-board');
  });

  document.getElementById('btn-board-continue')?.addEventListener('click', () => {
    if (appState.selectedMode === 'custom') {
      showScreen('screen-custom');
    } else {
      showScreen('screen-opponent');
    }
  });

  document.getElementById('btn-custom-continue')?.addEventListener('click', () => {
    showScreen('screen-opponent');
  });

  document.getElementById('btn-opponent-back')?.addEventListener('click', () => {
    if (appState.selectedMode === 'custom') {
      showScreen('screen-custom');
    } else {
      showScreen('screen-board');
    }
  });

  // Setup Screen Components
  initSetupScreens(appState, (board) => {
    if (appState.selectedMode === 'custom') {
      updateCustomUI(appState);
    }
  });

  // Opponent Screen Wiring
  initOpponentScreen();
}

function initOpponentScreen() {
  const pillAi = document.getElementById('pill-opp-ai');
  const pillHuman = document.getElementById('pill-opp-human');
  const aiPanel = document.getElementById('ai-options-panel');
  const humanPanel = document.getElementById('human-options-panel');

  pillAi?.addEventListener('click', () => {
    pillAi.classList.add('on');
    pillHuman.classList.remove('on');
    aiPanel.style.display = 'flex';
    humanPanel.style.display = 'none';
    appState.opponent.type = 'ai';
  });

  pillHuman?.addEventListener('click', () => {
    pillHuman.classList.add('on');
    pillAi.classList.remove('on');
    aiPanel.style.display = 'none';
    humanPanel.style.display = 'block';
    appState.opponent.type = 'human';
  });

  // Side choice pills
  document.querySelectorAll('.side-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.side-pill').forEach(p => p.classList.remove('on'));
      pill.classList.add('on');
      appState.opponent.humanSide = pill.dataset.side;
    });
  });

  // Difficulty pills
  document.querySelectorAll('.diff-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.diff-pill').forEach(p => p.classList.remove('on'));
      pill.classList.add('on');
      appState.opponent.difficulty = pill.dataset.diff;
    });
  });
}

// Auto-run when DOM is ready
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    initApp();
  });
}
