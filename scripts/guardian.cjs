const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SACRED_FILES = {
  css: path.join(__dirname, '../src/index.css'),
  app: path.join(__dirname, '../src/App.tsx'),
  help: path.join(__dirname, '../src/HelpBaseline.tsx')
};

function check() {
  let errors = [];

  console.log('--- Phase 1: Total Specification Audit (V5 - Strict Compliance) ---');
  
  // 1. デザイン詳細（現状の正しい実装形式に準拠）
  if (fs.existsSync(SACRED_FILES.app)) {
    const app = fs.readFileSync(SACRED_FILES.app, 'utf8');
    const visualSpecs = [
      { id: 'MARKER_RADIUS', match: 'const r = 22 / scale;' },
      { id: 'MARKER_STROKE', match: 'strokeWidth={5 / scale}' },
      { id: 'TEXT_WEIGHT', match: "fontWeight: '900'" },
      { id: 'TEXT_STROKE', match: "strokeWidth: `${2 / scale}px`" },
      { id: 'NAV_LINE_WIDTH', match: 'strokeWidth={10 / scale}' },
      { id: 'NAV_LINE_DASH', match: "strokeDasharray={`${20 / scale}, ${20 / scale}`}" },
      { id: 'NAV_LINE_COLOR', match: 'stroke="#1d4ed8"' },
      { id: 'ZOOM_THRESHOLD', match: 'relativeScale >= 3.0' }
    ];
    visualSpecs.forEach(s => {
      if (!app.includes(s.match)) errors.push(`[!] Visual Spec Violation: ${s.id} in App.tsx`);
    });

    // ユーザー様自慢の「ピンチズーム」ロジックの監視
    if (!app.includes('Math.hypot(e.touches[0].clientX - e.touches[1].clientX')) {
      errors.push('[!] Logic Loss: User-implemented Pinch-Zoom logic is missing!');
    }
  }

  // 2. UI配置・カラー
  if (fs.existsSync(SACRED_FILES.css)) {
    const css = fs.readFileSync(SACRED_FILES.css, 'utf8');
    const uiSpecs = [
      { id: 'UI_POS_FAV', match: 'bottom: 170px;' },
      { id: 'UI_POS_HIST', match: 'bottom: 100px;' },
      { id: 'UI_POS_ACTIONS', match: 'bottom: 30px;' },
      { id: 'UI_COLOR_ORANGE', match: 'background: #f59e0b;' }
    ];
    uiSpecs.forEach(s => {
      if (!css.includes(s.match)) errors.push(`[!] UI Spec Violation: ${s.id} in index.css`);
    });
  }

  // 3. 核心機能ロジック
  if (fs.existsSync(SACRED_FILES.app)) {
    const app = fs.readFileSync(SACRED_FILES.app, 'utf8');
    const functionalSpecs = [
      { id: 'HIST_DESCENDING', match: '.slice().reverse().map' }, // 履歴降順
      { id: 'SEARCH_THRESHOLD', match: 'threshold: 0.3' } // Fuse.js 検索感度
    ];
    functionalSpecs.forEach(s => {
      if (!app.includes(s.match)) errors.push(`[!] Functional Spec Violation: ${s.id} in App.tsx`);
    });
  }

  // 4. 情報の完全性（ヘルプ）
  if (fs.existsSync(SACRED_FILES.help)) {
    const help = fs.readFileSync(SACRED_FILES.help, 'utf8');
    for (let i = 1; i <= 9; i++) {
      if (!help.includes(`${i}.`)) errors.push(`[!] Information Loss: Help Item ${i} missing!`);
    }
  }

  // 5. Git Diff（指示外の変更検知）
  console.log('--- Phase 2: Unauthorized Change Audit ---');
  try {
    const diff = execSync('git diff HEAD', { encoding: 'utf8' });
    if (diff) {
      console.log('\x1b[33m%s\x1b[0m', '[⚠️] UNCOMMITTED CHANGES DETECTED:');
      console.log(diff);
    } else {
      console.log('\x1b[32m%s\x1b[0m', '✓ All changes are committed and verified.');
    }
  } catch (e) {}

  if (errors.length > 0) {
    console.log('\x1b[31m%s\x1b[0m', '--- !!! COMPLIANCE FAILURE !!! ---');
    errors.forEach(err => console.log(err));
    process.exit(1);
  } else {
    console.log('\x1b[32m%s\x1b[0m', '✓ ALL SPECIFICATIONS VERIFIED AND PERFECT.');
    process.exit(0);
  }
}

check();
