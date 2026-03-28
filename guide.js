/**
 * Patient Exercise Guide — Frozen Shoulder Rehabilitation Protocol
 * Based on standard physiotherapy guidelines: 4-phase progressive program.
 *
 * Phase is auto-detected from best session ROM to date.
 * Target angle is exported to index.html so the camera HUD can display it.
 */

const PROGRAM = [
  {
    phase: 1,
    name: 'Acute Phase',
    weeks: '1–4',
    targetAngle: 45,
    color: '#ef4444',
    description: 'Reduce pain and begin very gentle motion. Do not push through pain.',
    exercises: [
      {
        name: 'Pendulum Swings',
        sets: '3 × 30 sec',
        tip: 'Lean on a table, let arm hang freely. Swing in small circles — gravity does the work. No forcing.',
      },
      {
        name: 'Passive Elevation (Stick-Assisted)',
        sets: '3 × 10 reps',
        tip: 'Use a cane or umbrella. Good arm lifts the affected arm upward. Stop at the first point of resistance.',
      },
      {
        name: 'External Rotation — Supine',
        sets: '3 × 10 reps, hold 3 sec',
        tip: 'Lie on your back, elbow bent 90°. Use good arm to push affected arm outward. Only to gentle resistance.',
      },
    ],
  },
  {
    phase: 2,
    name: 'Intermediate Phase',
    weeks: '5–8',
    targetAngle: 90,
    color: '#f59e0b',
    description: 'Increase active range, begin light loading.',
    exercises: [
      {
        name: 'Pulley Overhead Elevation',
        sets: '3 × 15 reps',
        tip: 'Over-door pulley: good arm pulls down to lift affected arm. Aim to reach ear-height by end of this phase.',
      },
      {
        name: 'Wall Finger Walk',
        sets: '3 × 10 reps',
        tip: 'Face the wall, walk fingers up slowly. Mark your daily high point — beat it tomorrow.',
      },
      {
        name: 'Side-Lying External Rotation',
        sets: '3 × 15 reps',
        tip: 'Lie on good side, affected elbow bent 90°. Rotate forearm toward ceiling. Add a light water bottle when easy.',
      },
    ],
  },
  {
    phase: 3,
    name: 'Recovery Phase',
    weeks: '9–12',
    targetAngle: 120,
    color: '#10b981',
    description: 'Restore functional range, progressive strengthening.',
    exercises: [
      {
        name: 'Active Overhead Press',
        sets: '3 × 12 reps',
        tip: 'Light weight, smooth arc overhead. No hitching or shrugging at end range. Focus on control.',
      },
      {
        name: 'Cross-Body Stretch',
        sets: '3 × 30 sec hold',
        tip: 'Pull affected arm across chest with good arm. You should feel a stretch — not sharp pain. Breathe slowly.',
      },
      {
        name: 'Sleeper Stretch',
        sets: '3 × 30 sec hold',
        tip: 'Lie on affected side, elbow bent 90°. Good hand gently presses wrist toward bed. Key for posterior capsule.',
      },
    ],
  },
  {
    phase: 4,
    name: 'Return to Function',
    weeks: '13+',
    targetAngle: 150,
    color: '#0066ff',
    description: 'Full strength and coordination. Return to daily life and sport.',
    exercises: [
      {
        name: 'Functional Overhead Activities',
        sets: 'Daily',
        tip: 'Reach into cabinets, wash hair, hang laundry. Use the arm in real life — do not keep protecting it.',
      },
      {
        name: 'Resistance Band Series',
        sets: '3 × 15 reps',
        tip: 'Forward raises, lateral raises, rows. Progress resistance as tolerated. Keep pain below 3/10.',
      },
      {
        name: 'Sport / Work-Specific Training',
        sets: 'As needed',
        tip: 'Golf, swimming, throwing — progress gradually. Ask your physiotherapist for sport-specific progressions.',
      },
    ],
  },
];

/**
 * Returns the target ROM angle (degrees) for the given phase number.
 */
export function getTargetAngleForPhase(phase) {
  const p = PROGRAM.find(p => p.phase === phase);
  return p ? p.targetAngle : 90;
}

/**
 * Auto-detects the current rehab phase from stored session ROM values.
 * Falls back to Phase 1 if no real sessions exist.
 */
