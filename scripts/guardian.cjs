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

  // 1. 【全コード精査】仕様書（正規の状態）との照合
  console.log('--- Phase 1: Full-System Specification Audit ---');
  
  // UI位置とカラーの全件チェック
  if (fs.existsSync(SACRED_FILES.css)) {
    const css = fs.readFileSync(SACRED_FILES.css, 'utf8');
    const requirements = [
      { id: 'UI_FAV_BTN', match: 'bottom: 170px;' },
      { id: 'UI_HIST_BTN', match: 'bottom: 100px;' },
      { id: 'UI_ACTIONS', match: 'bottom: 30px;' },
      { id: 'UI_COLORS', match: 'background: #f59e0b;' }
    ];
    requirements.forEach(r => {
      if (!css.includes(r.match)) errors.push(`[!] Specification Broken: ${r.id} missing or changed in index.css`);
    });
  }

  // ヘルプの完全性チェック（1〜9項目）
  if (fs.existsSync(SACRED_FILES.help)) {
    const help = fs.readFileSync(SACRED_FILES.help, 'utf8');
    for (let i = 1; i <= 9; i++) {
      if (!help.includes(`${i}.`)) errors.push(`[!] Specification Broken: Help Item ${i} is missing!`);
    }
    if (!help.includes('TypeScript') || !help.includes('React (v19)')) {
      errors.push('[!] Specification Broken: Tech Stack info has been altered!');
    }
  }

  // 核心ロジックのチェック
  if (fs.existsSync(SACRED_FILES.app)) {
    const app = fs.readFileSync(SACRED_FILES.app, 'utf8');
    if (!app.includes('const r = 22 / scale;')) errors.push('[!] Specification Broken: MARKER_RADIUS changed!');
    if (!app.includes('.slice().reverse().map')) errors.push('[!] Specification Broken: HISTORY_ORDER (Descending) changed!');
  }

  // 2. 【差異の抽出】直前のGit状態（HEAD）との比較
  console.log('--- Phase 2: Diff Detection (Justification Required) ---');
  try {
    const diff = execSync('git diff HEAD', { encoding: 'utf8' });
    if (diff) {
      console.log('\x1b[33m%s\x1b[0m', '[⚠️] Differences detected from official baseline (HEAD):');
      console.log(diff);
      console.log('\x1b[33m%s\x1b[0m', '--------------------------------------------------------');
      console.log('Ensure these changes are EXACTLY as instructed. Any unauthorized diff is a violation.');
    } else {
      console.log('\x1b[32m%s\x1b[0m', '✓ No differences from official baseline.');
    }
  } catch (e) {
    console.error('Error running git diff:', e.message);
  }

  if (errors.length > 0) {
    console.log('\x1b[31m%s\x1b[0m', '--- !!! AUDIT FAILED !!! ---');
    errors.forEach(err => console.log(err));
    process.exit(1);
  } else {
    console.log('\x1b[32m%s\x1b[0m', '✓ AUDIT PASSED: All specifications are intact.');
    process.exit(0);
  }
}

check();
