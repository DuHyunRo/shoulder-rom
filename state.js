/**
 * Shared swap state — which arm is the "affected" (highlighted) side.
 *
 * Default: 'right' (right arm affected — most common for frozen shoulder).
 * Persisted to localStorage so it survives page reloads.
 *
 * Imported by: overlay.js, storage.js, progress.js, today.js
 */

const SIDE_KEY = 'shoulderrom_affected_side';

function _load() {
  try {
    const v = localStorage.getItem(SIDE_KEY);
    return (v === 'left' || v === 'right') ? v : 'right';
  } catch {
    return 'right';
  }
}

let affectedSide = _load();

export function getAffectedSide() {
  return affectedSide;
}

export function setAffectedSide(side) {
  if (side !== 'left' && side !== 'right') return;
  affectedSide = side;
  try { localStorage.setItem(SIDE_KEY, side); } catch { /* private browsing */ }
}

export function toggleSwap() {
  setAffectedSide(affectedSide === 'right' ? 'left' : 'right');
  return affectedSide;
}

/** True if `side` ('left'|'right') is currently the affected side. */
export function isAffected(side) {
  return side === affectedSide;
}
