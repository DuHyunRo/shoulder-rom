/**
 * Share tab — QR code + PT report card copy-to-clipboard.
 *
 * QR code: uses vendored qrcode.min.js (window.QRCode global).
 * Clipboard: navigator.clipboard with textarea fallback for old iOS Safari.
 *
 * Report card field mapping:
 *   angle per session = session[session.affectedSide + 'Max']
 *   This respects per-session affectedSide, so left/right swaps don't corrupt history.
 */

import { getSessions } from './storage.js';

/**
 * Re-render the share tab into `container`.
 * @param {HTMLElement} container
 * @param {string|null} deployUrl — override the QR URL (null = window.location.href)
 */
export function renderShare(container, deployUrl) {
  const sessions = getSessions();
  const url      = deployUrl || window.location.href;

  container.innerHTML = '';

  const wrap = document.createElement('div');
  wrap.style.cssText = 'padding:24px 16px;text-align:center;';

  // Header
  appendEl(wrap, 'div', {
    style:       'font-size:15px;font-weight:700;margin-bottom:4px;',
    textContent: 'Share with your PT',
  });
  appendEl(wrap, 'div', {
    style:       'font-size:11px;color:#888;margin-bottom:20px;line-height:1.5;',
    textContent: 'Scan to open ShoulderROM on any phone — no app install needed',
  });

  // QR code div
  const qrDiv = document.createElement('div');
  qrDiv.style.cssText = 'display:inline-block;margin-bottom:10px;';
  wrap.appendChild(qrDiv);

  // URL label
  appendEl(wrap, 'div', {
    style:       'font-size:10px;color:#666;font-family:monospace;margin-bottom:16px;word-break:break-all;',
    textContent: url,
  });

  // Render QR (vendored qrcode.min.js sets window.QRCode)
  if (typeof window !== 'undefined' && window.QRCode) {
    new window.QRCode(qrDiv, {
      text:       url,
      width:      140,
      height:     140,
      colorDark:  '#111111',
      colorLight: '#ffffff',
    });
  } else {
    qrDiv.textContent  = '[QR code unavailable — open vendor/qrcode.min.js]';
    qrDiv.style.color  = '#888';
    qrDiv.style.fontSize = '11px';
  }

  // Copy button
  const reportText = buildReport(sessions);
  const copyBtn    = document.createElement('button');
  copyBtn.textContent = 'Copy PT Report';
  copyBtn.style.cssText = [
    'display:block', 'width:100%', 'padding:11px',
    'border-radius:8px', 'border:none', 'background:#111', 'color:#fff',
    'font-size:13px', 'font-weight:600', 'cursor:pointer', 'margin-bottom:10px',
  ].join(';');

  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(reportText);
      copyBtn.textContent = 'Copied!';
      setTimeout(() => { copyBtn.textContent = 'Copy PT Report'; }, 2000);
    } catch {
      showTextareaFallback(wrap, reportText);
    }
  });
  wrap.appendChild(copyBtn);

  // Report preview card
  if (sessions.length > 0) {
    const card = document.createElement('div');
    card.style.cssText = [
      'margin-top:16px', 'padding:12px', 'background:#f0f9ff',
      'border-radius:8px', 'border:1px solid #bae6fd', 'text-align:left',
    ].join(';');
    card.innerHTML = `
      <div style="font-size:10px;font-weight:700;color:#0369a1;margin-bottom:6px;">PT Report Preview</div>
      <pre style="font-size:10px;color:#444;line-height:1.65;white-space:pre-wrap;margin:0;font-family:system-ui;">${escHtml(reportText)}</pre>`;
    wrap.appendChild(card);
  }

  container.appendChild(wrap);
}

// ── Report text builder ───────────────────────────────────────────────

function buildReport(sessions) {
  if (sessions.length === 0) return 'No sessions recorded.';

  const date   = new Date().toLocaleDateString();
  const latest = sessions[sessions.length - 1];
  const side   = latest.affectedSide === 'right' ? 'Right' : 'Left';
  const refKey = latest.affectedSide === 'right' ? 'leftMax' : 'rightMax';

  const lines = [
    `ShoulderROM Report — ${date}`,
    `${side} shoulder flexion ROM:`,
  ];

  sessions.forEach((s, i) => {
    const val   = s[s.affectedSide + 'Max'];
    const prev  = i > 0 ? sessions[i - 1][sessions[i - 1].affectedSide + 'Max'] : null;
    const delta = prev !== null ? (val >= prev ? '+' : '') + (val - prev) + '°' : '';
    lines.push(`  ${s.label}: ${val}° ${delta}`.trimEnd());
  });

  const latestVal = latest[latest.affectedSide + 'Max'];
  const refVal    = latest[refKey] ?? latestVal;
  lines.push(`Progress to target (120°): ${Math.round(latestVal / 120 * 100)}%`);
  lines.push(`Deficit vs. reference arm: ${Math.abs(latestVal - refVal)}°`);
  lines.push(`Generated via ${window.location.hostname || 'shoulderrom.netlify.app'}`);

  return lines.join('\n');
}

// ── Clipboard fallback ────────────────────────────────────────────────

function showTextareaFallback(container, text) {
  if (container.querySelector('.copy-fallback')) return; // already shown
  const div = document.createElement('div');
  div.className     = 'copy-fallback';
  div.style.cssText = 'margin-top:12px;text-align:left;';
  div.innerHTML     = `<p style="font-size:11px;color:#666;margin-bottom:4px;">Tap to select, then copy:</p>`;
  const ta = document.createElement('textarea');
  ta.value          = text;
  ta.readOnly       = true;
  ta.style.cssText  = 'width:100%;height:110px;font-size:10px;font-family:monospace;border:1px solid #ddd;border-radius:4px;padding:6px;resize:none;';
  ta.addEventListener('click', () => ta.select());
  div.appendChild(ta);
  container.appendChild(div);
  ta.select();
}

// ── Tiny helpers ──────────────────────────────────────────────────────

function appendEl(parent, tag, props) {
  const e = document.createElement(tag);
  Object.assign(e, props);
  parent.appendChild(e);
  return e;
}

function escHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
