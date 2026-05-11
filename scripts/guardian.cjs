const fs = require('fs');
const path = require('path');

const SACRED_SPECS = {
  css: path.join(__dirname, '../src/index.css'),
  app: path.join(__dirname, '../src/App.tsx')
};

function check() {
  let errors = [];

  // 1. CSSの配置チェック
  if (fs.existsSync(SACRED_SPECS.css)) {
    const css = fs.readFileSync(SACRED_SPECS.css, 'utf8');
    if (!css.includes('bottom: 170px;')) errors.push('CSS: FAVORITES_BTN_BOTTOM (170px) changed!');
    if (!css.includes('bottom: 100px;')) errors.push('CSS: HISTORY_BTN_BOTTOM (100px) changed!');
    if (!css.includes('bottom: 30px;')) errors.push('CSS: BOTTOM_ACTIONS_BOTTOM (30px) changed!');
  }

  // 2. JSのマーカー半径チェック
  if (fs.existsSync(SACRED_SPECS.app)) {
    const app = fs.readFileSync(SACRED_SPECS.app, 'utf8');
    if (!app.includes('const r = 22 / scale;')) errors.push('JS: MARKER_RADIUS (22) changed!');
    if (!app.includes('const r = 24 / scale;')) errors.push('JS: STAR_RADIUS (24) changed!');
  }

  if (errors.length > 0) {
    console.log('\x1b[31m%s\x1b[0m', '--- UI BASELINE VIOLATION ---');
    errors.forEach(err => console.log(`[!] ${err}`));
    process.exit(1);
  } else {
    console.log('\x1b[32m%s\x1b[0m', '✓ UI Baseline is perfect.');
    process.exit(0);
  }
}

check();
