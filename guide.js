/**
 * Patient Exercise Guide — Frozen Shoulder Rehabilitation Protocol
 * Based on standard physiotherapy guidelines: 4-phase progressive program.
 *
 * Each exercise includes an inline SVG illustration for elderly-first UX.
 * Phase is auto-detected from best session ROM to date.
 * Target angle is exported so the camera HUD and Measure screen can display it.
 */

// ── Exercise Illustrations ──────────────────────────────────────────────────
// Medical PT-style diagrams: clean body, clear movement arrows, phase accent.
// ViewBox 110×100. Red (#ef4444) = affected arm. Gray (#374151) = body/reference.
// No text labels — exercise name is shown in the card header above.

const SVG = {

  // Phase 1 — 1: Pendulum (pendulum swing, leaning on table)
  pendulum: `<svg viewBox="0 0 110 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="110" height="100" rx="8" fill="#fff5f5"/>
    <!-- Table top + leg -->
    <rect x="2" y="38" width="40" height="6" rx="3" fill="#d1d5db"/>
    <rect x="6" y="44" width="6" height="26" rx="2" fill="#d1d5db"/>
    <!-- Head -->
    <circle cx="60" cy="10" r="9" fill="#f9fafb" stroke="#374151" stroke-width="2.2"/>
    <circle cx="57" cy="9" r="1.2" fill="#374151"/>
    <circle cx="63" cy="9" r="1.2" fill="#374151"/>
    <!-- Torso leaning ~40° -->
    <line x1="60" y1="19" x2="40" y2="38" stroke="#374151" stroke-width="3" stroke-linecap="round"/>
    <!-- Support hand on table -->
    <line x1="40" y1="38" x2="22" y2="38" stroke="#374151" stroke-width="2.5" stroke-linecap="round"/>
    <!-- Leg (bent, standing) -->
    <line x1="52" y1="32" x2="40" y2="62" stroke="#374151" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="52" y1="32" x2="56" y2="62" stroke="#374151" stroke-width="2.5" stroke-linecap="round"/>
    <!-- Affected arm hanging down (gravity) -->
    <line x1="40" y1="38" x2="58" y2="74" stroke="#ef4444" stroke-width="3.5" stroke-linecap="round"/>
    <!-- Weight at hand (light dumbbell hint) -->
    <ellipse cx="58" cy="78" rx="5" ry="4" fill="#ef4444" opacity="0.25" stroke="#ef4444" stroke-width="1.5"/>
    <!-- Pendulum arc arrows (left + right swing) -->
    <path d="M44,72 A20,20,0,0,0,72,72" stroke="#ef4444" stroke-width="2" fill="none" stroke-dasharray="4,3" stroke-linecap="round"/>
    <polygon points="44,68 41,73 47,74" fill="#ef4444"/>
    <polygon points="72,68 69,74 75,73" fill="#ef4444"/>
    <!-- ↕ gravity label arrow -->
    <line x1="90" y1="38" x2="90" y2="58" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="2,2"/>
    <polygon points="90,62 87,55 93,55" fill="#ef4444"/>
    <text x="84" y="35" font-size="8" fill="#ef4444" font-family="system-ui" font-weight="700">중력</text>
  </svg>`,

  // Phase 1 — 2: Stick/Wand elevation (good arm pushes affected arm up)
  stickElevation: `<svg viewBox="0 0 110 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="110" height="100" rx="8" fill="#fff5f5"/>
    <!-- Head -->
    <circle cx="55" cy="10" r="9" fill="#f9fafb" stroke="#374151" stroke-width="2.2"/>
    <circle cx="52" cy="9" r="1.2" fill="#374151"/>
    <circle cx="58" cy="9" r="1.2" fill="#374151"/>
    <!-- Torso -->
    <line x1="55" y1="19" x2="55" y2="60" stroke="#374151" stroke-width="3" stroke-linecap="round"/>
    <!-- Legs -->
    <line x1="55" y1="60" x2="44" y2="84" stroke="#374151" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="55" y1="60" x2="66" y2="84" stroke="#374151" stroke-width="2.5" stroke-linecap="round"/>
    <!-- Good arm (right, lower — pushing stick) -->
    <line x1="55" y1="35" x2="36" y2="55" stroke="#374151" stroke-width="2.5" stroke-linecap="round"/>
    <!-- Affected arm (left, raised high by stick) -->
    <line x1="55" y1="35" x2="78" y2="12" stroke="#ef4444" stroke-width="3.5" stroke-linecap="round"/>
    <!-- Stick / wand -->
    <line x1="36" y1="55" x2="78" y2="12" stroke="#9ca3af" stroke-width="2.5" stroke-linecap="round"/>
    <!-- Grip circles at each end -->
    <circle cx="36" cy="55" r="4" fill="#6b7280" opacity="0.6"/>
    <circle cx="78" cy="12" r="4" fill="#ef4444" opacity="0.7"/>
    <!-- Arrow indicating upward lift -->
    <polygon points="78,5 82,14 74,14" fill="#ef4444"/>
    <!-- "Good arm" indicator -->
    <text x="14" y="58" font-size="8" fill="#6b7280" font-family="system-ui">건강한 팔</text>
    <text x="62" y="12" font-size="8" fill="#ef4444" font-family="system-ui" font-weight="700">아픈 팔</text>
  </svg>`,

  // Phase 1 — 3: Supine external rotation (lying on back, ER with good hand assist)
  supineER: `<svg viewBox="0 0 110 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="110" height="100" rx="8" fill="#fff5f5"/>
    <!-- Mat / floor -->
    <rect x="4" y="68" width="102" height="6" rx="2" fill="#e5e7eb"/>
    <!-- Pillow hint under head -->
    <ellipse cx="18" cy="65" rx="12" ry="5" fill="#dbeafe" opacity="0.8"/>
    <!-- Head (lying on back, looking up) -->
    <circle cx="18" cy="62" r="9" fill="#f9fafb" stroke="#374151" stroke-width="2.2"/>
    <circle cx="16" cy="61" r="1.2" fill="#374151"/>
    <circle cx="22" cy="61" r="1.2" fill="#374151"/>
    <!-- Torso (horizontal) -->
    <line x1="27" y1="62" x2="82" y2="62" stroke="#374151" stroke-width="3" stroke-linecap="round"/>
    <!-- Legs (knees slightly bent) -->
    <line x1="82" y1="62" x2="94" y2="67" stroke="#374151" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="94" y1="67" x2="100" y2="62" stroke="#374151" stroke-width="2.5" stroke-linecap="round"/>
    <!-- Affected arm: upper arm vertical (elbow at 90°) -->
    <line x1="52" y1="62" x2="52" y2="44" stroke="#ef4444" stroke-width="3.5" stroke-linecap="round"/>
    <!-- Forearm neutral position (pointing up) — ghost position -->
    <line x1="52" y1="44" x2="52" y2="30" stroke="#ef4444" stroke-width="2" stroke-dasharray="3,2" stroke-linecap="round" opacity="0.35"/>
    <!-- Forearm rotated outward (target ER position) -->
    <line x1="52" y1="44" x2="70" y2="36" stroke="#ef4444" stroke-width="3.5" stroke-linecap="round"/>
    <!-- ER arc arrow -->
    <path d="M52,30 A14,8,0,0,1,70,36" stroke="#ef4444" stroke-width="2" fill="none" stroke-dasharray="3,2" stroke-linecap="round"/>
    <polygon points="68,31 72,38 66,39" fill="#ef4444"/>
    <!-- 90° elbow angle indicator -->
    <rect x="49" y="41" width="6" height="6" fill="none" stroke="#374151" stroke-width="1" opacity="0.5"/>
    <text x="56" y="49" font-size="7" fill="#374151" font-family="system-ui" opacity="0.7">90°</text>
    <text x="33" y="90" font-size="8" fill="#ef4444" font-family="system-ui" font-weight="700">팔꿈치 90° · 바깥 회전</text>
  </svg>`,

  // Phase 2 — 1: Pulley overhead elevation
  pulley: `<svg viewBox="0 0 110 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="110" height="100" rx="8" fill="#fffbf0"/>
    <!-- Door frame -->
    <rect x="44" y="0" width="22" height="3" rx="1" fill="#9ca3af"/>
    <line x1="44" y1="0" x2="44" y2="22" stroke="#d1d5db" stroke-width="4" stroke-linecap="round"/>
    <line x1="66" y1="0" x2="66" y2="22" stroke="#d1d5db" stroke-width="4" stroke-linecap="round"/>
    <!-- Pulley wheel -->
    <circle cx="55" cy="6" r="6" fill="white" stroke="#6b7280" stroke-width="2"/>
    <circle cx="55" cy="6" r="2" fill="#9ca3af"/>
    <!-- Rope left (good arm, pulled down) -->
    <line x1="51" y1="10" x2="38" y2="42" stroke="#9ca3af" stroke-width="2" stroke-dasharray="4,2"/>
    <!-- Rope right (affected arm, goes up) -->
    <line x1="59" y1="10" x2="72" y2="36" stroke="#9ca3af" stroke-width="2" stroke-dasharray="4,2"/>
    <!-- Head -->
    <circle cx="55" cy="28" r="9" fill="#f9fafb" stroke="#374151" stroke-width="2.2"/>
    <circle cx="52" cy="27" r="1.2" fill="#374151"/>
    <circle cx="58" cy="27" r="1.2" fill="#374151"/>
    <!-- Torso -->
    <line x1="55" y1="37" x2="55" y2="74" stroke="#374151" stroke-width="3" stroke-linecap="round"/>
    <!-- Legs -->
    <line x1="55" y1="74" x2="45" y2="95" stroke="#374151" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="55" y1="74" x2="65" y2="95" stroke="#374151" stroke-width="2.5" stroke-linecap="round"/>
    <!-- Good arm (pulling rope down) -->
    <line x1="55" y1="52" x2="38" y2="64" stroke="#374151" stroke-width="2.5" stroke-linecap="round"/>
    <polygon points="38,68 34,62 42,62" fill="#374151" opacity="0.6"/>
    <!-- Affected arm (raised by rope) -->
    <line x1="55" y1="52" x2="72" y2="36" stroke="#f59e0b" stroke-width="3.5" stroke-linecap="round"/>
    <polygon points="72,30 76,38 68,38" fill="#f59e0b"/>
    <text x="12" y="98" font-size="8" fill="#f59e0b" font-family="system-ui" font-weight="700">도르래로 아픈 팔 올리기</text>
  </svg>`,

  // Phase 2 — 2: Wall finger walk
  wallWalk: `<svg viewBox="0 0 110 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="110" height="100" rx="8" fill="#fffbf0"/>
    <!-- Wall with texture hint -->
    <rect x="84" y="0" width="20" height="100" rx="0" fill="#e5e7eb"/>
    <line x1="84" y1="0" x2="84" y2="100" stroke="#d1d5db" stroke-width="1.5"/>
    <!-- Progress marks on wall -->
    <line x1="84" y1="20" x2="90" y2="20" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="3,2"/>
    <line x1="84" y1="38" x2="90" y2="38" stroke="#9ca3af" stroke-width="1.5" stroke-dasharray="3,2"/>
    <text x="92" y="23" font-size="7" fill="#f59e0b" font-family="system-ui" font-weight="700">오늘</text>
    <text x="92" y="41" font-size="7" fill="#9ca3af" font-family="system-ui">어제</text>
    <!-- Head -->
    <circle cx="46" cy="13" r="9" fill="#f9fafb" stroke="#374151" stroke-width="2.2"/>
    <circle cx="43" cy="12" r="1.2" fill="#374151"/>
    <circle cx="49" cy="12" r="1.2" fill="#374151"/>
    <!-- Torso -->
    <line x1="46" y1="22" x2="46" y2="62" stroke="#374151" stroke-width="3" stroke-linecap="round"/>
    <!-- Legs -->
    <line x1="46" y1="62" x2="36" y2="88" stroke="#374151" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="46" y1="62" x2="56" y2="88" stroke="#374151" stroke-width="2.5" stroke-linecap="round"/>
    <!-- Good arm (lower, stabilizing) -->
    <line x1="46" y1="40" x2="84" y2="52" stroke="#374151" stroke-width="2.5" stroke-linecap="round"/>
    <circle cx="84" cy="52" r="3.5" fill="#6b7280"/>
    <!-- Affected arm (reaching high) -->
    <line x1="46" y1="40" x2="84" y2="20" stroke="#f59e0b" stroke-width="3.5" stroke-linecap="round"/>
    <circle cx="84" cy="20" r="3.5" fill="#f59e0b"/>
    <!-- Upward arrow on wall -->
    <polygon points="84,12 88,22 80,22" fill="#f59e0b"/>
  </svg>`,

  // Phase 2 — 3: Side-lying external rotation
  sidelyingER: `<svg viewBox="0 0 110 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="110" height="100" rx="8" fill="#fffbf0"/>
    <!-- Mat / floor -->
    <rect x="4" y="74" width="102" height="6" rx="2" fill="#e5e7eb"/>
    <!-- Head (lying on side) -->
    <circle cx="15" cy="62" r="9" fill="#f9fafb" stroke="#374151" stroke-width="2.2"/>
    <circle cx="13" cy="61" r="1.2" fill="#374151"/>
    <circle cx="18" cy="61" r="1.2" fill="#374151"/>
    <!-- Torso -->
    <line x1="24" y1="62" x2="80" y2="62" stroke="#374151" stroke-width="3" stroke-linecap="round"/>
    <!-- Legs (stacked) -->
    <line x1="80" y1="62" x2="96" y2="70" stroke="#374151" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="80" y1="62" x2="104" y2="62" stroke="#374151" stroke-width="2" stroke-linecap="round" opacity="0.5"/>
    <!-- Upper arm (elbow at 90°, upper arm perpendicular to torso) -->
    <line x1="50" y1="62" x2="50" y2="44" stroke="#f59e0b" stroke-width="3.5" stroke-linecap="round"/>
    <!-- Forearm neutral (pointing toward viewer) — ghost -->
    <line x1="50" y1="44" x2="50" y2="30" stroke="#f59e0b" stroke-width="2" stroke-dasharray="3,2" opacity="0.35"/>
    <!-- Forearm rotated to ceiling (target position) -->
    <line x1="50" y1="44" x2="68" y2="32" stroke="#f59e0b" stroke-width="3.5" stroke-linecap="round"/>
    <!-- ER arc arrow -->
    <path d="M50,30 A14,10,0,0,1,68,32" stroke="#f59e0b" stroke-width="2" fill="none" stroke-dasharray="3,2" stroke-linecap="round"/>
    <polygon points="66,27 70,34 64,35" fill="#f59e0b"/>
    <!-- Elbow 90° indicator -->
    <rect x="47" y="41" width="6" height="6" fill="none" stroke="#374151" stroke-width="1" opacity="0.5"/>
    <!-- Resistance cue: small weight at wrist -->
    <ellipse cx="68" cy="32" rx="5" ry="3.5" fill="#f59e0b" opacity="0.3" stroke="#f59e0b" stroke-width="1"/>
    <text x="30" y="93" font-size="8" fill="#f59e0b" font-family="system-ui" font-weight="700">옆으로 누워 팔 회전</text>
  </svg>`,

  // Phase 3 — 1: Active overhead press
  overheadPress: `<svg viewBox="0 0 110 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="110" height="100" rx="8" fill="#f0fdf4"/>
    <!-- Head -->
    <circle cx="55" cy="10" r="9" fill="#f9fafb" stroke="#374151" stroke-width="2.2"/>
    <circle cx="52" cy="9" r="1.2" fill="#374151"/>
    <circle cx="58" cy="9" r="1.2" fill="#374151"/>
    <!-- Torso (straight, engaged) -->
    <line x1="55" y1="19" x2="55" y2="60" stroke="#374151" stroke-width="3" stroke-linecap="round"/>
    <!-- Legs -->
    <line x1="55" y1="60" x2="44" y2="86" stroke="#374151" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="55" y1="60" x2="66" y2="86" stroke="#374151" stroke-width="2.5" stroke-linecap="round"/>
    <!-- Reference arm (bent at side, elbow 90°) -->
    <line x1="55" y1="36" x2="36" y2="46" stroke="#374151" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="36" y1="46" x2="28" y2="36" stroke="#374151" stroke-width="2.5" stroke-linecap="round" opacity="0.6"/>
    <!-- Affected arm raised overhead -->
    <line x1="55" y1="36" x2="74" y2="10" stroke="#10b981" stroke-width="3.5" stroke-linecap="round"/>
    <!-- Dumbbell at hand -->
    <rect x="70" y="3" width="12" height="5" rx="2.5" fill="#10b981" opacity="0.3" stroke="#10b981" stroke-width="1.5"/>
    <circle cx="71" cy="5.5" r="3" fill="#10b981" opacity="0.6"/>
    <circle cx="81" cy="5.5" r="3" fill="#10b981" opacity="0.6"/>
    <!-- Arrow up -->
    <polygon points="74,2 78,10 70,10" fill="#10b981"/>
    <!-- Shoulder shrug warning -->
    <path d="M46,22 Q50,18 55,19" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="2,2" fill="none" opacity="0.6"/>
    <text x="8" y="96" font-size="8" fill="#ef4444" font-family="system-ui" opacity="0.8">어깨 올라오지 않게!</text>
  </svg>`,

  // Phase 3 — 2: Cross-body stretch
  crossBody: `<svg viewBox="0 0 110 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="110" height="100" rx="8" fill="#f0fdf4"/>
    <!-- Head -->
    <circle cx="55" cy="10" r="9" fill="#f9fafb" stroke="#374151" stroke-width="2.2"/>
    <circle cx="52" cy="9" r="1.2" fill="#374151"/>
    <circle cx="58" cy="9" r="1.2" fill="#374151"/>
    <!-- Torso -->
    <line x1="55" y1="19" x2="55" y2="62" stroke="#374151" stroke-width="3" stroke-linecap="round"/>
    <!-- Legs -->
    <line x1="55" y1="62" x2="44" y2="86" stroke="#374151" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="55" y1="62" x2="66" y2="86" stroke="#374151" stroke-width="2.5" stroke-linecap="round"/>
    <!-- Good arm (reaching across) -->
    <line x1="55" y1="36" x2="76" y2="46" stroke="#374151" stroke-width="2.5" stroke-linecap="round"/>
    <!-- Affected arm crossing body -->
    <line x1="55" y1="36" x2="28" y2="44" stroke="#10b981" stroke-width="3.5" stroke-linecap="round"/>
    <!-- Good hand gripping affected wrist -->
    <circle cx="28" cy="44" r="5" fill="white" stroke="#374151" stroke-width="2"/>
    <!-- Pull arrow (left, horizontal) -->
    <polygon points="18,44 28,40 28,48" fill="#374151"/>
    <!-- Stretch sensation indicator (dotted arc at shoulder) -->
    <path d="M68,28 A16,16,0,0,1,74,46" stroke="#10b981" stroke-width="1.5" stroke-dasharray="2,2" fill="none" opacity="0.6"/>
    <text x="22" y="92" font-size="8" fill="#10b981" font-family="system-ui" font-weight="700">← 가슴 앞으로 당기기</text>
  </svg>`,

  // Phase 3 — 3: Sleeper stretch
  sleeper: `<svg viewBox="0 0 110 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="110" height="100" rx="8" fill="#f0fdf4"/>
    <!-- Mat -->
    <rect x="4" y="72" width="102" height="6" rx="2" fill="#e5e7eb"/>
    <!-- Pillow -->
    <ellipse cx="16" cy="68" rx="13" ry="6" fill="#dbeafe" opacity="0.8"/>
    <!-- Head (lying on affected side) -->
    <circle cx="16" cy="60" r="9" fill="#f9fafb" stroke="#374151" stroke-width="2.2"/>
    <circle cx="14" cy="59" r="1.2" fill="#374151"/>
    <circle cx="20" cy="59" r="1.2" fill="#374151"/>
    <!-- Torso -->
    <line x1="25" y1="60" x2="82" y2="60" stroke="#374151" stroke-width="3" stroke-linecap="round"/>
    <!-- Legs (stacked) -->
    <line x1="82" y1="60" x2="100" y2="68" stroke="#374151" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="82" y1="60" x2="106" y2="60" stroke="#374151" stroke-width="2" stroke-linecap="round" opacity="0.5"/>
    <!-- Affected arm: upper arm perpendicular up from shoulder -->
    <line x1="50" y1="60" x2="50" y2="42" stroke="#10b981" stroke-width="3.5" stroke-linecap="round"/>
    <!-- Forearm (being pressed toward floor — internal rotation stretch) -->
    <line x1="50" y1="42" x2="32" y2="50" stroke="#10b981" stroke-width="3.5" stroke-linecap="round"/>
    <!-- Good hand pressing wrist down -->
    <circle cx="30" cy="50" r="5" fill="white" stroke="#374151" stroke-width="2"/>
    <!-- Downward press arrow -->
    <polygon points="30,58 34,50 26,50" fill="#374151"/>
    <!-- Shoulder capsule stretch indicator -->
    <path d="M58,44 A12,12,0,0,1,62,60" stroke="#10b981" stroke-width="1.5" stroke-dasharray="2,2" fill="none" opacity="0.6"/>
    <text x="10" y="92" font-size="8" fill="#10b981" font-family="system-ui" font-weight="700">어깨 뒤 캡슐 스트레칭</text>
  </svg>`,

  // Phase 4 — 1: Functional overhead activity (reaching shelf)
  functional: `<svg viewBox="0 0 110 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="110" height="100" rx="8" fill="#f0f4ff"/>
    <!-- Cabinet with shelf -->
    <rect x="72" y="0" width="34" height="55" rx="3" fill="#e5e7eb"/>
    <line x1="72" y1="22" x2="106" y2="22" stroke="#d1d5db" stroke-width="1.5"/>
    <!-- Items on shelf (cup, bottle) -->
    <rect x="80" y="10" width="8" height="12" rx="2" fill="#bfdbfe"/>
    <rect x="92" y="8" width="6" height="14" rx="2" fill="#a7f3d0"/>
    <!-- Floor line -->
    <line x1="4" y1="90" x2="106" y2="90" stroke="#d1d5db" stroke-width="1.5"/>
    <!-- Head -->
    <circle cx="38" cy="12" r="9" fill="#f9fafb" stroke="#374151" stroke-width="2.2"/>
    <circle cx="35" cy="11" r="1.2" fill="#374151"/>
    <circle cx="41" cy="11" r="1.2" fill="#374151"/>
    <!-- Torso -->
    <line x1="38" y1="21" x2="38" y2="64" stroke="#374151" stroke-width="3" stroke-linecap="round"/>
    <!-- Legs -->
    <line x1="38" y1="64" x2="28" y2="90" stroke="#374151" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="38" y1="64" x2="48" y2="90" stroke="#374151" stroke-width="2.5" stroke-linecap="round"/>
    <!-- Non-affected arm (relaxed at side) -->
    <line x1="38" y1="40" x2="24" y2="54" stroke="#374151" stroke-width="2.5" stroke-linecap="round"/>
    <!-- Affected arm reaching to shelf -->
    <line x1="38" y1="40" x2="72" y2="18" stroke="#0066ff" stroke-width="3.5" stroke-linecap="round"/>
    <!-- Hand at shelf item -->
    <circle cx="72" cy="18" r="4.5" fill="white" stroke="#0066ff" stroke-width="2"/>
  </svg>`,

  // Phase 4 — 2: Resistance band series
  band: `<svg viewBox="0 0 110 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="110" height="100" rx="8" fill="#f0f4ff"/>
    <!-- Door / anchor point -->
    <rect x="0" y="44" width="10" height="12" rx="2" fill="#9ca3af"/>
    <circle cx="8" cy="50" r="3" fill="#6b7280"/>
    <!-- Head -->
    <circle cx="64" cy="13" r="9" fill="#f9fafb" stroke="#374151" stroke-width="2.2"/>
    <circle cx="61" cy="12" r="1.2" fill="#374151"/>
    <circle cx="67" cy="12" r="1.2" fill="#374151"/>
    <!-- Torso (angled for external rotation) -->
    <line x1="64" y1="22" x2="64" y2="64" stroke="#374151" stroke-width="3" stroke-linecap="round"/>
    <!-- Legs -->
    <line x1="64" y1="64" x2="54" y2="90" stroke="#374151" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="64" y1="64" x2="74" y2="90" stroke="#374151" stroke-width="2.5" stroke-linecap="round"/>
    <!-- Non-affected arm (at side) -->
    <line x1="64" y1="40" x2="80" y2="54" stroke="#374151" stroke-width="2.5" stroke-linecap="round"/>
    <!-- Affected arm: pulling band in external rotation -->
    <line x1="64" y1="40" x2="40" y2="28" stroke="#0066ff" stroke-width="3.5" stroke-linecap="round"/>
    <!-- Resistance band (elastic, curved path) -->
    <path d="M8,50 Q26,42 40,28" stroke="#0066ff" stroke-width="2.5" fill="none" stroke-dasharray="5,3" stroke-linecap="round"/>
    <!-- Tension dots on band -->
    <circle cx="20" cy="47" r="2.5" fill="#0066ff" opacity="0.4"/>
    <circle cx="32" cy="38" r="2.5" fill="#0066ff" opacity="0.4"/>
    <!-- Movement arrow -->
    <polygon points="38,22 42,30 34,30" fill="#0066ff"/>
    <text x="30" y="98" font-size="8" fill="#0066ff" font-family="system-ui" font-weight="700">밴드 저항 운동</text>
  </svg>`,

  // Phase 4 — 3: Sport-specific training (throwing/serving motion)
  sport: `<svg viewBox="0 0 110 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="110" height="100" rx="8" fill="#f0f4ff"/>
    <!-- Floor / ground -->
    <line x1="4" y1="90" x2="106" y2="90" stroke="#d1d5db" stroke-width="1.5"/>
    <!-- Head (dynamic lean) -->
    <circle cx="38" cy="12" r="9" fill="#f9fafb" stroke="#374151" stroke-width="2.2"/>
    <circle cx="35" cy="11" r="1.2" fill="#374151"/>
    <circle cx="41" cy="11" r="1.2" fill="#374151"/>
    <!-- Torso (rotation lean into throw) -->
    <line x1="38" y1="21" x2="40" y2="62" stroke="#374151" stroke-width="3" stroke-linecap="round"/>
    <!-- Legs (stride stance) -->
    <line x1="40" y1="62" x2="26" y2="90" stroke="#374151" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="40" y1="62" x2="56" y2="82" stroke="#374151" stroke-width="2.5" stroke-linecap="round"/>
    <!-- Lead arm (pointing forward) -->
    <line x1="38" y1="38" x2="22" y2="48" stroke="#374151" stroke-width="2.5" stroke-linecap="round"/>
    <!-- Throwing arm (affected — overhead cocked) -->
    <line x1="38" y1="38" x2="72" y2="16" stroke="#0066ff" stroke-width="3.5" stroke-linecap="round"/>
    <!-- Ball at hand -->
    <circle cx="74" cy="14" r="6" fill="#0066ff" opacity="0.2" stroke="#0066ff" stroke-width="2"/>
    <!-- Release arc (throw path) -->
    <path d="M74,14 Q88,8 94,22" stroke="#0066ff" stroke-width="2" fill="none" stroke-dasharray="4,3" stroke-linecap="round"/>
    <polygon points="92,26 96,18 100,24" fill="#0066ff"/>
    <!-- Speed lines suggesting motion -->
    <line x1="80" y1="30" x2="94" y2="26" stroke="#0066ff" stroke-width="1" opacity="0.4"/>
    <line x1="82" y1="36" x2="96" y2="33" stroke="#0066ff" stroke-width="1" opacity="0.3"/>
    <text x="8" y="100" font-size="8" fill="#0066ff" font-family="system-ui" font-weight="700">스포츠 복귀 훈련</text>
  </svg>`,
};

