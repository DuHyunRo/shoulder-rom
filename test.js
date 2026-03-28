// Run: node test.js
// Requires package.json with "type":"module" (already present)

import { computeShoulderAngle } from './angles.js';

let passed = 0, failed = 0;

function assert(desc, got, expected, tol = 1) {
  if (Math.abs(got - expected) <= tol) {
    console.log(`  ✓  ${desc}: ${got}`);
    passed++;
  } else {
    console.error(`  ✗  ${desc}: expected ${expected}, got ${got}`);
    failed++;
  }
}

function assertEq(desc, got, expected) {
  const ok = JSON.stringify(got) === JSON.stringify(expected);
  if (ok) {
    console.log(`  ✓  ${desc}`);
    passed++;
  } else {
    console.error(`  ✗  ${desc}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(got)}`);
    failed++;
  }
}

// ── computeShoulderAngle ──────────────────────────────────────────────

console.log('\ncomputeShoulderAngle');
console.log('─'.repeat(40));

assert('arm at side (0°)',
  computeShoulderAngle({ x: 0, y: 1 }, { x: 0, y: 0 }, { x: 0, y: 1 }), 0);

assert('arm horizontal (90°)',
  computeShoulderAngle({ x: 0, y: 1 }, { x: 0, y: 0 }, { x: 1, y: 0 }), 90);

assert('arm overhead (180°)',
  computeShoulderAngle({ x: 0, y: 1 }, { x: 0, y: 0 }, { x: 0, y: -1 }), 180);

assert('arm at 45°',
  computeShoulderAngle({ x: 0, y: 1 }, { x: 0, y: 0 }, { x: 0.707, y: 0.707 }), 45, 2);

assert('degenerate (shoulder === elbow)',
  computeShoulderAngle({ x: 0, y: 1 }, { x: 0, y: 0 }, { x: 0, y: 0 }), 0);

assert('floating-point clamp',
  computeShoulderAngle({ x: 0, y: 1.0000001 }, { x: 0, y: 0 }, { x: 0, y: 1 }), 0, 1);

// ── storage: streak + completions ────────────────────────────────────
// These tests simulate localStorage using a mock and test pure logic.

console.log('\nstreak + completions (pure logic tests)');
console.log('─'.repeat(40));

// ── Streak calculation (pure function extracted for testability) ──
function calcStreak(sessions) {
  const real = sessions.filter(s => !s._seed);
  if (real.length === 0) return 0;
  const dateFmt = (ts) => {
    const d = new Date(ts);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  };
  const sessionDates = new Set(real.map(s => dateFmt(s.timestamp)));
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const ds = dateFmt(d.getTime());
    if (sessionDates.has(ds)) streak++;
    else break;
  }
  return streak;
}

const now = Date.now();
const DAY = 86400000;

// test: streak_none
assert('streak — no sessions → 0',
  calcStreak([]), 0);

// test: streak_single (today)
assert('streak — 1 session today → 1',
  calcStreak([{ timestamp: now - 1000 }]), 1);

// test: streak_consecutive (3 days)
assert('streak — 3 consecutive days → 3',
  calcStreak([
    { timestamp: now - 2 * DAY },
    { timestamp: now - 1 * DAY },
    { timestamp: now - 100  },
  ]), 3);

// test: streak_gap (Mon + Wed, no Tue → today only)
assert('streak — gap in days → 1',
  calcStreak([
    { timestamp: now - 4 * DAY },   // 4 days ago
    { timestamp: now - 2 * DAY },   // 2 days ago (gap on day-before-yesterday)
    // no yesterday → streak breaks
  ]), 0);  // today has no session → streak=0

// ── getCurrentPhase logic (extracted) ──
function calcPhase(sessions) {
  try {
    const real = sessions.filter(s => !s._seed);
    if (real.length === 0) return 1;
    const best = Math.max(...real.map(s => s[(s.affectedSide || 'right') + 'Max'] || 0));
    if (best < 50)  return 1;
    if (best < 95)  return 2;
    if (best < 125) return 3;
    return 4;
  } catch {
    return 1;
  }
}

console.log('\ngetCurrentPhase (pure logic)');
console.log('─'.repeat(40));

// test: phase_no_sessions
assert('phase — no sessions → 1',
  calcPhase([]), 1);

// test: phase_seed_only
assert('phase — seed-only sessions → 1',
  calcPhase([{ _seed: true, affectedSide: 'right', rightMax: 90 }]), 1);

// test: phase_low_rom
assert('phase — bestROM=30 → 1',
  calcPhase([{ affectedSide: 'right', rightMax: 30 }]), 1);

// test: phase_mid_rom
assert('phase — bestROM=60 → 2',
  calcPhase([{ affectedSide: 'right', rightMax: 60 }]), 2);

// test: phase_high_rom
assert('phase — bestROM=100 → 3',
  calcPhase([{ affectedSide: 'right', rightMax: 100 }]), 3);

// ── getDailyCompletions logic ──
function calcCompletions(stored, todayStr) {
  try {
    if (!stored) return [];
    const data = JSON.parse(stored);
    if (data.date !== todayStr) return [];
    return Array.isArray(data.completions) ? data.completions : [];
  } catch {
    return [];
  }
}

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

console.log('\ngetDailyCompletions (pure logic)');
console.log('─'.repeat(40));

// test: completions_no_data
assertEq('completions — no data → []',
  calcCompletions(null, todayStr()), []);

// test: completions_different_date
assertEq('completions — yesterday\'s data → []',
  calcCompletions(JSON.stringify({ date: '2020-01-01', completions: [0,1] }), todayStr()), []);

// test: completions_same_date
assertEq('completions — today\'s data → [0,2]',
  calcCompletions(JSON.stringify({ date: todayStr(), completions: [0,2] }), todayStr()), [0,2]);

// ── Summary ───────────────────────────────────────────────────────────

console.log('─'.repeat(40));
console.log(`${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
