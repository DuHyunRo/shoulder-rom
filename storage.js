/**
 * localStorage read/write for ROM sessions, streak, and daily completions.
 *
 * Session schema (key: "shoulderrom_sessions", JSON array):
 * {
 *   timestamp:    number  — ms since epoch
 *   label:        string  — "Week 1" / "오늘" etc.
 *   leftMax:      number  — max angle recorded for left arm (°)
 *   rightMax:     number  — max angle recorded for right arm (°)
 *   deficit:      number  — |leftMax - rightMax|
 *   affectedSide: string  — "left"|"right" at time of save
 *   motionType:   string  — "flexion"
 * }
 *
 * Daily completions schema (key: "shoulderrom_completions"):
 * { date: "2026-03-28", completions: [0, 2] }   — indices of completed exercises
 *
 * All localStorage access is wrapped in try/catch for private-browsing Safari.
 */

import { getAffectedSide } from './state.js';

const KEY          = 'shoulderrom_sessions';
const COMP_KEY     = 'shoulderrom_completions';
const MAX_SESSIONS = 10;

const SEED = [
  { timestamp: 1741219200000, label: '1주차', leftMax: 145, rightMax: 45,  deficit: 100, affectedSide: 'right', motionType: 'flexion', _seed: true },
  { timestamp: 1741824000000, label: '2주차', leftMax: 144, rightMax: 62,  deficit: 82,  affectedSide: 'right', motionType: 'flexion', _seed: true },
  { timestamp: 1742428800000, label: '3주차', leftMax: 146, rightMax: 75,  deficit: 71,  affectedSide: 'right', motionType: 'flexion', _seed: true },
];

// ── localStorage safety wrapper ────────────────────────────────────────

function lsGet(key, fallback = null) {
  try { return localStorage.getItem(key); } catch { return fallback; }
}

function lsSet(key, value) {
  try { localStorage.setItem(key, value); return true; } catch { return false; }
}

function lsRemove(key) {
  try { localStorage.removeItem(key); } catch { /* ignore */ }
}

// ── Session API ────────────────────────────────────────────────────────

/** Call once on app start. Seeds demo data if storage is empty. */
export function initStorage() {
  if (lsGet(KEY) !== null) return;
  lsSet(KEY, JSON.stringify(SEED));
}

export function getSessions() {
  try {
    return JSON.parse(lsGet(KEY, '[]') || '[]');
  } catch {
    return [];
  }
}

/**
 * Save a session. Returns true on success.
 * Callers should show an error if false is returned.
 */
export function saveSession(leftMax, rightMax) {
  const sessions = getSessions();
  const affectedSide = getAffectedSide();
  const now = Date.now();

  const entry = {
    timestamp:    now,
    label:        '오늘',
    leftMax:      Math.round(leftMax),
    rightMax:     Math.round(rightMax),
    deficit:      Math.abs(Math.round(leftMax) - Math.round(rightMax)),
    affectedSide,
    motionType:   'flexion',
  };

  sessions.push(entry);
  if (sessions.length > MAX_SESSIONS) sessions.shift(); // drop oldest

  if (!lsSet(KEY, JSON.stringify(sessions))) {
    showStorageToast();
    return false;
  }
  return true;
}

export function clearSessions() {
  lsRemove(KEY);
}

// ── Streak API ─────────────────────────────────────────────────────────

/**
 * Returns the number of consecutive calendar days (ending today) with a saved session.
 * Uses real sessions only (not seed data).
 */
export function getStreak() {
  const sessions = getSessions().filter(s => !s._seed);
  if (sessions.length === 0) return 0;

  // Build a set of unique date strings for sessions
  const dateFmt = (ts) => new Date(ts).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
  const sessionDates = new Set(sessions.map(s => dateFmt(s.timestamp)));

  // Count consecutive days backwards from today
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const ds = d.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
    if (sessionDates.has(ds)) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

// ── Daily Completions API ──────────────────────────────────────────────

/** Returns today's date key as YYYY-MM-DD (local time). */
function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * Returns array of completed exercise indices for today.
 * Returns [] if no data or data is from a different day.
 */
export function getDailyCompletions() {
  try {
    const raw = lsGet(COMP_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    if (data.date !== todayKey()) return [];
    return Array.isArray(data.completions) ? data.completions : [];
  } catch {
    return [];
  }
}

/**
 * Toggle completion for exercise at `index` in today's session.
 * Returns updated completions array.
 */
export function toggleExerciseComplete(index) {
  const current = getDailyCompletions();
  const i = current.indexOf(index);
  const updated = i >= 0 ? current.filter(x => x !== index) : [...current, index];
  lsSet(COMP_KEY, JSON.stringify({ date: todayKey(), completions: updated }));
  return updated;
}

// ── Internal ──────────────────────────────────────────────────────────

function showStorageToast() {
  const el = document.getElementById('toast');
  if (el) {
    el.textContent = '저장 실패 — 다시 시도해주세요';
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 3000);
  }
}
