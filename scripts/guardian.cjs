const fs = require('fs');
const path = require('path');

const SACRED_SPECS = {
  css: path.join(__dirname, '../src/index.css'),
  app: path.join(__dirname, '../src/App.tsx'),
  help: path.join(__dirname, '../src/HelpBaseline.tsx')
};

function check() {
  let errors = [];

  // 1. CSSの配置とカラーチェック
  if (fs.existsSync(SACRED_SPECS.css)) {
    const css = fs.readFileSync(SACRED_SPECS.css, 'utf8');
    const cssChecks = [
      { name: 'FAV_BTN_POS', target: 'bottom: 170px;' },
      { name: 'HIST_BTN_POS', target: 'bottom: 100px;' },
      { name: 'ACTIONS_POS', target: 'bottom: 30px;' },
      { name: 'FAV_COLOR', target: 'background: #f59e0b;' },
      { name: 'PRIMARY_BLUE', target: 'background: #3b82f6;' }
    ];
    cssChecks.forEach(c => {
      if (!css.includes(c.target)) errors.push(`CSS: ${c.name} violation!`);
    });
  }

  // 2. App.tsx のロジック・要素チェック
  if (fs.existsSync(SACRED_SPECS.app)) {
    const app = fs.readFileSync(SACRED_SPECS.app, 'utf8');
    const appChecks = [
      { name: 'MARKER_R', target: 'const r = 22 / scale;' },
      { name: 'STAR_R', target: 'const r = 24 / scale;' },
      { name: 'PROMOTE_BTN', target: 'className="promote-btn"' }, // ▲ボタン
      { name: 'HIST_REMOVE', target: 'className="fav-remove-btn"' }, // 履歴個別削除
      { name: 'DESC_ORDER', target: 'history.slice().reverse().map' } // 履歴降順表示（※現在は昇順に直したはずなので要確認）
    ];
    appChecks.forEach(c => {
      if (!app.includes(c.target)) errors.push(`JS: ${c.name} violation!`);
    });
  }

  // 3. HelpBaseline.tsx の情報の完全性チェック
  if (fs.existsSync(SACRED_SPECS.help)) {
    const help = fs.readFileSync(SACRED_SPECS.help, 'utf8');
    const helpItems = [
      '1. マップ切替', '2. 検索', '3.', '4. ☆★ボタン', '5. ナビ', 
      '6. マップ上の記号', '7. 地図の操作', '8. 地図ボタン', '9.'
    ];
    helpItems.forEach(item => {
      if (!help.includes(item)) errors.push(`HELP: Item "${item}" missing!`);
    });

    const techStack = ['TypeScript', 'React (v19)', 'Vite (v7)', 'PWA', 'Fuse.js'];
    techStack.forEach(tech => {
      if (!help.includes(tech)) errors.push(`TECH: "${tech}" missing from App Info!`);
    });
  }

  if (errors.length > 0) {
    console.log('\x1b[31m%s\x1b[0m', '--- UI/SPEC BASELINE VIOLATION DETECTED ---');
    errors.forEach(err => console.log(`[!] ${err}`));
    process.exit(1);
  } else {
    console.log('\x1b[32m%s\x1b[0m', '✓ All Specifications are perfect.');
    process.exit(0);
  }
}

check();
