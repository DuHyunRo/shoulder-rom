/**
 * Progress tab — "내 기록" session history with improvement card and goal bar.
 *
 * Vanilla Canvas 2D only — no Chart.js, no CDN dependency.
 * Conference WiFi is unreliable; every CDN call is a demo risk.
 */

import { getSessions } from './storage.js';
import { getCurrentPhase, getPhaseColor, getTargetAngleForPhase } from './guide.js';

const PAD = { top: 12, right: 16, bottom: 28, left: 36 };

/** Re-render the entire progress tab into `container`. */
export function renderProgress(container) {
  const sessions = getSessions();
  container.innerHTML = '';
  container.style.paddingBottom = '80px';

  // ── Empty state ──────────────────────────────────────────────────
  if (sessions.length === 0) {
    container.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;
                  min-height:60vh;padding:48px 24px;text-align:center;gap:12px;">
        <div style="font-size:48px;">📊</div>
        <div style="font-size:20px;font-weight:800;color:#111;">아직 기록이 없어요</div>
        <div style="font-size:16px;color:#777;line-height:1.6;">첫 측정을 완료하면<br>여기에 기록이 나타납니다.</div>
      </div>`;
    return;
  }

  const phase     = getCurrentPhase();
  const phaseColor = getPhaseColor(phase);
  const target    = getTargetAngleForPhase(phase);
  const latest    = sessions[sessions.length - 1];
  const affSide   = latest.affectedSide;
  const latestVal = latest[affSide + 'Max'];
  const sideLabel = affSide === 'right' ? '오른쪽' : '왼쪽';

  // ── Page header ──────────────────────────────────────────────────
  const hdr = el('div', { style: 'padding:20px 16px 4px;' });
  hdr.innerHTML = `
    <div style="font-size:22px;font-weight:800;color:#111;">내 기록</div>
    <div style="font-size:14px;color:#888;margin-top:2px;">${sideLabel} 어깨 굴곡 ROM · ${sessions.length}회 측정</div>
  `;
  container.appendChild(hdr);

  // ── Week-over-week improvement card ──────────────────────────────
  const realSessions = sessions.filter(s => !s._seed);
  if (realSessions.length >= 2) {
    const prev    = realSessions[realSessions.length - 2];
    const prevVal = prev[prev.affectedSide + 'Max'];
    const diff    = latestVal - prevVal;
    const isUp    = diff >= 0;

    const improvCard = el('div', {
      style: `
        margin:8px 16px 0;
        padding:16px;
        border-radius:16px;
        background:${isUp ? '#f0fdf4' : '#fff1f2'};
        border:2px solid ${isUp ? '#86efac' : '#fca5a5'};
        display:flex;align-items:center;gap:14px;
      `,
    });
    improvCard.innerHTML = `
      <div style="font-size:36px;line-height:1;">${isUp ? '📈' : '📉'}</div>
      <div>
        <div style="font-size:20px;font-weight:800;color:${isUp ? '#16a34a' : '#dc2626'};">
          ${isUp ? '+' : ''}${diff}° ${isUp ? '향상!' : '감소'}
        </div>
        <div style="font-size:14px;color:#555;margin-top:2px;">
          ${isUp ? '잘하고 계세요 — 계속 이대로!' : '괜찮아요, 오늘 다시 해봐요'}
        </div>
      </div>
    `;
    container.appendChild(improvCard);
  }

  // ── Goal progress bar ─────────────────────────────────────────────
  const pct    = Math.min(latestVal / target, 1);
  const goalSection = el('div', { style: 'padding:16px 16px 4px;' });
  goalSection.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:8px;">
      <div style="font-size:16px;font-weight:700;color:#111;">${phase}단계 목표까지</div>
      <div style="font-size:20px;font-weight:800;color:${phaseColor};">${latestVal}° / ${target}°</div>
    </div>
    <div style="height:12px;background:#f0f0f0;border-radius:6px;overflow:hidden;">
      <div style="
        width:${Math.round(pct * 100)}%;height:100%;
        background:${phaseColor};border-radius:6px;
        transition:width 0.6s ease;
      "></div>
    </div>
    <div style="font-size:13px;color:#888;margin-top:6px;">${Math.round(pct * 100)}% 달성</div>
  `;
  container.appendChild(goalSection);

  // ── Chart ─────────────────────────────────────────────────────────
  const chartWrap = el('div', { style: 'padding:8px 16px 0;' });
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'width:100%;height:auto;border:1.5px solid #ebebeb;border-radius:12px;display:block;';
  chartWrap.appendChild(canvas);
  container.appendChild(chartWrap);
  drawChart(canvas, sessions, target, phaseColor);

  // ── Session cards ─────────────────────────────────────────────────
  const cardsHdr = el('div', {
    style: 'font-size:16px;font-weight:700;color:#111;padding:20px 16px 8px;',
  });
  cardsHdr.textContent = '측정 기록';
  container.appendChild(cardsHdr);

  const cardList = el('div', { style: 'padding:0 16px;display:flex;flex-direction:column;gap:10px;' });

  // Show newest first
  [...sessions].reverse().forEach((s, i) => {
    const val     = s[s.affectedSide + 'Max'];
    const isLatest = i === 0;
    const dateStr = new Date(s.timestamp).toLocaleDateString('ko-KR', {
      month: 'long', day: 'numeric',
    });
    const timeStr = new Date(s.timestamp).toLocaleTimeString('ko-KR', {
      hour: '2-digit', minute: '2-digit',
    });
    const prevS   = i < sessions.length - 1 ? [...sessions].reverse()[i + 1] : null;
    const prevVal = prevS ? prevS[prevS.affectedSide + 'Max'] : null;
    const delta   = prevVal !== null ? val - prevVal : null;

    const card = el('div', {
      style: `
        background:#fff;border-radius:14px;
        border:${isLatest ? `2px solid ${phaseColor}` : '1.5px solid #ebebeb'};
        padding:14px 16px;
        display:flex;align-items:center;gap:12px;
      `,
    });
    card.innerHTML = `
      <div style="
        width:52px;height:52px;border-radius:50%;
        background:${isLatest ? phaseColor : '#f3f4f6'};
        display:flex;align-items:center;justify-content:center;
        font-size:18px;font-weight:800;
        color:${isLatest ? '#fff' : '#374151'};
        flex-shrink:0;line-height:1;
      ">${val}°</div>
      <div style="flex:1;min-width:0;">
        <div style="font-size:16px;font-weight:${isLatest ? '800' : '600'};color:#111;">${dateStr} ${timeStr}</div>
        <div style="font-size:13px;color:#888;margin-top:2px;">${s.label} · ${s.affectedSide === 'right' ? '오른쪽' : '왼쪽'} 어깨</div>
      </div>
      ${delta !== null ? `
        <div style="
          font-size:16px;font-weight:800;
          color:${delta >= 0 ? '#16a34a' : '#dc2626'};
          flex-shrink:0;
        ">${delta >= 0 ? '+' : ''}${delta}°</div>
      ` : ''}
    `;
    cardList.appendChild(card);
  });
  container.appendChild(cardList);
}

// ── Chart drawing ──────────────────────────────────────────────────────

function drawChart(canvas, sessions, target, color) {
  // Scale for device pixel ratio — crisp on retina/hi-DPI phones
  const dpr = window.devicePixelRatio || 1;
  const W = 320, H = 160;
  canvas.width  = Math.round(W * dpr);
  canvas.height = Math.round(H * dpr);
  // CSS display size stays at natural 2:1 ratio via width:100%;height:auto
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  const cW = W - PAD.left - PAD.right;
  const cH = H - PAD.top  - PAD.bottom;

  ctx.clearRect(0, 0, W, H);

  // Grid + Y axis labels
  ctx.font      = '10px system-ui';
  ctx.fillStyle = '#bbb';
  ctx.textAlign = 'right';
  for (const deg of [0, 60, 120, 180]) {
    const y = PAD.top + cH - (deg / 180) * cH;
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth   = 1;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(PAD.left, y);
    ctx.lineTo(PAD.left + cW, y);
    ctx.stroke();
    ctx.fillText(`${deg}°`, PAD.left - 4, y + 4);
  }

  // Target line (dashed, phase color)
  const targetY = PAD.top + cH - (target / 180) * cH;
  ctx.strokeStyle = color;
  ctx.lineWidth   = 1.5;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(PAD.left, targetY);
  ctx.lineTo(PAD.left + cW, targetY);
  ctx.stroke();
  ctx.setLineDash([]);

  // Data points
  const n   = sessions.length;
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
  ctx.fillStyle = `${color}18`;
  ctx.fill();

  // Data line
  ctx.strokeStyle = color;
  ctx.lineWidth   = 2.5;
  ctx.lineJoin    = 'round';
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (const p of pts.slice(1)) ctx.lineTo(p.x, p.y);
  ctx.stroke();

  // Dots + X labels
  ctx.font      = '10px system-ui';
  ctx.textAlign = 'center';
  pts.forEach((p, i) => {
    const isLast = i === pts.length - 1;
    ctx.beginPath();
    ctx.arc(p.x, p.y, isLast ? 5 : 4, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    if (isLast) {
      ctx.strokeStyle = '#fff';
      ctx.lineWidth   = 2;
      ctx.stroke();
    }
    ctx.fillStyle = '#aaa';
    ctx.fillText(p.label, p.x, H - 8);
  });
}

// ── Tiny helper ────────────────────────────────────────────────────────

function el(tag, props = {}) {
  const e = document.createElement(tag);
  Object.assign(e, props);
  return e;
}
