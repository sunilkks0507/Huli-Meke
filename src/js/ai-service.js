// AI Service Wrapper: Web Worker communication, pacing (min 400ms), and Node/fallback support

import { getBestMove, getHint } from './ai.js';

let worker = null;
let msgId = 0;
const pendingCallbacks = new Map();

function initWorker() {
  if (typeof window !== 'undefined' && window.Worker) {
    try {
      worker = new Worker('js/ai-worker.js', { type: 'module' });
      worker.onmessage = (e) => {
        const { id, move, error } = e.data;
        const cb = pendingCallbacks.get(id);
        if (cb) {
          pendingCallbacks.delete(id);
          cb(error ? null : move);
        }
      };
    } catch (e) {
      console.warn('Worker initialization failed, using main thread fallback:', e);
      worker = null;
    }
  }
}

export function requestAIMove(state, graph, level, minDelayMs = 400) {
  return new Promise((resolve) => {
    const startTime = Date.now();

    const handleResult = (move) => {
      const elapsed = Date.now() - startTime;
      const remainingDelay = Math.max(0, minDelayMs - elapsed);
      setTimeout(() => {
        resolve(move);
      }, remainingDelay);
    };

    if (!worker) initWorker();

    if (worker) {
      const id = ++msgId;
      pendingCallbacks.set(id, handleResult);
      worker.postMessage({ id, type: 'getBestMove', state, graph, level });
    } else {
      // Synchronous fallback
      setTimeout(() => {
        const move = getBestMove(state, graph, level);
        handleResult(move);
      }, 50);
    }
  });
}

export function requestHint(state, graph) {
  return new Promise((resolve) => {
    if (!worker) initWorker();

    if (worker) {
      const id = ++msgId;
      pendingCallbacks.set(id, (move) => resolve(move));
      worker.postMessage({ id, type: 'getHint', state, graph });
    } else {
      const move = getHint(state, graph);
      resolve(move);
    }
  });
}
