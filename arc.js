/**
 * Time-based rolling window for motion arc (min/max over 3 seconds).
 *
 * Uses performance.now() timestamps — stable across variable frame rates.
 * Mobile browsers can drop to 10-15fps; a 3s time window always covers
 * a full arm raise regardless of frame rate.
 *
 * Confidence filter: frames where landmark visibility < MIN_VISIBILITY
 * are skipped to reduce jitter from occluded landmarks.
 */

const WINDOW_MS     = 3000;
const MIN_VISIBILITY = 0.5;

const buffers = { left: [], right: [] };

/**
 * Push a new angle reading for `side` ('left'|'right').
 * No-ops if visibility is below threshold.
 */
export function updateArc(side, angle, visibility) {
  if (visibility < MIN_VISIBILITY) return;
  const now = performance.now();
  buffers[side].push({ angle, t: now });
  // Prune entries outside the 3-second window
  buffers[side] = buffers[side].filter(m => now - m.t < WINDOW_MS);
}

/**
 * Returns { min, max } for `side`, or null if no readings in window.
 */
export function getArc(side) {
  const buf = buffers[side];
  if (buf.length === 0) return null;
  let min = Infinity, max = -Infinity;
  for (const m of buf) {
    if (m.angle < min) min = m.angle;
    if (m.angle > max) max = m.angle;
  }
  return { min, max };
}

export function resetArc(side) {
  buffers[side] = [];
}
