const fs = require('fs');
const path = require('path');

/**
 * 🧭 Guardian V9.0 (Multi-Spec Audit)
 * README.md および ROUTE_NAVIGATION_HISTORY_SPEC.md を正典とし、
 * 実装（App.tsx, index.css, HelpBaseline.tsx）との整合性を物理的に強制する。
 */

const SPECS = {
  readme: path.join(__dirname, '../README.md'),
  ui_spec: path.join(__dirname, '../docs/specifications/GUARDIAN_UI_SPEC.md'),
  route_spec: path.join(__dirname, '../docs/specifications/ROUTE_NAVIGATION_HISTORY_SPEC.md')
};

const CODE = {
  app: path.join(__dirname, '../src/App.tsx'),
  css: path.join(__dirname, '../src/index.css'),
  help: path.join(__dirname, '../src/HelpBaseline.tsx')
};

function audit() {
  let errors = [];
  const readme = fs.readFileSync(SPECS.readme, 'utf8');
  const ui_spec = fs.readFileSync(SPECS.ui_spec, 'utf8');
  const route_spec = fs.readFileSync(SPECS.route_spec, 'utf8');
  const app = fs.readFileSync(CODE.app, 'utf8');
  const css = fs.readFileSync(CODE.css, 'utf8');
  const help = fs.readFileSync(CODE.help, 'utf8');

  console.log('\x1b[36m%s\x1b[0m', '--- [🧭 Guardian V9.0: Multi-Spec Integrity Audit] ---');

  // --- 1. 核心ロジック監査 (Logic Check) ---
  console.log('Phase 1: Core Logic & Specification Sync...');

  // 検索閾値の監査 (GUARDIAN_UI_SPEC.md にて 0.4 と定義)
  if (!app.includes('threshold: 0.4')) {
    errors.push('[!] Logic Error: Fuse.js threshold must be 0.4 as defined in GUARDIAN_UI_SPEC.md');
  }

  // 巡回ルート案内 (ROUTE_NAVIGATION_HISTORY_SPEC.md)
  const routeRequirements = [
    { id: 'DND_STRUCTURE', match: 'DndContext', desc: 'Drag & Drop Structure' },
    { id: 'COLOR_LOGIC_START', match: '#FF0000', desc: 'Start Point Color (Red)' },
    { id: 'COLOR_LOGIC_MID', match: '#00FF00', desc: 'Intermediate Point Color (Green)' },
    { id: 'COLOR_LOGIC_END', match: '#0000FF', desc: 'End Point Color (Blue)' }
  ];

  routeRequirements.forEach(req => {
    if (!app.includes(req.match)) {
      errors.push(`[!] Logic Error: Missing "${req.desc}" structure in App.tsx (Required by ROUTE_NAVIGATION_HISTORY_SPEC.md)`);
    }
  });

  // --- 2. UIベースライン監査 (CSS & Layout) ---
  console.log('Phase 2: UI Baseline & CSS Audit...');

  const checkCSS = (selector, prop, expectedValue) => {
    const regex = new RegExp(`${selector}[^{]*{[^}]*${prop}:\\s*([^;]+);`, 's');
    const match = css.match(regex);
    if (!match) {
      errors.push(`[!] CSS Error: Selector "${selector}" or property "${prop}" not found.`);
    } else if (match[1].trim() !== expectedValue) {
      errors.push(`[!] Style Drift: ${selector} { ${prop}: ${match[1].trim()} } != Spec (${expectedValue})`);
    }
  };

  checkCSS('.fav-footer-btn', 'bottom', '170px');
  checkCSS('.history-btn', 'bottom', '100px');
  checkCSS('.bottom-right-actions', 'bottom', '30px');

  // マーカー仕様の監査
  if (!app.includes('22 / scale') || !app.includes('5 / scale')) {
    errors.push('[!] UI Error: Marker Radius (22/scale) or Stroke (5/scale) deviates from UI Baseline.');
  }

  // --- 3. ヘルプ文言の完全同期 (Content Sync) ---
  console.log('Phase 3: Content Sync Audit...');
  const helpItems = [
    'マップ切替', '検索', 'ジャンプボタン', 'お気に入り', 'ナビゲーション',
    '地図上の記号', '地図ボタン'
  ];
  helpItems.forEach(item => {
    if (!help.includes(item)) errors.push(`[!] Content Error: Help item "${item}" missing from HelpBaseline.tsx`);
    if (!readme.includes(item)) errors.push(`[!] Spec Error: Help item "${item}" missing from README.md`);
  });

  // --- 判定結果 ---
  if (errors.length > 0) {
    console.log('\n\x1b[31m%s\x1b[0m', '--- !!! COMPLIANCE SYNC FAILED !!! ---');
    errors.forEach(err => console.log('\x1b[31m%s\x1b[0m', err));
    console.log('\n[!] 実装が最新の仕様書（README / ROUTE_SPEC）に追いついていません。修正が必要です。');
    process.exit(1);
  } else {
    console.log('\n\x1b[32m%s\x1b[0m', '✓ [GUARDIAN] ALL SPECS ARE PERFECTLY SYNCED.');
    process.exit(0);
  }
}



try { audit(); } catch (e) { process.exit(1); }