// ── Exercise program data ──────────────────────────────────────────────────

const PROGRAM = [
  {
    phase: 1,
    name: '급성기',
    nameEn: 'Acute Phase',
    weeks: '1–4주',
    targetAngle: 45,
    color: '#ef4444',
    description: '통증을 줄이고 아주 부드럽게 움직임을 시작합니다. 통증이 느껴지면 즉시 멈추세요.',
    exercises: [
      {
        name: '펜듈럼 운동',
        nameSub: 'Pendulum swings',
        sets: '3세트 × 30초',
        tip: '탁자에 기대어 팔을 자연스럽게 늘어뜨리세요. 중력에 맡겨 작은 원을 그리듯 흔들어줍니다. 억지로 움직이지 마세요.',
        svg: SVG.pendulum,
      },
      {
        name: '막대 도움 팔 올리기',
        nameSub: 'Passive stick elevation',
        sets: '3세트 × 10회',
        tip: '지팡이나 우산을 양손으로 잡으세요. 건강한 팔이 아픈 팔을 밀어 올립니다. 저항이 느껴지는 첫 지점에서 멈추세요.',
        svg: SVG.stickElevation,
      },
      {
        name: '누워서 외회전',
        nameSub: 'External rotation — supine',
        sets: '3세트 × 10회 (3초 유지)',
        tip: '천장을 보고 누우세요. 아픈 팔 팔꿈치를 90도로 구부리고, 건강한 손으로 살며시 바깥쪽으로 밀어줍니다.',
        svg: SVG.supineER,
      },
    ],
  },
  {
    phase: 2,
    name: '중간 회복기',
    nameEn: 'Intermediate Phase',
    weeks: '5–8주',
    targetAngle: 90,
    color: '#f59e0b',
    description: '적극적으로 팔을 들어 올리고 가벼운 근력 운동을 시작합니다.',
    exercises: [
      {
        name: '도르래 팔 올리기',
        nameSub: 'Pulley overhead elevation',
        sets: '3세트 × 15회',
        tip: '문 위에 도르래를 달고 건강한 팔로 줄을 당겨 아픈 팔을 머리 위까지 올립니다. 이 단계 끝에 귀 높이를 목표로 하세요.',
        svg: SVG.pulley,
      },
      {
        name: '벽 손가락 걷기',
        nameSub: 'Wall finger walk',
        sets: '3세트 × 10회',
        tip: '벽을 마주보고 손가락으로 벽을 짚어 위로 올라갑니다. 오늘의 최고점을 표시해두고 내일 더 높이 도전하세요.',
        svg: SVG.wallWalk,
      },
      {
        name: '옆으로 누워 외회전',
        nameSub: 'Side-lying external rotation',
        sets: '3세트 × 15회',
        tip: '건강한 팔 쪽으로 눕고, 아픈 팔 팔꿈치를 90도로 구부립니다. 전완을 천장 방향으로 회전시키세요. 쉬워지면 물병을 들어보세요.',
        svg: SVG.sidelyingER,
      },
    ],
  },
  {
    phase: 3,
    name: '회복기',
    nameEn: 'Recovery Phase',
    weeks: '9–12주',
    targetAngle: 120,
    color: '#10b981',
    description: '기능적인 범위의 동작을 회복하고 근력을 강화합니다.',
    exercises: [
      {
        name: '머리 위 들어 올리기',
        nameSub: 'Active overhead press',
        sets: '3세트 × 12회',
        tip: '가벼운 무게를 들고 머리 위까지 올립니다. 끝 범위에서 어깨가 올라오지 않도록 주의하세요.',
        svg: SVG.overheadPress,
      },
      {
        name: '가슴 앞 스트레칭',
        nameSub: 'Cross-body stretch',
        sets: '3세트 × 30초 유지',
        tip: '아픈 팔을 가슴 앞으로 당깁니다. 당기는 느낌이 있어야 하지만 날카로운 통증은 안 됩니다. 천천히 호흡하며 유지하세요.',
        svg: SVG.crossBody,
      },
      {
        name: '슬리퍼 스트레칭',
        nameSub: 'Sleeper stretch',
        sets: '3세트 × 30초 유지',
        tip: '아픈 쪽으로 누워 팔꿈치를 90도로 구부립니다. 건강한 손으로 손목을 살며시 바닥 방향으로 누르세요. 어깨 뒤쪽 관절낭에 효과적입니다.',
        svg: SVG.sleeper,
      },
    ],
  },
  {
    phase: 4,
    name: '기능 복귀',
    nameEn: 'Return to Function',
    weeks: '13주+',
    targetAngle: 150,
    color: '#0066ff',
    description: '완전한 근력과 협응력을 회복하고 일상과 스포츠로 복귀합니다.',
    exercises: [
      {
        name: '일상 생활 동작',
        nameSub: 'Functional overhead activities',
        sets: '매일',
        tip: '선반 위 물건 잡기, 머리 감기, 빨래 널기 등 생활 속에서 팔을 사용하세요. 보호하지 말고 자연스럽게 움직이세요.',
        svg: SVG.functional,
      },
      {
        name: '저항 밴드 운동',
        nameSub: 'Resistance band series',
        sets: '3세트 × 15회',
        tip: '밴드로 앞 올리기, 옆 올리기, 당기기를 합니다. 통증이 3/10 이하로 유지될 때 강도를 높이세요.',
        svg: SVG.band,
      },
      {
        name: '스포츠 복귀 훈련',
        nameSub: 'Sport-specific training',
        sets: '필요에 따라',
        tip: '골프, 수영, 던지기 등 이전 활동으로 점진적으로 돌아갑니다. 전문 물리치료사에게 종목별 프로그램을 받으세요.',
        svg: SVG.sport,
      },
    ],
  },
];

