// In-Game Controller: HUD, User Interaction, Turn Engine, Undo, Pause & Result
// Strictly adheres to MASTER_SPEC.md sections 5.1, 5.2, 7.3

import { buildBoardGraph, createGameState, getLegalMoves, applyMove, undoMove, checkStatus } from './engine.js';
import { renderBoardSVG, attachBoardInteraction } from './board-view.js';
import { showScreen, showModal, hideModal } from './main.js';

export class GameController {
  constructor(appState) {
    this.appState = appState;
    this.board = null;
    this.graph = null;
    this.state = null;
    this.selectedNode = null;
    this.legalDestinations = [];
    this.detachInteraction = null;
    this.hintActive = false;
    this.hintNodes = [];
  }

  startNewGame() {
    const { appState } = this;
    const board = appState.boards.find(b => b.id === appState.selectedBoardId) || appState.boards[0];
    this.board = board;
    this.graph = buildBoardGraph(board);

    let tigers, goats, target;
    if (appState.selectedMode === 'standard') {
      tigers = 3;
      goats = 15;
      target = 5;
    } else if (appState.selectedMode === 'mini') {
      tigers = 1;
      goats = 5;
      target = 2;
    } else {
      tigers = appState.customConfig.tigers;
      goats = appState.customConfig.goats;
      target = appState.customConfig.target;
    }

    this.state = createGameState(board, { tigers, goats, target });
    this.selectedNode = null;
    this.legalDestinations = [];
    this.hintActive = false;
    this.hintNodes = [];

    // Title in top bar
    const modeTitle = document.getElementById('game-mode-title');
    if (modeTitle) {
      modeTitle.textContent = appState.selectedMode.charAt(0).toUpperCase() + appState.selectedMode.slice(1);
    }

    showScreen('screen-game');
    this.initInteraction();
    this.updateUI();

    // Check if initial turn belongs to AI (handled in Step 9)
    if (this.onTurnStart) this.onTurnStart();
  }

  initInteraction() {
    const container = document.getElementById('game-board-container');
    if (!container) return;

    if (this.detachInteraction) {
      this.detachInteraction();
    }

    this.detachInteraction = attachBoardInteraction(container, this.board, (nodeId) => {
      this.handlePointTap(nodeId);
    });
  }

  handlePointTap(nodeId) {
    if (this.state.winner) return;

    // In AI mode, ignore taps during AI turn
    if (this.appState.opponent.type === 'ai' && this.isComputerTurn()) {
      return;
    }

    const { pieces, turn, phase } = this.state;
    const isMini = this.appState.selectedMode === 'mini';

    // 1. PLACING or SETUP PHASE
    if (phase === 'setup' || phase === 'placing') {
      const legalMoves = getLegalMoves(this.state, this.graph);
      const move = legalMoves.find(m => m.type === 'place' && m.to === nodeId);
      if (move) {
        this.executeMove(move);
        return;
      }
    }

    // 2. MOVING PHASE
    if (phase === 'moving') {
      // If a destination point is tapped while a piece is selected
      if (this.selectedNode && this.legalDestinations.includes(nodeId)) {
        const legalMoves = getLegalMoves(this.state, this.graph, this.selectedNode);
        const move = legalMoves.find(m => m.to === nodeId);
        if (move) {
          this.executeMove(move);
          this.selectedNode = null;
          this.legalDestinations = [];
          return;
        }
      }

      // If own piece is tapped, select it or switch selection
      if (pieces[nodeId] === turn) {
        if (this.selectedNode === nodeId) {
          // Deselect
          this.selectedNode = null;
          this.legalDestinations = [];
        } else {
          this.selectedNode = nodeId;
          const moves = getLegalMoves(this.state, this.graph, nodeId);
          this.legalDestinations = moves.map(m => m.to);
        }
        this.updateUI();
        return;
      }

      // Tapping elsewhere clears selection
      if (this.selectedNode) {
        this.selectedNode = null;
        this.legalDestinations = [];
        this.updateUI();
      }
    }
  }

  executeMove(move) {
    applyMove(this.state, move, this.graph);
    this.selectedNode = null;
    this.legalDestinations = [];
    this.hintActive = false;
    this.hintNodes = [];
    this.updateUI();

    if (this.state.winner) {
      setTimeout(() => this.showResultScreen(), 400);
      return;
    }

    if (this.onTurnStart) {
      this.onTurnStart();
    }
  }

  isComputerTurn() {
    if (this.appState.opponent.type !== 'ai') return false;
    const { turn } = this.state;
    const humanSide = this.appState.opponent.resolvedHumanSide || this.appState.opponent.humanSide;
    return turn !== humanSide;
  }

  handleUndo() {
    if (!this.state || this.state.history.length === 0) return;

    if (this.appState.opponent.type === 'ai') {
      // Undo both computer's reply and human's move together
      undoMove(this.state); // undo AI
      undoMove(this.state); // undo human
    } else {
      // Two players: undo 1 move
      undoMove(this.state);
    }

    this.selectedNode = null;
    this.legalDestinations = [];
    this.updateUI();
  }

