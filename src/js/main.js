// Main UI and Navigation Controller for Huli Meke

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

// Initialize navigation listeners
export function initNavigation() {
  // Generic back buttons with data-back
  document.querySelectorAll('[data-back]').forEach(btn => {
    btn.addEventListener('click', () => {
      showScreen(btn.dataset.back);
    });
  });

  // Home screen buttons
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
}

// Auto-init on page load
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    initNavigation();
  });
}