// ── Public API ─────────────────────────────────────────────────────────────

export function getTargetAngleForPhase(phase) {
  const p = PROGRAM.find(p => p.phase === phase);
  return p ? p.targetAngle : 90;
}

/** Returns the brand color string for a given phase number (1-4). */
export function getPhaseColor(phase) {
  const p = PROGRAM.find(p => p.phase === phase);
  return p ? p.color : '#00B4D8';
}

/** Returns the full program data (read-only reference). */
export function getProgram() {
  return PROGRAM;
}

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

let _selectedPhase = null;

export function renderGuide(container) {
  const currentPhase = getCurrentPhase();
  if (_selectedPhase === null) _selectedPhase = currentPhase;

  container.innerHTML = `
    <div style="padding:16px 16px 88px;background:#f8fafb;min-height:100%;">
      <h2 style="font-size:20px;font-weight:800;color:#111;margin-bottom:2px;">운동 가이드</h2>
      <p style="font-size:13px;color:#777;margin-bottom:18px;">오십견 재활 · 4단계 프로그램</p>
      <div id="guide-pills" style="display:flex;gap:6px;margin-bottom:18px;overflow-x:auto;padding-bottom:2px;-webkit-overflow-scrolling:touch;scrollbar-width:none;"></div>
      <div id="guide-detail"></div>
    </div>
  `;

  _renderPills(container, currentPhase);
  _renderDetail(container, _selectedPhase, currentPhase);
}

