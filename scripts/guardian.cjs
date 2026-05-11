const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SACRED_FILES = {
  readme: path.join(__dirname, '../README.md'),
  css: path.join(__dirname, '../src/index.css'),
  app: path.join(__dirname, '../src/App.tsx'),
  help: path.join(__dirname, '../src/HelpBaseline.tsx')
};

function check() {
  let errors = [];
  const readme = fs.readFileSync(SACRED_FILES.readme, 'utf8');
  const app = fs.readFileSync(SACRED_FILES.app, 'utf8');
  const css = fs.readFileSync(SACRED_FILES.css, 'utf8');

  console.log('--- Phase 1: README-Synchronized Auto Audit (V6) ---');

  // 1. デザイン数値の自動同期抽出
  const extractPx = (id) => {
    const regex = new RegExp(`${id}.*?下から(\\d+)px`);
    const match = readme.match(regex);
    return match ? match[1] : null;
  };

  const posFav = extractPx('fav-footer-btn');
  const posHist = extractPx('history-btn');
  const posActions = extractPx('bottom-right-actions');

  if (posFav && !css.includes(`bottom: ${posFav}px;`)) errors.push(`[!] Sync Error: CSS bottom for fav-btn doesn't match README (${posFav}px)`);
  if (posHist && !css.includes(`bottom: ${posHist}px;`)) errors.push(`[!] Sync Error: CSS bottom for history-btn doesn't match README (${posHist}px)`);
  if (posActions && !css.includes(`bottom: ${posActions}px;`)) errors.push(`[!] Sync Error: CSS bottom for actions doesn't match README (${posActions}px)`);

  // 2. 履歴の並び順の自動同期
  const isAscending = readme.includes('昇順');
  const hasReverse = app.includes('.slice().reverse().map');
  
  if (isAscending && hasReverse) {
    errors.push('[!] Sync Error: README says ASCENDING, but App.tsx uses .reverse() (Descending)!');
  } else if (!isAscending && !hasReverse) {
    errors.push('[!] Sync Error: README says DESCENDING, but App.tsx is missing .reverse()!');
  }

  // 3. 核心機能キーワードの存在チェック
  const functionalKeywords = [
    { id: 'FUSE_JS', match: 'new Fuse' },
    { id: 'PINCH_ZOOM', match: 'Math.hypot' },
    { id: 'FAV_STORAGE', match: 'fs2026_favorites' }
  ];

  functionalKeywords.forEach(k => {
    if (!app.includes(k.match)) errors.push(`[!] Logic Error: Core function ${k.id} is missing from App.tsx`);
  });

  // 4. Git Diff
  console.log('--- Phase 2: Unauthorized Change Audit ---');
  try {
    const diff = execSync('git diff HEAD', { encoding: 'utf8' });
    if (diff) {
      console.log('\x1b[33m%s\x1b[0m', '[⚠️] UNCOMMITTED CHANGES DETECTED:');
      console.log(diff);
    }
  } catch (e) {}

  if (errors.length > 0) {
    console.log('\x1b[31m%s\x1b[0m', '--- !!! COMPLIANCE SYNC FAILED !!! ---');
    errors.forEach(err => console.log(err));
    process.exit(1);
  } else {
    console.log('\x1b[32m%s\x1b[0m', '✓ README AND CODE ARE PERFECTLY SYNCED.');
    process.exit(0);
  }
}

check();
