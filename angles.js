/**
 * Compute shoulder flexion ROM angle.
 *
 * Measures the angle at the SHOULDER vertex between two vectors:
 *   vBody = shoulder → hip  (body downward axis)
 *   vArm  = shoulder → elbow (upper arm direction)
 *
 * Returns degrees: 0° = arm at side, 90° = horizontal, 180° = overhead.
 *
 * Uses 2D (x,y) only — MediaPipe z from monocular camera is noisy
 * and degrades accuracy below the ±15° tolerance target.
 *
 * Unit test:
 *   hip={0,1}, shoulder={0,0}, elbow={1,0} → 90°  (arm horizontal)
 *   hip={0,1}, shoulder={0,0}, elbow={0,1} → 0°   (arm at side)
 *   hip={0,1}, shoulder={0,0}, elbow={0,-1} → 180° (arm overhead)
 */
export function computeShoulderAngle(hip, shoulder, elbow) {
  const vBody = { x: hip.x - shoulder.x, y: hip.y - shoulder.y };
  const vArm  = { x: elbow.x - shoulder.x, y: elbow.y - shoulder.y };

  const dot = vBody.x * vArm.x + vBody.y * vArm.y;
  const mag = Math.sqrt(vBody.x ** 2 + vBody.y ** 2) *
              Math.sqrt(vArm.x  ** 2 + vArm.y  ** 2);

  if (mag === 0) return 0;

  // Clamp to [-1,1] to guard against floating-point drift
  const cosAngle = Math.max(-1, Math.min(1, dot / mag));
  return Math.round(Math.acos(cosAngle) * (180 / Math.PI));
}
