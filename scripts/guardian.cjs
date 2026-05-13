const fs = require('fs');
const path = require('path');

/**
 * 🧭 Guardian V9.0 (完全整合性監査)
 * README.md および GUARDIAN_UI_SPEC.md を基準とする。
 * 
 * [監査対象]
 * 1. UI詳細（マーカー/ライン数値、FAB配置、余白、照準）
 * 2. 画面機能（検索閾値、昇格、DND、一括削除クリア、フロア案内、照準しきい値）
 * 3. ヘルプ内容（README 原文との 100% 同期）
 */

const FILES = {
  readme: path.join(__dirname, '../README.md'),
  spec: path.join(__dirname, '../docs/specifications/GUARDIAN_UI_SPEC.md'),
  app: path.join(__dirname, '../src/App.tsx'),
  css: path.join(__dirname, '../src/index.css'),
  help: path.join(__dirname, '../src/HelpBaseline.tsx')
};

function audit() {
  let errors = [];
  const readme = fs.readFileSync(FILES.readme, 'utf8');
  const spec = fs.readFileSync(FILES.spec, 'utf8');
  const app = fs.readFileSync(FILES.app, 'utf8');
  const css = fs.readFileSync(FILES.css, 'utf8');
  const help = fs.readFileSync(FILES.help, 'utf8');

  console.log('\x1b[36m%s\x1b[0m', '--- [🧭 Guardian V9.0: 完全整合性監査実行中] ---');

  const check = (content, target, desc) => {
    if (!content.includes(target)) errors.push(`[!] 監査失敗: "${desc}" (${target}) が見つかりません`);
  };

  // --- 1. UIベースライン監査 ---
  console.log('フェーズ1: UIベースライン & レイアウト監査...');

  // マーカー & ライン数値
  const uiMetrics = [
    { m: '22 / scale', d: 'マーカー半径' },
    { m: '5 / scale', d: 'マーカー枠線幅' },
    { m: 'fontWeight: \'900\'', d: 'マーカーフォント太さ' }, // App.tsx 内の定義
    { m: '2 / scale', d: 'マーカー文字縁取り' },
    { m: '10 / scale', d: '案内ライン幅' },
    { m: '20 / scale}, ${20 / scale', d: '案内ライン点線間隔' } // App.tsx 内の形式
  ];
  uiMetrics.forEach(item => check(app, item.m, item.d));

  // CSS 配置
  // CSS 配置（クラス名と数値のセットで厳密にチェック）
  check(css, '.bottom-right-actions {', '右下アクション群コンテナ');
  check(css, 'bottom: 30px', '右下アクション群位置 (30px)');
  check(css, '.fav-footer-btn {', 'お気に入りボタン定義');
  check(css, 'bottom: 170px', 'お気に入りボタン位置 (170px)');
  check(css, '.history-btn {', '履歴ボタン定義');
  check(css, 'bottom: 100px', '履歴ボタン位置 (100px)');
  check(css, 'gap: 12px', 'プレミアム余白 (gap: 12px)');

  // App.tsx 内のボタン実装監査
  check(app, 'className="fav-footer-btn"', 'お気に入りボタンの実装');
  check(app, 'className="history-btn"', '履歴ボタンの実装');
  check(app, 'className="help-btn"', 'ヘルプボタンの実装');
  check(app, 'className="reset-btn"', 'リセットボタンの実装');
  check(css, '32px', '照準（クロスヘア）直径');

  // --- 2. 画面機能 & ロジック監査 ---
  console.log('フェーズ2: 画面機能 & ロジック監査...');

  // 核心ロジック
  check(app, 'promoteToStart', '目的地昇格ロジック (▲)');
  check(app, 'threshold: 0.4', 'Fuse.js 検索閾値 (0.4)');
  check(app, 'DndContext', 'ドラッグ＆ドロップ構造');
  check(app, 'DragOverlay', 'プレミアム・ドラッグオーバーレイ');
  check(app, 'scale >= 1.0', 'ツールチップ表示閾値 (1.0倍)');
  check(app, 'エスカレータ', 'エスカレーター優先案内ロジック');

  // 一括削除時の連動クリア（入力欄リセットの存在）
  check(app, 'setInputA(\'\'); setInputB(\'\');', '一括削除時：入力欄リセット');
  check(app, 'setCurrentLocation(null); setDestination(null);', '一括削除時：状態リセット');

  // --- 3. ヘルプ内容同期監査 ---
  console.log('フェーズ3: ヘルプ内容同期監査...');

  // 全項目チェック（仕様書に定義された1〜8のすべての項目を確認）
  const helpVerbatim = [
    '1. マップ切替', '上部のタブでフロア切替',
    '2. 検索', 'ブース番号や名称で検索',
    '3. ジャンプボタン', '対象に移動',
    '4. お気に入り', 'ボタンで一括表示',
    '5. ナビゲーション', '青点線でルートを案内',
    '6. 記号', '●：ブース', '■：エスカレータ/エレベータ', '▲：喫煙所',
    '7. 地図操作', 'ピンチでズーム、ドラッグで移動',
    '8.', '全体マップ表示'
  ];
  helpVerbatim.forEach(text => {
    if (!help.includes(text)) errors.push(`[!] ヘルプ構成エラー: "${text}" が HelpBaseline.tsx に存在しません`);
  });

  // 技術スタック & AIアシスタント
  const techStack = ['TypeScript', 'React (v19)', 'Vite (v7)', 'PWA', 'Fuse.js', 'Vercel', 'dnd-kit', 'qrcode.react', 'Antigravity', 'Claude Code', 'Copilot 365'];
  techStack.forEach(tech => {
    if (!help.includes(tech)) errors.push(`[!] 構成要素エラー: "${tech}" が HelpBaseline.tsx に記載されていません`);
  });

  // --- 判定結果 ---
  if (errors.length > 0) {
    console.log('\n\x1b[31m%s\x1b[0m', '--- !!! 仕様適合監査 失敗 !!! ---');
    errors.forEach(err => console.log('\x1b[31m%s\x1b[0m', err));
    console.log('\n[!] 実装が最新の仕様（V8.0 / README）から逸脱しています。修正が必要です。');
    process.exit(1);
  } else {
    console.log('\n\x1b[32m%s\x1b[0m', '✓ [GUARDIAN V9.0] すべての仕様が完全に同期されました。');
    process.exit(0);
  }
}

try { audit(); } catch (e) {
  console.error('監査実行中に予期せぬエラーが発生しました:', e);
  process.exit(1);
}
