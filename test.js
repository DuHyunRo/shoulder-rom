// Run: node test.js
// Requires package.json with "type":"module" (already present)

import { computeShoulderAngle } from './angles.js';

let passed = 0, failed = 0;

function assert(desc, got, expected, tol = 1) {
  if (Math.abs(got - expected) <= tol) {
    console.log(`  ✓  ${desc}: ${got}°`);
    passed++;
  } else {
    console.error(`  ✗  ${desc}: expected ${expected}°, got ${got}°`);
    failed++;
  }
}

console.log('\ncomputeShoulderAngle');
console.log('─'.repeat(40));

// Arm at side (same direction as body axis) → 0°
assert('arm at side (0°)',
  computeShoulderAngle({ x: 0, y: 1 }, { x: 0, y: 0 }, { x: 0, y: 1 }), 0);

// Arm horizontal → 90°
assert('arm horizontal (90°)',
  computeShoulderAngle({ x: 0, y: 1 }, { x: 0, y: 0 }, { x: 1, y: 0 }), 90);

// Arm overhead → 180°
assert('arm overhead (180°)',
  computeShoulderAngle({ x: 0, y: 1 }, { x: 0, y: 0 }, { x: 0, y: -1 }), 180);

// Arm at 45° → 45°  (vArm = {0.707, 0.707}, normalized same as vBody direction rotated 45°)
assert('arm at 45°',
  computeShoulderAngle({ x: 0, y: 1 }, { x: 0, y: 0 }, { x: 0.707, y: 0.707 }), 45, 2);

// Zero-length arm vector (degenerate) → 0° (no crash)
assert('degenerate (shoulder === elbow)',
  computeShoulderAngle({ x: 0, y: 1 }, { x: 0, y: 0 }, { x: 0, y: 0 }), 0);

// Floating-point drift guard: dot/mag slightly > 1
assert('floating-point clamp',
  computeShoulderAngle({ x: 0, y: 1.0000001 }, { x: 0, y: 0 }, { x: 0, y: 1 }), 0, 1);

console.log('─'.repeat(40));
console.log(`${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
