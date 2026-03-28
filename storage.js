/**
 * localStorage read/write for ROM sessions.
 *
 * Schema (key: "shoulderrom_sessions", JSON array):
 * {
 *   timestamp:    number  — ms since epoch
 *   label:        string  — "Week 1" / "Today" etc.
 *   leftMax:      number  — max angle recorded for left arm (°)
 *   rightMax:     number  — max angle recorded for right arm (°)
 *   deficit:      number  — |leftMax - rightMax|
 *   affectedSide: string  — "left"|"right" at time of save
 *   motionType:   string  — "flexion" (extensible post-hackathon)
 * }
 */

import { getAffectedSide } from './state.js';

const KEY          = 'shoulderrom_sessions';
const MAX_SESSIONS = 10;
const TARGET       = 120; // frozen shoulder protocol target (°)

const SEED = [
  { timestamp: 1741219200000, label: 'Week 1', leftMax: 145, rightMax: 45,  deficit: 100, affectedSide: 'right', motionType: 'flexion' },
  { timestamp: 1741824000000, label: 'Week 2', leftMax: 144, rightMax: 62,  deficit: 82,  affectedSide: 'right', motionType: 'flexion' },
  { timestamp: 1742428800000, label: 'Week 3', leftMax: 146, rightMax: 75,  deficit: 71,  affectedSide: 'right', motionType: 'flexion' },
];

/** Call once on app start. Seeds demo data if storage is empty. */
export function initStorage() {
  if (localStorage.getItem(KEY) !== null) return;
  try {
    localStorage.setItem(KEY, JSON.stringify(SEED));
  } catch (e) {
    console.warn('localStorage seed failed:', e);
  }
}

export function getSessions() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}

/**
 * Save a session. Returns true on success, false if storage quota exceeded.
 * Callers should show an error if false is returned.
 */
export function saveSession(leftMax, rightMax) {
  const sessions = getSessions();
  const affectedSide = getAffectedSide();

  const entry = {
    timestamp:    Date.now(),
    label:        'Today',
    leftMax:      Math.round(leftMax),
    rightMax:     Math.round(rightMax),
    deficit:      Math.abs(Math.round(leftMax) - Math.round(rightMax)),
    affectedSide,
    motionType:   'flexion',
  };

  sessions.push(entry);
  if (sessions.length > MAX_SESSIONS) sessions.shift(); // drop oldest

  try {
    localStorage.setItem(KEY, JSON.stringify(sessions));
    return true;
  } catch (e) {
    showToast('Could not save — storage full');
    return false;
  }
}

export function clearSessions() {
  localStorage.removeItem(KEY);
}

// ── Internal ──────────────────────────────────────────────────────────

function showToast(msg) {
  const el = document.createElement('div');
  el.textContent = msg;
  el.style.cssText = [
    'position:fixed', 'bottom:60px', 'left:50%', 'transform:translateX(-50%)',
    'background:#333', 'color:#fff', 'padding:8px 16px', 'border-radius:8px',
    'font-size:13px', 'z-index:9999', 'pointer-events:none',
  ].join(';');
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3000);
}
