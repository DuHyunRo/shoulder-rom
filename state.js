/**
 * Shared swap state — which arm is the "affected" (highlighted) side.
 *
 * Default: 'right' (right arm affected — most common for frozen shoulder).
 * The Swap button flips this. Persisted in memory only (per session).
 *
 * Imported by: overlay.js, storage.js, progress.js
 */

let affectedSide = 'right';

export function getAffectedSide() {
  return affectedSide;
}

export function toggleSwap() {
  affectedSide = affectedSide === 'right' ? 'left' : 'right';
  return affectedSide;
}

/** True if `side` ('left'|'right') is currently the affected side. */
export function isAffected(side) {
  return side === affectedSide;
}