  updateUI() {
    const { state, board, appState } = this;
    const isMini = appState.selectedMode === 'mini';
    const isVsComputer = appState.opponent.type === 'ai';

    // HUD: Phase
    const hudPhase = document.getElementById('hud-phase');
    if (hudPhase) {
      hudPhase.textContent = state.phase.charAt(0).toUpperCase() + state.phase.slice(1);
    }

    // HUD: Unplaced goats/lambs
    const hudUnplaced = document.getElementById('hud-unplaced');
    const hudUnplacedLabel = document.getElementById('hud-unplaced-label');
    if (hudUnplaced) {
      hudUnplaced.textContent = state.phase === 'setup' ? state.tigersToPlace : state.goatsInHand;
    }
    if (hudUnplacedLabel) {
      if (state.phase === 'setup') {
        hudUnplacedLabel.textContent = 'Tigers to place';
      } else {
        hudUnplacedLabel.textContent = isMini ? 'Lambs to place' : 'Goats to place';
      }
    }

    // HUD: Captured
    const hudCaptured = document.getElementById('hud-captured');
    if (hudCaptured) {
      hudCaptured.textContent = `${state.goatsCaptured} / ${state.target}`;
    }

    // Turn line
    const turnTextEl = document.getElementById('game-turn-text');
    if (turnTextEl) {
      if (isVsComputer && this.isComputerTurn()) {
        turnTextEl.textContent = 'Computer is thinking…';
      } else if (isVsComputer) {
        if (state.phase === 'setup') {
          turnTextEl.textContent = 'Your turn: place a tiger';
        } else if (state.phase === 'placing') {
          turnTextEl.textContent = isMini ? 'Your turn: place a lamb' : 'Your turn: place a goat';
        } else {
          turnTextEl.textContent = state.turn === 'T' ? 'Your turn: move a tiger' : (isMini ? 'Your turn: move a lamb' : 'Your turn: move a goat');
        }
      } else {
        // Two players
        if (state.phase === 'setup') {
          turnTextEl.textContent = 'Tigers: place a tiger';
        } else if (state.phase === 'placing') {
          turnTextEl.textContent = isMini ? 'Lambs: place a lamb' : 'Goats: place a goat';
        } else {
          turnTextEl.textContent = state.turn === 'T' ? 'Tigers: move a tiger' : (isMini ? 'Lambs: move a lamb' : 'Goats: move a goat');
        }
      }
    }

    // Note/Toast under board
    const noteEl = document.getElementById('game-toast-note');
    if (noteEl) {
      if (this.selectedNode) {
        noteEl.textContent = 'Tap a green spot to move or jump';
      } else if (state.phase === 'placing') {
        noteEl.textContent = isMini ? 'Tap a green ring to place a lamb' : 'Tap a green ring to place a goat';
      } else {
        noteEl.textContent = 'Tap your piece to see legal moves';
      }
    }

    // Board SVG rendering
    const container = document.getElementById('game-board-container');
    if (container) {
      let legalSpots = [];
      if (state.phase === 'placing' || state.phase === 'setup') {
        const moves = getLegalMoves(state, this.graph);
        legalSpots = moves.map(m => m.to);
      } else if (this.selectedNode) {
        legalSpots = this.legalDestinations;
      }

      container.innerHTML = renderBoardSVG(board, {
        pieces: state.pieces,
        legalTargets: legalSpots,
        selectedNode: this.selectedNode,
        hintNodes: this.hintNodes,
        size: 260
      });
    }

    // Undo button state
    const undoBtn = document.getElementById('btn-game-undo');
    if (undoBtn) {
      undoBtn.disabled = state.history.length === 0;
    }
  }

  showResultScreen() {
    const { state, appState } = this;
    const isMini = appState.selectedMode === 'mini';
    const heroTitle = document.getElementById('result-hero-title');
    const heroSub = document.getElementById('result-hero-sub');
    const valCaptured = document.getElementById('result-val-captured');
    const valMoves = document.getElementById('result-val-moves');
    const valMode = document.getElementById('result-val-mode');
    const capturedLabel = document.getElementById('result-captured-label');

    if (capturedLabel) {
      capturedLabel.textContent = isMini ? 'Lambs captured' : 'Goats captured';
    }

    if (heroTitle && heroSub) {
      if (state.winner === 'T') {
        heroTitle.textContent = 'Tigers win!';
        heroSub.textContent = `Tigers captured ${state.goatsCaptured} ${isMini ? 'lambs' : 'goats'}`;
      } else if (state.winner === 'G') {
        heroTitle.textContent = isMini ? 'Lambs win!' : 'Goats win!';
        heroSub.textContent = 'All tigers are trapped';
      } else {
        heroTitle.textContent = 'Draw';
        heroSub.textContent = `No capture in ${state.pliesSinceCapture} moves`;
      }
    }

    if (valCaptured) valCaptured.textContent = state.goatsCaptured;
    if (valMoves) valMoves.textContent = state.totalPlies;
    if (valMode) {
      const modeName = appState.selectedMode.charAt(0).toUpperCase() + appState.selectedMode.slice(1);
      const oppName = appState.opponent.type === 'human' ? 'Two players' : (appState.opponent.difficulty.charAt(0).toUpperCase() + appState.opponent.difficulty.slice(1));
      valMode.textContent = `${modeName}, ${oppName}`;
    }

    showScreen('screen-result');
  }
}