function _renderPills(container, currentPhase) {
  container.querySelector('#guide-pills').innerHTML = PROGRAM.map(p => {
    const active = p.phase === _selectedPhase;
    return `<button data-phase="${p.phase}" style="
      flex-shrink:0;padding:7px 14px;border-radius:20px;
      border:2px solid ${active ? p.color : '#ddd'};
      background:${active ? p.color : '#fff'};
      color:${active ? '#fff' : '#888'};
      font-size:12px;font-weight:700;cursor:pointer;white-space:nowrap;">
      ${p.phase}단계 · ${p.weeks}
    </button>`;
  }).join('');

  container.querySelector('#guide-pills').querySelectorAll('button[data-phase]').forEach(btn => {
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
          <div style="font-size:10px;font-weight:700;opacity:0.75;text-transform:uppercase;letter-spacing:0.07em;">${p.phase}단계 · ${p.weeks}</div>
          <div style="font-size:19px;font-weight:800;margin-top:3px;">${p.name}</div>
          <div style="font-size:12px;opacity:0.75;margin-top:1px;">${p.nameEn}</div>
        </div>
        <div style="text-align:right;flex-shrink:0;">
          <div style="font-size:34px;font-weight:800;line-height:1;">${p.targetAngle}°</div>
          <div style="font-size:10px;opacity:0.75;">목표 각도</div>
        </div>
      </div>
      <div style="font-size:13px;opacity:0.88;line-height:1.6;">${p.description}</div>
      ${isCurrent ? `<div style="margin-top:10px;display:inline-flex;align-items:center;gap:5px;background:rgba(255,255,255,0.22);padding:4px 10px;border-radius:20px;font-size:11px;font-weight:700;">✓ 현재 내 단계</div>` : ''}
    </div>

    <div style="background:#e8f4ff;border-radius:10px;padding:12px 14px;margin-bottom:14px;display:flex;align-items:center;gap:12px;">
      <div style="width:44px;height:44px;border-radius:50%;background:${p.color};display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;color:#fff;flex-shrink:0;line-height:1;">${p.targetAngle}°</div>
      <div>
        <div style="font-size:13px;font-weight:700;color:#111;">측정 화면에서 목표 확인</div>
        <div style="font-size:12px;color:#555;margin-top:2px;line-height:1.4;">카메라 화면에 점선 호가 표시되어 목표 각도를 안내합니다.</div>
      </div>
    </div>

    <div style="display:flex;flex-direction:column;gap:12px;margin-bottom:14px;">
      ${p.exercises.map(ex => `
        <div style="background:#fff;border-radius:14px;overflow:hidden;border:1.5px solid #ececec;">
          <!-- SVG illustration -->
          <div style="background:#f9fafb;padding:12px;display:flex;justify-content:center;border-bottom:1px solid #f0f0f0;">
            <div style="width:110px;height:100px;">${ex.svg}</div>
          </div>
          <!-- Content -->
          <div style="padding:14px;">
            <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;margin-bottom:7px;">
              <div>
                <div style="font-size:15px;font-weight:800;color:#111;line-height:1.2;">${ex.name}</div>
                <div style="font-size:11px;color:#999;margin-top:2px;">${ex.nameSub}</div>
              </div>
              <div style="font-size:11px;font-weight:700;color:${p.color};background:${p.color}18;padding:3px 8px;border-radius:20px;white-space:nowrap;flex-shrink:0;">${ex.sets}</div>
            </div>
            <div style="font-size:13px;color:#555;line-height:1.6;">${ex.tip}</div>
          </div>
        </div>
      `).join('')}
    </div>

    <div style="padding:12px 14px;background:#fffbeb;border-radius:10px;border-left:3px solid #f59e0b;">
      <div style="font-size:12px;font-weight:700;color:#92400e;margin-bottom:3px;">주의사항</div>
      <div style="font-size:12px;color:#78350f;line-height:1.6;">통증이 4/10을 넘으면 즉시 멈추세요. 스트레칭 시 2–3/10의 불편감은 정상입니다. 단계를 올리기 전에 반드시 담당 물리치료사와 상담하세요.</div>
    </div>
  `;
}
