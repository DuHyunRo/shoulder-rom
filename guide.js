/**
 * Patient Exercise Guide — Frozen Shoulder Rehabilitation Protocol
 * Based on standard physiotherapy guidelines: 4-phase progressive program.
 *
 * Each exercise includes an inline SVG illustration for elderly-first UX.
 * Phase is auto-detected from best session ROM to date.
 * Target angle is exported so the camera HUD and Measure screen can display it.
 */

// ── SVG stick-figure illustrations ─────────────────────────────────────────
// Consistent style: viewBox 0 0 110 100, #333 body, accent red = affected arm
// Stroke-based, no fills for clarity at small sizes.

const SVG = {

  pendulum: `<svg viewBox="0 0 110 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- Table surface -->
    <rect x="4" y="40" width="36" height="5" rx="2" fill="#d1d5db"/>
    <rect x="8" y="45" width="5" height="22" fill="#d1d5db"/>
    <!-- Head -->
    <circle cx="58" cy="11" r="8" stroke="#374151" stroke-width="2.5" fill="white"/>
    <!-- Torso (leaning ~45°) -->
    <line x1="58" y1="19" x2="36" y2="40" stroke="#374151" stroke-width="2.5" stroke-linecap="round"/>
    <!-- Hand on table -->
    <line x1="36" y1="40" x2="18" y2="40" stroke="#374151" stroke-width="2.5" stroke-linecap="round"/>
    <!-- Affected arm hanging -->
    <line x1="36" y1="40" x2="60" y2="72" stroke="#ef4444" stroke-width="3" stroke-linecap="round"/>
    <!-- Circular arrow showing swing -->
    <path d="M60,72 A14,14,0,0,1,82,64" stroke="#ef4444" stroke-width="2" fill="none" stroke-linecap="round" stroke-dasharray="3,2"/>
    <polygon points="80,60 82,64 78,66" fill="#ef4444"/>
    <!-- Legs -->
    <line x1="36" y1="40" x2="26" y2="70" stroke="#374151" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="36" y1="40" x2="44" y2="70" stroke="#374151" stroke-width="2.5" stroke-linecap="round"/>
    <!-- Label -->
    <text x="55" y="90" font-size="9" fill="#ef4444" font-weight="700" font-family="system-ui">중력으로 흔들기</text>
  </svg>`,

  stickElevation: `<svg viewBox="0 0 110 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- Head -->
    <circle cx="55" cy="11" r="8" stroke="#374151" stroke-width="2.5" fill="white"/>
    <!-- Torso -->
    <line x1="55" y1="19" x2="55" y2="58" stroke="#374151" stroke-width="2.5" stroke-linecap="round"/>
    <!-- Legs -->
    <line x1="55" y1="58" x2="44" y2="82" stroke="#374151" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="55" y1="58" x2="66" y2="82" stroke="#374151" stroke-width="2.5" stroke-linecap="round"/>
    <!-- Good arm (holding stick, lower) -->
    <line x1="55" y1="34" x2="38" y2="55" stroke="#374151" stroke-width="2.5" stroke-linecap="round"/>
    <!-- Affected arm (raised by stick) -->
    <line x1="55" y1="34" x2="76" y2="14" stroke="#ef4444" stroke-width="3" stroke-linecap="round"/>
    <!-- Stick -->
    <line x1="38" y1="55" x2="76" y2="14" stroke="#6b7280" stroke-width="2" stroke-linecap="round" stroke-dasharray="4,2"/>
    <!-- Arrow up -->
    <polygon points="76,9 80,18 72,18" fill="#ef4444"/>
    <text x="22" y="95" font-size="9" fill="#ef4444" font-weight="700" font-family="system-ui">막대로 아픈 팔 올리기</text>
  </svg>`,

  supineER: `<svg viewBox="0 0 110 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- Floor line -->
    <line x1="5" y1="72" x2="105" y2="72" stroke="#d1d5db" stroke-width="2"/>
    <!-- Head (lying) -->
    <circle cx="18" cy="60" r="8" stroke="#374151" stroke-width="2.5" fill="white"/>
    <!-- Torso (horizontal) -->
    <line x1="26" y1="60" x2="80" y2="60" stroke="#374151" stroke-width="2.5" stroke-linecap="round"/>
    <!-- Legs -->
    <line x1="80" y1="60" x2="92" y2="68" stroke="#374151" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="80" y1="60" x2="100" y2="62" stroke="#374151" stroke-width="2.5" stroke-linecap="round"/>
    <!-- Upper arm (horizontal) -->
    <line x1="50" y1="60" x2="50" y2="42" stroke="#ef4444" stroke-width="3" stroke-linecap="round"/>
    <!-- Forearm bent 90° rotating outward -->
    <line x1="50" y1="42" x2="72" y2="38" stroke="#ef4444" stroke-width="3" stroke-linecap="round"/>
    <!-- Rotation arrow -->
    <path d="M68,30 A10,10,0,0,1,50,38" stroke="#ef4444" stroke-width="2" fill="none" stroke-dasharray="3,2" stroke-linecap="round"/>
    <polygon points="50,34 46,40 54,40" fill="#ef4444"/>
    <text x="12" y="92" font-size="9" fill="#ef4444" font-weight="700" font-family="system-ui">누워서 팔꿈치 90° 회전</text>
  </svg>`,

  pulley: `<svg viewBox="0 0 110 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- Pulley wheel at top -->
    <circle cx="55" cy="8" r="6" stroke="#6b7280" stroke-width="2" fill="white"/>
    <!-- Door frame suggestion -->
    <line x1="49" y1="0" x2="49" y2="20" stroke="#d1d5db" stroke-width="3"/>
    <line x1="61" y1="0" x2="61" y2="20" stroke="#d1d5db" stroke-width="3"/>
    <!-- Rope left (good arm pulls down) -->
    <line x1="50" y1="12" x2="38" y2="40" stroke="#6b7280" stroke-width="2" stroke-dasharray="4,2"/>
    <!-- Rope right (affected arm goes up) -->
    <line x1="60" y1="12" x2="72" y2="38" stroke="#6b7280" stroke-width="2" stroke-dasharray="4,2"/>
    <!-- Head -->
    <circle cx="55" cy="28" r="8" stroke="#374151" stroke-width="2.5" fill="white"/>
    <!-- Torso -->
    <line x1="55" y1="36" x2="55" y2="72" stroke="#374151" stroke-width="2.5" stroke-linecap="round"/>
    <!-- Good arm (down, pulling) -->
    <line x1="55" y1="50" x2="38" y2="62" stroke="#374151" stroke-width="2.5" stroke-linecap="round"/>
    <!-- Affected arm (up) -->
    <line x1="55" y1="50" x2="72" y2="36" stroke="#ef4444" stroke-width="3" stroke-linecap="round"/>
    <!-- Legs -->
    <line x1="55" y1="72" x2="44" y2="92" stroke="#374151" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="55" y1="72" x2="66" y2="92" stroke="#374151" stroke-width="2.5" stroke-linecap="round"/>
    <!-- Arrow up on affected arm -->
    <polygon points="72,31 76,40 68,40" fill="#ef4444"/>
  </svg>`,

  wallWalk: `<svg viewBox="0 0 110 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- Wall -->
    <rect x="82" y="0" width="8" height="100" fill="#e5e7eb"/>
    <!-- Head -->
    <circle cx="48" cy="14" r="8" stroke="#374151" stroke-width="2.5" fill="white"/>
    <!-- Torso -->
    <line x1="48" y1="22" x2="48" y2="62" stroke="#374151" stroke-width="2.5" stroke-linecap="round"/>
    <!-- Legs -->
    <line x1="48" y1="62" x2="38" y2="86" stroke="#374151" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="48" y1="62" x2="58" y2="86" stroke="#374151" stroke-width="2.5" stroke-linecap="round"/>
    <!-- Good arm (lower on wall) -->
    <line x1="48" y1="38" x2="82" y2="52" stroke="#374151" stroke-width="2.5" stroke-linecap="round"/>
    <!-- Affected arm (higher on wall) -->
    <line x1="48" y1="38" x2="82" y2="22" stroke="#ef4444" stroke-width="3" stroke-linecap="round"/>
    <!-- Finger dots on wall -->
    <circle cx="82" cy="52" r="3" fill="#374151"/>
    <circle cx="82" cy="22" r="3" fill="#ef4444"/>
    <!-- Arrow going up on wall -->
    <polygon points="82,14 86,24 78,24" fill="#ef4444"/>
    <text x="10" y="98" font-size="9" fill="#ef4444" font-weight="700" font-family="system-ui">벽 따라 손가락 올리기</text>
  </svg>`,

  sidelyingER: `<svg viewBox="0 0 110 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- Floor -->
    <line x1="5" y1="78" x2="105" y2="78" stroke="#d1d5db" stroke-width="2"/>
    <!-- Head (on side) -->
    <circle cx="16" cy="62" r="8" stroke="#374151" stroke-width="2.5" fill="white"/>
    <!-- Torso (horizontal) -->
    <line x1="24" y1="62" x2="78" y2="62" stroke="#374151" stroke-width="2.5" stroke-linecap="round"/>
    <!-- Bottom legs -->
    <line x1="78" y1="62" x2="94" y2="70" stroke="#374151" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="78" y1="62" x2="102" y2="62" stroke="#374151" stroke-width="2.5" stroke-linecap="round"/>
    <!-- Upper arm perpendicular to torso -->
    <line x1="48" y1="62" x2="48" y2="44" stroke="#ef4444" stroke-width="3" stroke-linecap="round"/>
    <!-- Forearm rotating toward ceiling -->
    <line x1="48" y1="44" x2="68" y2="34" stroke="#ef4444" stroke-width="3" stroke-linecap="round"/>
    <!-- Arc arrow showing rotation up -->
    <path d="M48,44 A14,14,0,0,1,62,30" stroke="#ef4444" stroke-width="2" fill="none" stroke-dasharray="3,2" stroke-linecap="round"/>
    <polygon points="66,26 62,34 58,30" fill="#ef4444"/>
    <text x="10" y="96" font-size="9" fill="#ef4444" font-weight="700" font-family="system-ui">옆으로 누워 팔 회전</text>
  </svg>`,

  overheadPress: `<svg viewBox="0 0 110 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- Head -->
    <circle cx="55" cy="12" r="8" stroke="#374151" stroke-width="2.5" fill="white"/>
    <!-- Torso -->
    <line x1="55" y1="20" x2="55" y2="58" stroke="#374151" stroke-width="2.5" stroke-linecap="round"/>
    <!-- Legs -->
    <line x1="55" y1="58" x2="44" y2="82" stroke="#374151" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="55" y1="58" x2="66" y2="82" stroke="#374151" stroke-width="2.5" stroke-linecap="round"/>
    <!-- Good arm (bent at side) -->
    <line x1="55" y1="36" x2="36" y2="48" stroke="#374151" stroke-width="2.5" stroke-linecap="round"/>
    <!-- Affected arm fully raised -->
    <line x1="55" y1="36" x2="74" y2="8" stroke="#ef4444" stroke-width="3" stroke-linecap="round"/>
    <!-- Weight circle at hand -->
    <circle cx="76" cy="6" r="5" stroke="#ef4444" stroke-width="2" fill="white"/>
    <!-- Arrow up -->
    <polygon points="74,0 78,8 70,8" fill="#ef4444"/>
    <text x="18" y="96" font-size="9" fill="#ef4444" font-weight="700" font-family="system-ui">아픈 팔 위로 들기</text>
  </svg>`,

  crossBody: `<svg viewBox="0 0 110 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- Head -->
    <circle cx="55" cy="12" r="8" stroke="#374151" stroke-width="2.5" fill="white"/>
    <!-- Torso -->
    <line x1="55" y1="20" x2="55" y2="60" stroke="#374151" stroke-width="2.5" stroke-linecap="round"/>
    <!-- Legs -->
    <line x1="55" y1="60" x2="44" y2="84" stroke="#374151" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="55" y1="60" x2="66" y2="84" stroke="#374151" stroke-width="2.5" stroke-linecap="round"/>
    <!-- Good arm (holding affected arm) -->
    <line x1="55" y1="36" x2="74" y2="44" stroke="#374151" stroke-width="2.5" stroke-linecap="round"/>
    <!-- Affected arm crossing body -->
    <line x1="55" y1="36" x2="30" y2="44" stroke="#ef4444" stroke-width="3" stroke-linecap="round"/>
    <!-- Good hand holding affected wrist -->
    <circle cx="30" cy="44" r="4" stroke="#374151" stroke-width="2" fill="white"/>
    <!-- Arrow showing pull across -->
    <polygon points="22,44 30,40 30,48" fill="#374151"/>
    <text x="14" y="96" font-size="9" fill="#ef4444" font-weight="700" font-family="system-ui">가슴 앞으로 당기기</text>
  </svg>`,

  sleeper: `<svg viewBox="0 0 110 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- Floor -->
    <line x1="5" y1="76" x2="105" y2="76" stroke="#d1d5db" stroke-width="2"/>
    <!-- Head -->
    <circle cx="16" cy="58" r="8" stroke="#374151" stroke-width="2.5" fill="white"/>
    <!-- Torso -->
    <line x1="24" y1="58" x2="80" y2="58" stroke="#374151" stroke-width="2.5" stroke-linecap="round"/>
    <!-- Legs -->
    <line x1="80" y1="58" x2="98" y2="66" stroke="#374151" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="80" y1="58" x2="104" y2="58" stroke="#374151" stroke-width="2.5" stroke-linecap="round"/>
    <!-- Upper arm (affected, perpendicular) -->
    <line x1="50" y1="58" x2="50" y2="40" stroke="#ef4444" stroke-width="3" stroke-linecap="round"/>
    <!-- Forearm (being pressed down) -->
    <line x1="50" y1="40" x2="30" y2="48" stroke="#ef4444" stroke-width="3" stroke-linecap="round"/>
    <!-- Good hand pressing wrist down -->
    <circle cx="28" cy="48" r="4" stroke="#374151" stroke-width="2" fill="white"/>
    <!-- Arrow down -->
    <polygon points="28,56 32,48 24,48" fill="#374151"/>
    <text x="12" y="94" font-size="9" fill="#ef4444" font-weight="700" font-family="system-ui">손목 눌러 스트레칭</text>
  </svg>`,

  functional: `<svg viewBox="0 0 110 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- Cabinet shelf -->
    <rect x="70" y="20" width="34" height="5" rx="1" fill="#d1d5db"/>
    <rect x="70" y="14" width="34" height="6" rx="1" fill="#e5e7eb"/>
    <!-- Cabinet item -->
    <rect x="80" y="8" width="12" height="12" rx="2" fill="#bfdbfe"/>
    <!-- Head -->
    <circle cx="38" cy="14" r="8" stroke="#374151" stroke-width="2.5" fill="white"/>
    <!-- Torso -->
    <line x1="38" y1="22" x2="38" y2="62" stroke="#374151" stroke-width="2.5" stroke-linecap="round"/>
    <!-- Legs -->
    <line x1="38" y1="62" x2="28" y2="86" stroke="#374151" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="38" y1="62" x2="48" y2="86" stroke="#374151" stroke-width="2.5" stroke-linecap="round"/>
    <!-- Good arm (at side) -->
    <line x1="38" y1="38" x2="22" y2="52" stroke="#374151" stroke-width="2.5" stroke-linecap="round"/>
    <!-- Affected arm reaching up to shelf -->
    <line x1="38" y1="38" x2="70" y2="18" stroke="#ef4444" stroke-width="3" stroke-linecap="round"/>
    <text x="10" y="100" font-size="9" fill="#ef4444" font-weight="700" font-family="system-ui">선반 위 물건 잡기</text>
  </svg>`,

  band: `<svg viewBox="0 0 110 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- Anchor point (door/wall) -->
    <rect x="0" y="50" width="8" height="8" rx="1" fill="#d1d5db"/>
    <!-- Head -->
    <circle cx="60" cy="14" r="8" stroke="#374151" stroke-width="2.5" fill="white"/>
    <!-- Torso -->
    <line x1="60" y1="22" x2="60" y2="62" stroke="#374151" stroke-width="2.5" stroke-linecap="round"/>
    <!-- Legs -->
    <line x1="60" y1="62" x2="50" y2="86" stroke="#374151" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="60" y1="62" x2="70" y2="86" stroke="#374151" stroke-width="2.5" stroke-linecap="round"/>
    <!-- Good arm (at side) -->
    <line x1="60" y1="38" x2="76" y2="52" stroke="#374151" stroke-width="2.5" stroke-linecap="round"/>
    <!-- Affected arm with band -->
    <line x1="60" y1="38" x2="38" y2="26" stroke="#ef4444" stroke-width="3" stroke-linecap="round"/>
    <!-- Band (elastic, curved) -->
    <path d="M8,54 Q24,44 38,28" stroke="#10b981" stroke-width="2.5" fill="none" stroke-dasharray="4,2" stroke-linecap="round"/>
    <!-- Arrow up on affected arm -->
    <polygon points="36,20 40,28 32,28" fill="#ef4444"/>
    <text x="18" y="100" font-size="9" fill="#ef4444" font-weight="700" font-family="system-ui">밴드로 저항 운동</text>
  </svg>`,

  sport: `<svg viewBox="0 0 110 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- Head -->
    <circle cx="40" cy="14" r="8" stroke="#374151" stroke-width="2.5" fill="white"/>
    <!-- Torso (slight lean) -->
    <line x1="40" y1="22" x2="42" y2="62" stroke="#374151" stroke-width="2.5" stroke-linecap="round"/>
    <!-- Legs -->
    <line x1="42" y1="62" x2="30" y2="86" stroke="#374151" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="42" y1="62" x2="56" y2="82" stroke="#374151" stroke-width="2.5" stroke-linecap="round"/>
    <!-- Non-dominant arm -->
    <line x1="40" y1="38" x2="24" y2="50" stroke="#374151" stroke-width="2.5" stroke-linecap="round"/>
    <!-- Throwing/reaching arm (affected, extended back) -->
    <line x1="40" y1="38" x2="74" y2="20" stroke="#ef4444" stroke-width="3" stroke-linecap="round"/>
    <!-- Motion arc (throw/reach direction) -->
    <path d="M74,20 Q86,10 90,24" stroke="#ef4444" stroke-width="2" fill="none" stroke-dasharray="3,2" stroke-linecap="round"/>
    <polygon points="88,28 92,20 96,26" fill="#ef4444"/>
    <text x="8" y="100" font-size="9" fill="#ef4444" font-weight="700" font-family="system-ui">일상 & 스포츠 복귀</text>
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
