/**
 * Progress tab — renders the session history chart and table.
 *
 * Vanilla Canvas 2D only — no Chart.js, no CDN dependency.
 * Conference WiFi is unreliable; every CDN call is a demo risk.
 *
 * Chart layout (canvas 320×160, all in px):
 *   PAD = { top:10, right:16, bottom:24, left:32 }
 *   Y axis: 0° at bottom, 180° at top
 *   Target line at TARGET_ANGLE° = (TARGET/180) of chart height
 */

import { getSessions } from './storage.js';

const TARGET = 120; // frozen shoulder protocol target (°)
const PAD    = { top: 10, right: 16, bottom: 24, left: 32 };

/** Re-render the entire progress tab into `container`. */
export function renderProgress(container) {
  const sessions = getSessions();
  container.innerHTML = '';

  if (sessions.length === 0) {
    container.innerHTML = `
      <p style="color:#888;text-align:center;padding:48px 24px;font-size:14px;">
        No sessions yet.<br>Save a measurement to see your progress.
      </p>`;
    return;
  }

  const latest     = sessions[sessions.length - 1];
  const affSide    = latest.affectedSide;
  const sideLabel  = affSide === 'right' ? 'Right' : 'Left';

  // Title
  container.appendChild(el('div', {
    style: 'font-size:15px;font-weight:700;padding:16px 16px 4px;',
    textContent: `${sideLabel} Shoulder — Flexion ROM`,
  }));
  container.appendChild(el('div', {
    style: 'font-size:11px;color:#888;padding:0 16px 12px;',
    textContent: `${sessions.length} session${sessions.length > 1 ? 's' : ''} · Target: ${TARGET}°`,
  }));

  // Chart
  const chartWrap = el('div', { style: 'padding:0 16px;' });
  const chartCanvas = el('canvas', {
    style: 'width:100%;height:auto;border:1.5px solid #e5e5e5;border-radius:8px;display:block;',
  });
  chartCanvas.width  = 320;
  chartCanvas.height = 160;
  chartWrap.appendChild(chartCanvas);
  container.appendChild(chartWrap);
  drawChart(chartCanvas, sessions);

  // Legend
  const legend = el('div', { style: 'display:flex;gap:16px;padding:8px 16px;' });
  legend.innerHTML = `
    <span style="font-size:10px;color:#555;display:flex;align-items:center;gap:4px;">
      <span style="width:14px;height:3px;background:#3b82f6;display:inline-block;border-radius:2px;"></span>
      Affected ROM
    </span>
    <span style="font-size:10px;color:#555;display:flex;align-items:center;gap:4px;">
      <span style="width:14px;height:0;border-top:2px dashed #ef4444;display:inline-block;"></span>
      Target ${TARGET}°
    </span>`;
  container.appendChild(legend);

  // Session rows
  const table = el('div', { style: 'padding:0 16px;margin-top:4px;' });
  sessions.forEach((s, i) => {
    const val     = s[s.affectedSide + 'Max'];
    const prevVal = i > 0 ? sessions[i - 1][sessions[i - 1].affectedSide + 'Max'] : null;
    const delta   = prevVal !== null ? val - prevVal : null;

    const row = el('div', {
      style: `display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:12px;${i === sessions.length - 1 ? 'font-weight:700;' : ''}`,
    });
    row.innerHTML = `
      <span style="color:#555;">${s.label}</span>
      <span>${val}°</span>
      <span style="color:${delta === null ? '#999' : delta >= 0 ? '#16a34a' : '#dc2626'};">
        ${delta === null ? '—' : (delta >= 0 ? '+' : '') + delta + '°'}
      </span>`;
    table.appendChild(row);
  });
  container.appendChild(table);

  // Progress bar
  const latestVal = latest[latest.affectedSide + 'Max'];
  const pct       = Math.min(latestVal / TARGET, 1);
  const barWrap   = el('div', { style: 'padding:12px 16px 24px;' });
  barWrap.innerHTML = `
    <div style="display:flex;justify-content:space-between;font-size:10px;color:#888;margin-bottom:4px;">
      <span>Progress to target</span>
      <span>${latestVal}/${TARGET}° (${Math.round(pct * 100)}%)</span>
    </div>
    <div style="height:6px;background:#f0f0f0;border-radius:3px;overflow:hidden;">
      <div style="width:${pct * 100}%;height:100%;background:#3b82f6;border-radius:3px;"></div>
    </div>`;
  container.appendChild(barWrap);
}

// ── Chart drawing ─────────────────────────────────────────────────────

function drawChart(canvas, sessions) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const cW = W - PAD.left - PAD.right;
  const cH = H - PAD.top  - PAD.bottom;

  ctx.clearRect(0, 0, W, H);

  // Grid + Y axis labels
  ctx.font      = '9px system-ui';
  ctx.fillStyle = '#aaa';
  ctx.textAlign = 'right';
  for (const deg of [0, 60, 120, 180]) {
    const y = PAD.top + cH - (deg / 180) * cH;
    ctx.strokeStyle = '#ebebeb';
    ctx.lineWidth   = 1;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(PAD.left, y);
    ctx.lineTo(PAD.left + cW, y);
    ctx.stroke();
    ctx.fillText(`${deg}°`, PAD.left - 4, y + 3);
  }

  // Target line (dashed red)
  const targetY = PAD.top + cH - (TARGET / 180) * cH;
  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth   = 1.5;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(PAD.left, targetY);
  ctx.lineTo(PAD.left + cW, targetY);
  ctx.stroke();
  ctx.setLineDash([]);

  // Compute data points
  const n  = sessions.length;
  const pts = sessions.map((s, i) => {
    const val = s[s.affectedSide + 'Max'];
    return {
      x: PAD.left + (n === 1 ? cW / 2 : (i / (n - 1)) * cW),
      y: PAD.top  + cH - (val / 180) * cH,
      val,
      label: s.label,
    };
  });

  if (pts.length === 0) return;

  // Area fill
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (const p of pts) ctx.lineTo(p.x, p.y);
  ctx.lineTo(pts[pts.length - 1].x, PAD.top + cH);
  ctx.lineTo(pts[0].x, PAD.top + cH);
  ctx.closePath();
  ctx.fillStyle = 'rgba(59,130,246,0.08)';
  ctx.fill();

  // Data line
  ctx.strokeStyle = '#3b82f6';
  ctx.lineWidth   = 2.5;
  ctx.lineJoin    = 'round';
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (const p of pts.slice(1)) ctx.lineTo(p.x, p.y);
  ctx.stroke();

  // Dots + X labels
  ctx.font      = '9px system-ui';
  ctx.textAlign = 'center';
  pts.forEach((p, i) => {
    const isLast = i === pts.length - 1;
    ctx.beginPath();
    ctx.arc(p.x, p.y, isLast ? 5 : 4, 0, Math.PI * 2);
    ctx.fillStyle = '#3b82f6';
    ctx.fill();
    if (isLast) {
      ctx.strokeStyle = '#fff';
      ctx.lineWidth   = 2;
      ctx.stroke();
    }
    ctx.fillStyle = '#aaa';
    ctx.fillText(p.label, p.x, H - 6);
  });
}

// ── Tiny helper ───────────────────────────────────────────────────────

function el(tag, props = {}) {
  const e = document.createElement(tag);
  Object.assign(e, props);
  return e;
}
