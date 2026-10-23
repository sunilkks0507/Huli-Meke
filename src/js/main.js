// Main Application and Screen Flow Orchestrator for Huli Meke

import { renderBoardSVG } from './board-view.js';
import { initSetupScreens, onModeChanged, renderBoardPicker, updateCustomUI } from './setup-screens.js';
import { GameController } from './game-controller.js';
import { TutorialController } from './tutorial.js';
import { loadSettings, saveSettings, loadStats, resetAllStats } from './storage.js';

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
    resolvedHumanSide: 'T',
    difficulty: 'medium' // 'easy', 'medium', 'hard'
  }
};

export let gameController = null;
export let tutorialController = null;

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
    } else if (screenId === 'screen-opponent') {
      updateOpponentUI(appState);
    } else if (screenId === 'screen-stats') {
      renderStats();
    } else if (screenId === 'screen-settings') {
      updateSettingsUI();
    }
  }
}

export function updateOpponentUI(state) {
  const isMini = state.selectedMode === 'mini';
  const goatPill = document.querySelector('.side-pill[data-side="G"]');
  if (goatPill) {
    goatPill.textContent = isMini ? 'Lamb' : 'Goat';
  }
  const humanCardNote = document.querySelector('#human-options-panel .muted');
  if (humanCardNote) {
    humanCardNote.textContent = isMini
      ? 'Pass the phone after each move. Lamb player moves first.'
      : 'Pass the phone after each move. Goat player moves first.';
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

export function showConfirmDialog({ title, message, actionLabel, onConfirm }) {
  const titleEl = document.getElementById('confirm-title');
  const msgEl = document.getElementById('confirm-message');
  const actionBtn = document.getElementById('btn-confirm-action');
  const cancelBtn = document.getElementById('btn-confirm-cancel');

  if (titleEl) titleEl.textContent = title;
  if (msgEl) msgEl.textContent = message;
  if (actionBtn) {
    actionBtn.textContent = actionLabel;
    actionBtn.onclick = () => {
      hideModal('modal-confirm');
      if (onConfirm) onConfirm();
    };
  }
  if (cancelBtn) {
    cancelBtn.onclick = () => {
      hideModal('modal-confirm');
    };
  }
  showModal('modal-confirm');
}

export function renderStats() {
  const stats = loadStats();
  const tbody = document.getElementById('stats-table-body');
  const tableCard = document.getElementById('stats-table-card');
  const emptyCard = document.getElementById('stats-empty-state');
  if (!tbody) return;

  const rows = [
    { label: 'Standard, Tiger', data: stats['standard-tiger'] },
    { label: 'Standard, Goat', data: stats['standard-goat'] },
    { label: 'Mini, Tiger', data: stats['mini-tiger'] },
    { label: 'Mini, Lamb', data: stats['mini-goat'] },
    { label: 'Custom, Tiger', data: stats['custom-tiger'] },
    { label: 'Custom, Goat', data: stats['custom-goat'] }
  ];

  const totalPlayed = rows.reduce((sum, r) => sum + (r.data?.played || 0), 0);

  if (totalPlayed === 0) {
    if (tableCard) tableCard.style.display = 'none';
    if (emptyCard) emptyCard.style.display = 'block';
  } else {
    if (tableCard) tableCard.style.display = 'block';
    if (emptyCard) emptyCard.style.display = 'none';

    tbody.innerHTML = rows.map(r => `
      <tr>
        <td>${r.label}</td>
        <td>${r.data ? r.data.played : 0}</td>
        <td>${r.data ? r.data.won : 0}</td>
      </tr>
    `).join('');
  }
}

export function updateSettingsUI() {
  const settings = loadSettings();
  const toggleSound = document.getElementById('toggle-sound');
  const toggleHints = document.getElementById('toggle-hints');

  if (toggleSound) {
    toggleSound.classList.toggle('on', !!settings.sound);
    toggleSound.setAttribute('aria-checked', String(!!settings.sound));
  }
  if (toggleHints) {
    toggleHints.classList.toggle('on', !!settings.hints);
    toggleHints.setAttribute('aria-checked', String(!!settings.hints));
  }
}

export async function initApp() {
  try {
    const res = await fetch('data/boards.json');
    appState.boards = await res.json();
  } catch (err) {
    console.error('Failed to load board data:', err);
    return;
  }

  gameController = new GameController(appState);
  tutorialController = new TutorialController(appState);

  // Home preview
  const classic = appState.boards.find(b => b.id === 'classic');
  const homeBox = document.getElementById('home-preview-box');
  if (classic && homeBox) {
    const pieces = {};
    classic.tigerStart.forEach(t => pieces[t] = 'T');
    homeBox.innerHTML = renderBoardSVG(classic, { pieces, size: 200 });
  }

  // Navigation
  document.querySelectorAll('[data-back]').forEach(btn => {
    btn.addEventListener('click', () => {
      showScreen(btn.dataset.back);
    });
  });

  document.getElementById('btn-home-play')?.addEventListener('click', () => {
    showScreen('screen-mode');
  });

  document.getElementById('btn-home-tutorial')?.addEventListener('click', () => {
    tutorialController.start();
  });

  document.getElementById('btn-tutorial-back')?.addEventListener('click', () => {
    tutorialController.back();
  });

  document.getElementById('btn-tutorial-next')?.addEventListener('click', () => {
    tutorialController.next();
  });

  document.getElementById('btn-home-stats')?.addEventListener('click', () => {
    showScreen('screen-stats');
  });

  document.getElementById('btn-stats-play')?.addEventListener('click', () => {
    showScreen('screen-mode');
  });

  document.getElementById('btn-home-settings')?.addEventListener('click', () => {
    showScreen('screen-settings');
  });

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

  initSetupScreens(appState, (board) => {
    if (appState.selectedMode === 'custom') {
      updateCustomUI(appState);
    }
  });

  initOpponentScreen();

  // In-Game Buttons
  document.getElementById('btn-opponent-start')?.addEventListener('click', () => {
    if (appState.opponent.humanSide === 'random') {
      appState.opponent.resolvedHumanSide = Math.random() < 0.5 ? 'T' : 'G';
    } else {
      appState.opponent.resolvedHumanSide = appState.opponent.humanSide;
    }
    gameController.startNewGame();
  });

  document.getElementById('btn-game-undo')?.addEventListener('click', () => {
    gameController.handleUndo();
  });

  document.getElementById('btn-game-hint')?.addEventListener('click', () => {
    gameController.handleHint();
  });

  document.getElementById('btn-game-pause')?.addEventListener('click', () => {
    showModal('modal-pause');
  });

  document.getElementById('btn-pause-resume')?.addEventListener('click', () => {
    hideModal('modal-pause');
  });

  document.getElementById('btn-pause-restart')?.addEventListener('click', () => {
    showConfirmDialog({
      title: 'Restart game?',
      message: 'Current game progress will be lost.',
      actionLabel: 'Restart',
      onConfirm: () => {
        hideModal('modal-pause');
        gameController.startNewGame();
      }
    });
  });

  document.getElementById('btn-pause-quit')?.addEventListener('click', () => {
    showConfirmDialog({
      title: 'Quit to Home?',
      message: 'Leave this game? Progress will be lost.',
      actionLabel: 'Quit',
      onConfirm: () => {
        hideModal('modal-pause');
        showScreen('screen-home');
      }
    });
  });

  document.getElementById('btn-result-again')?.addEventListener('click', () => {
    gameController.startNewGame();
  });

  document.getElementById('btn-result-home')?.addEventListener('click', () => {
    showScreen('screen-home');
  });

  // Settings Toggles & Reset
  document.getElementById('toggle-sound')?.addEventListener('click', () => {
    const s = loadSettings();
    s.sound = !s.sound;
    saveSettings(s);
    updateSettingsUI();
  });

  document.getElementById('toggle-hints')?.addEventListener('click', () => {
    const s = loadSettings();
    s.hints = !s.hints;
    saveSettings(s);
    updateSettingsUI();
  });

  document.getElementById('btn-settings-reset')?.addEventListener('click', () => {
    showConfirmDialog({
      title: 'Reset all stats?',
      message: 'This cannot be undone.',
      actionLabel: 'Reset',
      onConfirm: () => {
        resetAllStats();
      }
    });
  });
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

  document.querySelectorAll('.side-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.side-pill').forEach(p => p.classList.remove('on'));
      pill.classList.add('on');
      appState.opponent.humanSide = pill.dataset.side;
    });
  });

  document.querySelectorAll('.diff-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.diff-pill').forEach(p => p.classList.remove('on'));
      pill.classList.add('on');
      appState.opponent.difficulty = pill.dataset.diff;
    });
  });
}

if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    initApp();
  });
}