export function getCurrentPhase() {
  try {
    const sessions = JSON.parse(localStorage.getItem('shoulderrom_sessions') || '[]');
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

/** Active phase selection (mutable within guide view). */
let _selectedPhase = null;

/**
 * Renders the full exercise guide into `container`.
 * @param {HTMLElement} container
 */
export function renderGuide(container) {
  const currentPhase = getCurrentPhase();
  if (_selectedPhase === null) _selectedPhase = currentPhase;

  container.innerHTML = `
    <div style="padding:16px 16px 88px;background:#f8fafb;min-height:100%;">
      <h2 style="font-size:20px;font-weight:800;color:#111;margin-bottom:2px;">Exercise Guide</h2>
      <p style="font-size:13px;color:#777;margin-bottom:18px;">Frozen shoulder · 4-phase rehab protocol</p>

      <div id="guide-pills" style="display:flex;gap:6px;margin-bottom:18px;overflow-x:auto;padding-bottom:2px;-webkit-overflow-scrolling:touch;scrollbar-width:none;"></div>
      <div id="guide-detail"></div>
    </div>
  `;

  _renderPills(container, currentPhase);
  _renderDetail(container, _selectedPhase, currentPhase);
}

function _renderPills(container, currentPhase) {
  const pillsEl = container.querySelector('#guide-pills');
  pillsEl.innerHTML = PROGRAM.map(p => {
    const active = p.phase === _selectedPhase;
    return `<button
      data-phase="${p.phase}"
      style="flex-shrink:0;padding:7px 14px;border-radius:20px;
             border:2px solid ${active ? p.color : '#ddd'};
             background:${active ? p.color : '#fff'};
             color:${active ? '#fff' : '#888'};
             font-size:12px;font-weight:700;cursor:pointer;
             white-space:nowrap;transition:all 0.15s;">
      Ph ${p.phase} · Wk ${p.weeks}
    </button>`;
  }).join('');

  pillsEl.querySelectorAll('button[data-phase]').forEach(btn => {
    btn.addEventListener('click', () => {
      _selectedPhase = parseInt(btn.dataset.phase);
      _renderPills(container, currentPhase);
      _renderDetail(container, _selectedPhase, currentPhase);
    });
  });
}

function _renderDetail(container, phase, currentPhase) {
  const p = PROGRAM.find(pr => pr.phase === phase);
  if (!p) return;
  const isCurrent = phase === currentPhase;

  container.querySelector('#guide-detail').innerHTML = `
    <div style="background:${p.color};border-radius:14px;padding:18px;color:#fff;margin-bottom:14px;">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;margin-bottom:8px;">
        <div>
          <div style="font-size:10px;font-weight:700;opacity:0.75;text-transform:uppercase;letter-spacing:0.07em;">Phase ${p.phase} · Weeks ${p.weeks}</div>
          <div style="font-size:19px;font-weight:800;margin-top:3px;">${p.name}</div>
        </div>
        <div style="text-align:right;flex-shrink:0;">
          <div style="font-size:34px;font-weight:800;line-height:1;">${p.targetAngle}°</div>
          <div style="font-size:10px;opacity:0.75;">target ROM</div>
        </div>
      </div>
      <div style="font-size:13px;opacity:0.88;line-height:1.5;">${p.description}</div>
      ${isCurrent ? `<div style="margin-top:10px;display:inline-flex;align-items:center;gap:5px;background:rgba(255,255,255,0.22);padding:4px 10px;border-radius:20px;font-size:11px;font-weight:700;">
        <span>✓</span> Your current phase
      </div>` : ''}
    </div>

    <div style="background:#e8f4ff;border-radius:10px;padding:12px 14px;margin-bottom:14px;display:flex;align-items:center;gap:12px;">
      <div style="width:44px;height:44px;border-radius:50%;background:${p.color};display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;color:#fff;flex-shrink:0;line-height:1;">${p.targetAngle}°</div>
      <div>
        <div style="font-size:13px;font-weight:700;color:#111;">Target shown in Measure tab</div>
        <div style="font-size:12px;color:#555;margin-top:2px;line-height:1.4;">A dashed target line appears on the angle display as you lift your arm.</div>
      </div>
    </div>

    <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:14px;">
      ${p.exercises.map((ex) => `
        <div style="background:#fff;border-radius:12px;padding:15px;border:1.5px solid #ececec;">
          <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;margin-bottom:7px;">
            <div style="font-size:15px;font-weight:700;color:#111;line-height:1.3;">${ex.name}</div>
            <div style="font-size:11px;font-weight:700;color:${p.color};background:${p.color}18;padding:3px 8px;border-radius:20px;white-space:nowrap;flex-shrink:0;">${ex.sets}</div>
          </div>
          <div style="font-size:13px;color:#555;line-height:1.55;">${ex.tip}</div>
        </div>
      `).join('')}
    </div>

    <div style="padding:12px 14px;background:#fffbeb;border-radius:10px;border-left:3px solid #f59e0b;">
      <div style="font-size:12px;font-weight:700;color:#92400e;margin-bottom:3px;">Important</div>
      <div style="font-size:12px;color:#78350f;line-height:1.55;">Stop if pain exceeds 4/10. Mild discomfort (2–3/10) during stretch is normal. Do not advance phases without your physiotherapist's approval.</div>
    </div>
  `;
}
