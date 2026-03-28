/**
 * Today tab — "오늘" home screen.
 *
 * Shows the patient's current rehab phase, today's exercises with completion
 * toggles, a recent ROM sparkline, and a clear CTA to start measuring.
 *
 * Ever-Ex UX pattern: orientation → exercise → measure → celebrate.
 * This screen provides the orientation and exercise steps.
 */

import { getCurrentPhase, getPhaseColor, getProgram } from './guide.js';
import { getSessions, getStreak, getDailyCompletions, toggleExerciseComplete } from './storage.js';
import { getAffectedSide, setAffectedSide } from './state.js';

/** Re-render the today tab. Call on tab activation and after a session save. */
export function renderToday(container, { onStartMeasure } = {}) {
  const sessions  = getSessions();
  const real      = sessions.filter(s => !s._seed);
  const phase     = getCurrentPhase();
  const program   = getProgram();
  const phaseData = program.find(p => p.phase === phase) || program[0];
  const streak    = getStreak();
  const comps     = getDailyCompletions();
  const affected  = getAffectedSide();

  container.innerHTML = '';
  container.style.paddingBottom = '80px';

  // ── Header ──────────────────────────────────────────────────────────
  const header = _el('div', { className: 'today-header' });
  header.innerHTML = `
    <div class="today-app-name">💪 ShoulderROM</div>
    ${streak > 0 ? `<div class="today-streak">${streak}일째 연속 🔥</div>` : ''}
  `;
  container.appendChild(header);

  // ── Phase card ────────────────────────────────────────────────────
  const color = getPhaseColor(phase);
  const phaseCard = _el('div', { className: 'today-phase-card' });
  phaseCard.style.background = `linear-gradient(135deg, ${color} 0%, ${_darken(color)} 100%)`;
  phaseCard.innerHTML = `
    <div class="today-phase-badge">${phase}단계 · ${phaseData.weeks}</div>
    <div class="today-phase-name">${phaseData.name}</div>
    <div class="today-phase-target">목표: ${phaseData.targetAngle}° 까지 팔 들기</div>
  `;
  container.appendChild(phaseCard);

  // ── Affected side picker ──────────────────────────────────────────
  const sidePicker = _el('div', { className: 'today-side-picker' });
  sidePicker.innerHTML = `
    <span class="today-side-label">아픈 쪽:</span>
    <button class="today-side-btn ${affected === 'right' ? 'active' : ''}" data-side="right">오른쪽</button>
    <button class="today-side-btn ${affected === 'left' ? 'active' : ''}" data-side="left">왼쪽</button>
  `;
  sidePicker.querySelectorAll('.today-side-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      setAffectedSide(btn.dataset.side);
      // Update button states
      sidePicker.querySelectorAll('.today-side-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.side === btn.dataset.side);
      });
      // Notify global state listeners (swap-btn text etc.)
      document.dispatchEvent(new CustomEvent('affectedSideChanged', { detail: { side: btn.dataset.side } }));
    });
  });
  container.appendChild(sidePicker);

  // ── Empty state (no sessions yet) ─────────────────────────────────
  if (real.length === 0) {
    const empty = _el('div', { className: 'today-empty' });
    empty.innerHTML = `
      <div class="today-empty-icon">📐</div>
      <div class="today-empty-title">첫 측정을 해보세요!</div>
      <div class="today-empty-body">카메라로 팔을 들어 올려 내 어깨 각도를 측정해 보세요.</div>
    `;
    container.appendChild(empty);
    container.appendChild(_makeCTA(onStartMeasure, true));
    return;
  }

  // ── Today's exercises ──────────────────────────────────────────────
  const allDone = phaseData.exercises.every((_, i) => comps.includes(i));

  const exSection = _el('div', { className: 'today-ex-section' });
  const exHeader  = _el('div', { className: 'today-section-header' });
  exHeader.innerHTML = `오늘의 운동 <span class="today-ex-count">${comps.length}/${phaseData.exercises.length}</span>`;
  exSection.appendChild(exHeader);

  const exScroll = _el('div', { className: 'today-ex-scroll' });

  phaseData.exercises.forEach((ex, i) => {
    const done = comps.includes(i);
    const card = _el('div', { className: `today-ex-card${done ? ' done' : ''}` });
    card.innerHTML = `
      <div class="today-ex-svg">${ex.svg}</div>
      <div class="today-ex-name">${ex.name}</div>
      <div class="today-ex-sets">${ex.sets}</div>
      <button class="today-ex-check${done ? ' checked' : ''}" data-idx="${i}" aria-label="${done ? '완료 취소' : '완료'}">
        ${done ? '✓' : ''}
      </button>
    `;
    card.querySelector('.today-ex-check').addEventListener('click', (e) => {
      const idx = parseInt(e.currentTarget.dataset.idx);
      const updated = toggleExerciseComplete(idx);
      // Re-render to update state (lightweight — just this section)
      renderToday(container, { onStartMeasure });
    });
    exScroll.appendChild(card);
  });
  exSection.appendChild(exScroll);
  container.appendChild(exSection);

  // ── All-done banner ───────────────────────────────────────────────
  if (allDone) {
    const doneBanner = _el('div', { className: 'today-done-banner' });
    doneBanner.innerHTML = `🎉 오늘 운동 완료! 이제 측정해보세요 →`;
    container.appendChild(doneBanner);
  }

  // ── Recent ROM sparkline ──────────────────────────────────────────
  const last3 = sessions.slice(-3);
  if (last3.length > 0) {
    const sparkSection = _el('div', { className: 'today-spark-section' });
    sparkSection.innerHTML = `<div class="today-section-header">최근 기록</div>`;

    const sparkRow = _el('div', { className: 'today-spark-row' });
    last3.forEach(s => {
      const val     = s[s.affectedSide + 'Max'];
      const dateStr = _relativeDate(s.timestamp);
      const item    = _el('div', { className: 'today-spark-item' });
      item.innerHTML = `
        <div class="today-spark-val">${val}°</div>
        <div class="today-spark-date">${dateStr}</div>
      `;
      sparkRow.appendChild(item);
    });
    sparkSection.appendChild(sparkRow);

    // Goal progress bar
    const latest    = sessions[sessions.length - 1];
    const latestVal = latest[latest.affectedSide + 'Max'];
    const target    = phaseData.targetAngle;
    const pct       = Math.min((latestVal / target) * 100, 100).toFixed(0);
    const goalBar   = _el('div', { className: 'today-goal-bar' });
    goalBar.innerHTML = `
      <div class="today-goal-label">
        <span>목표까지</span>
        <span style="color:${color};font-weight:800;">${latestVal}° / ${target}°</span>
      </div>
      <div class="today-goal-track">
        <div class="today-goal-fill" style="width:${pct}%;background:${color};"></div>
      </div>
    `;
    sparkSection.appendChild(goalBar);
    container.appendChild(sparkSection);
  }

  // ── CTA button ─────────────────────────────────────────────────────
  container.appendChild(_makeCTA(onStartMeasure, false));
}

