// In-Game Controller: HUD, User Interaction, Turn Engine, Undo, Pause & Result
// Integrates with Web Worker AI Service and Hint highlights

import { buildBoardGraph, createGameState, getLegalMoves, applyMove, undoMove } from './engine.js';
import { renderBoardSVG, attachBoardInteraction } from './board-view.js';
import { showScreen } from './main.js';
import { requestAIMove, requestHint } from './ai-service.js';
import { playSound } from './sound.js';
import { loadSettings, recordGameResult } from './storage.js';

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
    this.isAiThinking = false;
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
    this.isAiThinking = false;

    // Title in top bar
    const modeTitle = document.getElementById('game-mode-title');
    if (modeTitle) {
      modeTitle.textContent = appState.selectedMode.charAt(0).toUpperCase() + appState.selectedMode.slice(1);
    }

    showScreen('screen-game');
    this.initInteraction();
    this.updateUI();

    this.triggerTurn();
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

    if (this.isAiThinking) {
      const noteEl = document.getElementById('game-toast-note');
      if (noteEl) noteEl.textContent = 'Computer is thinking, please wait...';
      return;
    }

    if (this.appState.opponent.type === 'ai' && this.isComputerTurn()) {
      const isMini = this.appState.selectedMode === 'mini';
      const humanSide = this.appState.opponent.resolvedHumanSide || this.appState.opponent.humanSide;
      const humanRole = humanSide === 'T' ? 'Tiger' : (isMini ? 'Lamb' : 'Goat');
      const noteEl = document.getElementById('game-toast-note');
      if (noteEl) {
        noteEl.textContent = `Computer's turn. You play as ${humanRole}.`;
      }
      return;
    }

    const { pieces, turn, phase } = this.state;

    // 1. EXTRA TIGER SETUP PHASE
    if (phase === 'setup' && turn === 'T') {
      const legalMoves = getLegalMoves(this.state, this.graph);
      const move = legalMoves.find(m => m.type === 'place' && m.to === nodeId);
      if (move) {
        this.executeMove(move);
        return;
      }
    }

    // 2. GOAT PLACING PHASE
    if (phase === 'placing' && turn === 'G') {
      const legalMoves = getLegalMoves(this.state, this.graph);
      const move = legalMoves.find(m => m.type === 'place' && m.to === nodeId);
      if (move) {
        this.executeMove(move);
        return;
      }
    }

    // 3. MOVING TURN (Either Tiger in placing/moving, or Goat in moving)
    // Tapping own piece -> select / change selection
    if (pieces[nodeId] === turn) {
      if (this.selectedNode === nodeId) {
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

    // Tapping a destination spot
    const legalMoves = getLegalMoves(this.state, this.graph);

    // Case A: A piece is already selected
    if (this.selectedNode && this.legalDestinations.includes(nodeId)) {
      const move = legalMoves.find(m => m.from === this.selectedNode && m.to === nodeId);
      if (move) {
        this.executeMove(move);
        return;
      }
    }

    // Case B: Direct tap on a green destination spot when only one piece can reach it
    const matchingMoves = legalMoves.filter(m => m.to === nodeId);
    if (matchingMoves.length === 1) {
      this.executeMove(matchingMoves[0]);
      return;
    }

    // Tapping elsewhere clears selection
    if (this.selectedNode) {
      this.selectedNode = null;
      this.legalDestinations = [];
      this.updateUI();
    }
  }

  executeMove(move) {
    const settings = loadSettings();
    if (move.type === 'jump') {
      playSound('capture', settings.sound);
    } else if (move.type === 'place') {
      playSound('place', settings.sound);
    } else if (move.type === 'step') {
      playSound('move', settings.sound);
    }

    applyMove(this.state, move, this.graph);
    this.selectedNode = null;
    this.legalDestinations = [];
    this.hintActive = false;
    this.hintNodes = [];
    this.updateUI();

    if (this.state.winner) {
      if (this.appState.opponent.type === 'ai') {
        const humanSide = this.appState.opponent.resolvedHumanSide || this.appState.opponent.humanSide;
        recordGameResult(this.appState.selectedMode, humanSide, this.state.winner);
        if (this.state.winner === humanSide) {
          playSound('win', settings.sound);
        } else if (this.state.winner !== 'draw') {
          playSound('lose', settings.sound);
        }
      } else {
        playSound('win', settings.sound);
      }
      setTimeout(() => this.showResultScreen(), 400);
      return;
    }

    this.triggerTurn();
  }

  triggerTurn() {
    if (this.state.winner) return;

    if (this.appState.opponent.type === 'ai' && this.isComputerTurn()) {
      this.isAiThinking = true;
      this.updateUI();

      requestAIMove(this.state, this.graph, this.appState.opponent.difficulty, 400).then(move => {
        this.isAiThinking = false;
        if (move && !this.state.winner) {
          this.executeMove(move);
        } else {
          this.updateUI();
        }
      });
    }
  }

  isComputerTurn() {
    if (this.appState.opponent.type !== 'ai') return false;
    const { turn } = this.state;
    const humanSide = this.appState.opponent.resolvedHumanSide || this.appState.opponent.humanSide;
    return turn !== humanSide;
  }

  handleUndo() {
    if (this.isAiThinking || !this.state || this.state.history.length === 0) return;

    if (this.appState.opponent.type === 'ai') {
      const humanSide = this.appState.opponent.resolvedHumanSide || this.appState.opponent.humanSide;
      const hasHumanMove = this.state.history.some(h => h.move.piece === humanSide);
      if (!hasHumanMove) return;

      if (this.state.turn === humanSide) {
        undoMove(this.state); // undo computer
        undoMove(this.state); // undo human
      } else {
        undoMove(this.state); // undo human
      }
    } else {
      undoMove(this.state);
    }

    this.selectedNode = null;
    this.legalDestinations = [];
    this.updateUI();
  }

  handleHint() {
    if (this.isAiThinking || this.state.winner || this.isComputerTurn()) return;

    requestHint(this.state, this.graph).then(move => {
      if (!move) return;
      this.hintNodes = [move.from, move.to].filter(Boolean);
      this.updateUI();

      setTimeout(() => {
        this.hintNodes = [];
        this.updateUI();
      }, 2000);
    });
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

    // HUD: Unplaced
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
        } else if (state.turn === 'G') {
          turnTextEl.textContent = state.phase === 'placing'
            ? (isMini ? 'Your turn: place a lamb' : 'Your turn: place a goat')
            : (isMini ? 'Your turn: move a lamb' : 'Your turn: move a goat');
        } else {
          turnTextEl.textContent = 'Your turn: move a tiger';
        }
      } else {
        if (state.phase === 'setup') {
          turnTextEl.textContent = 'Tigers: place a tiger';
        } else if (state.turn === 'G') {
          turnTextEl.textContent = state.phase === 'placing'
            ? (isMini ? 'Lambs: place a lamb' : 'Goats: place a goat')
            : (isMini ? 'Lambs: move a lamb' : 'Goats: move a goat');
        } else {
          turnTextEl.textContent = 'Tigers: move a tiger';
        }
      }
    }

    // Note/Toast
    const noteEl = document.getElementById('game-toast-note');
    if (noteEl) {
      if (this.selectedNode) {
        noteEl.textContent = 'Tap a green ring to move or jump';
      } else if (state.turn === 'G' && state.phase === 'placing') {
        noteEl.textContent = isMini
          ? 'Tap a green ring to place a lamb (5 lambs total).'
          : 'Tap a green ring to place a goat (15 goats total).';
      } else if (state.turn === 'T') {
        noteEl.textContent = isMini
          ? 'Tap your tiger or tap a green ring to move or jump.'
          : 'Tap a tiger to select, then tap a green ring to move or jump.';
      } else {
        noteEl.textContent = isMini ? 'Tap a lamb to see legal moves' : 'Tap a goat to see legal moves';
      }
    }

    // Board SVG
    const container = document.getElementById('game-board-container');
    if (container) {
      let legalSpots = [];
      if (!this.isComputerTurn()) {
        if (state.turn === 'G' && state.phase === 'placing') {
          const moves = getLegalMoves(state, this.graph);
          legalSpots = moves.map(m => m.to);
        } else if (this.selectedNode) {
          legalSpots = this.legalDestinations;
        } else if (state.turn === 'T') {
          // Highlight available moves for tigers
          const moves = getLegalMoves(state, this.graph);
          legalSpots = Array.from(new Set(moves.map(m => m.to)));
        }
      }

      container.innerHTML = renderBoardSVG(board, {
        pieces: state.pieces,
        legalTargets: legalSpots,
        selectedNode: this.selectedNode,
        hintNodes: this.hintNodes,
        size: 260
      });
    }

    // Undo & Hint buttons
    const undoBtn = document.getElementById('btn-game-undo');
    if (undoBtn) {
      undoBtn.disabled = this.isAiThinking || state.history.length === 0;
    }
    const hintBtn = document.getElementById('btn-game-hint');
    if (hintBtn) {
      const settings = loadSettings();
      hintBtn.disabled = !settings.hints || this.isAiThinking || this.isComputerTurn() || !!state.winner;
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
