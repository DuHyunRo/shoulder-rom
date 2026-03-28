/**
 * Canvas AR overlay — draws skeleton, angle badges, deficit badge.
 *
 * Coordinate mapping:
 *   MediaPipe x ∈ [0,1] where 0 = camera-left.
 *   Video has CSS transform:scaleX(-1) (mirror), so camera-left → screen-right.
 *   We flip x in the drawing code: screenX = (1 - lm.x) * canvas.width
 *   This makes anatomical Right appear on screen-right (as expected in a mirror).
 *
 * Colors: red = affected side, blue = reference side.
 */

import { getAffectedSide } from './state.js';
import { getArc }          from './arc.js';

const C = {
  affected:  '#ef4444',  // red
  reference: '#3b82f6',  // blue
};

/** Flip x coordinate to match mirrored video. */
const fx = (x, w) => (1 - x) * w;
const fy = (y, h) => y * h;

/**
 * Main draw call — invoke every animation frame.
 * @param {CanvasRenderingContext2D} ctx
 * @param {HTMLCanvasElement} canvas
 * @param {object|null} left  — { angle, visibility, shoulder, elbow, hip }
 * @param {object|null} right — same
 */
export function drawOverlay(ctx, canvas, left, right) {
  const w = canvas.width, h = canvas.height;
  const affected = getAffectedSide();

  // Left arm: label 'L', side key 'left'
  if (left) {
    const color = affected === 'left' ? C.affected : C.reference;
    drawArm(ctx, w, h, left, color, 'L', 'left');
  }
  // Right arm: label 'R', side key 'right'
  if (right) {
    const color = affected === 'right' ? C.affected : C.reference;
    drawArm(ctx, w, h, right, color, 'R', 'right');
  }

  // Deficit badge — only when both arms visible
  if (left && right) {
    const deficit = Math.abs(left.angle - right.angle);
    drawDeficit(ctx, w, deficit);
  }

  // Bottom disclaimers
  drawText(ctx, '±15° vs goniometer', 8, h - 8, 'left', 'rgba(255,255,255,0.65)', '10px system-ui');
  drawText(ctx, 'Mirror view — R/L as labeled', w - 8, h - 8, 'right', 'rgba(255,255,255,0.65)', '10px system-ui');
}

// ── Private ──────────────────────────────────────────────────────────

function drawArm(ctx, w, h, side, color, label, arcKey) {
  const { shoulder, elbow, hip, angle, visibility } = side;
  const arc = getArc(arcKey);

  const sX = fx(shoulder.x, w), sY = fy(shoulder.y, h);
  const eX = fx(elbow.x,    w), eY = fy(elbow.y,    h);
  const hX = fx(hip.x,      w), hY = fy(hip.y,      h);

  const alpha = Math.max(0.45, Math.min(1, visibility));

  ctx.save();
  ctx.globalAlpha = alpha;

  // Skeleton lines: hip → shoulder → elbow
  ctx.strokeStyle = color;
  ctx.lineWidth   = 3;
  ctx.lineCap     = 'round';
  ctx.beginPath();
  ctx.moveTo(hX, hY);
  ctx.lineTo(sX, sY);
  ctx.lineTo(eX, eY);
  ctx.stroke();

  // Joint dots
  for (const [x, y, r] of [[sX, sY, 7], [eX, eY, 5]]) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  ctx.globalAlpha = 1;
  ctx.restore();

  // Angle badge (left arm → screen-left, right arm → screen-right)
  const bx    = label === 'L' ? 10 : w - 10;
  const align = label === 'L' ? 'left' : 'right';
  drawBadge(ctx, bx, 52, `${label} ${angle}°`, color, align, false);

  // Arc badge beneath angle badge
  if (arc && arc.min !== arc.max) {
    drawBadge(ctx, bx, 78, `${arc.min}°→${arc.max}°`, color, align, true);
  }
}

function drawDeficit(ctx, w, deficit) {
  const text = `${deficit}° DEFICIT`;
  ctx.save();
  ctx.font = 'bold 13px system-ui';
  ctx.textAlign = 'center';
  const tw  = ctx.measureText(text).width;
  const pad = 8, bh = 24, by = 28;

  ctx.fillStyle = 'rgba(239,68,68,0.88)';
  roundRect(ctx, w / 2 - tw / 2 - pad, by, tw + pad * 2, bh, 4);
  ctx.fill();

  ctx.fillStyle = '#fff';
  ctx.fillText(text, w / 2, by + bh / 2 + 5);
  ctx.restore();
}

/**
 * Draw a pill badge with a colored border and white text.
 * @param {boolean} small — use smaller font
 */
function drawBadge(ctx, x, y, text, color, align, small) {
  const fontSize = small ? '11px' : 'bold 15px';
  ctx.save();
  ctx.font = `${fontSize} system-ui`;
  ctx.textAlign = align;
  const tw  = ctx.measureText(text).width;
  const pad = 6, bh = small ? 18 : 22;
  const bx  = align === 'left' ? x - pad : x - tw - pad;

  // Background
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  roundRect(ctx, bx, y - bh / 2, tw + pad * 2, bh, 4);
  ctx.fill();

  // Border
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Text
  ctx.fillStyle = '#fff';
  ctx.fillText(text, x, y + (bh / 2) - (small ? 4 : 5));
  ctx.restore();
}

function drawText(ctx, text, x, y, align, color, font) {
  ctx.save();
  ctx.font      = font;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.fillText(text, x, y);
  ctx.restore();
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y,     x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h,     x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y,         x + r, y);
  ctx.closePath();
}