// ── Helpers ───────────────────────────────────────────────────────────

function _makeCTA(onStartMeasure, isFirst) {
  const wrap = _el('div', { className: 'today-cta-wrap' });
  wrap.innerHTML = `
    <button class="today-cta-primary">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
        <circle cx="12" cy="13" r="4"/>
      </svg>
      ${isFirst ? '지금 측정 시작하기' : '측정하기'}
    </button>
    ${!isFirst ? `<button class="today-cta-skip">바로 측정하기 →</button>` : ''}
  `;
  wrap.querySelector('.today-cta-primary').addEventListener('click', () => onStartMeasure && onStartMeasure());
  if (!isFirst) {
    wrap.querySelector('.today-cta-skip').addEventListener('click', () => onStartMeasure && onStartMeasure());
  }
  return wrap;
}

function _el(tag, props = {}) {
  const e = document.createElement(tag);
  if (props.className) e.className = props.className;
  if (props.innerHTML) e.innerHTML = props.innerHTML;
  return e;
}

function _darken(hex) {
  // Shift hex color ~20% darker for gradient end
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const d = (c) => Math.max(0, c - 40).toString(16).padStart(2, '0');
  return `#${d(r)}${d(g)}${d(b)}`;
}

function _relativeDate(ts) {
  const now  = Date.now();
  const diff = Math.floor((now - ts) / (1000 * 60 * 60 * 24));
  if (diff === 0) return '오늘';
  if (diff === 1) return '어제';
  if (diff < 7)  return `${diff}일 전`;
  if (diff < 14) return '1주 전';
  return `${Math.floor(diff / 7)}주 전`;
}
