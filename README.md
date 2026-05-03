# 🧭 FieldStyle Japan 2026 Navigator (PWA版)

> [!CAUTION]
> **AI（Antigravity）への重要指示**
> ユーザーからの明示的な指示がない限り、AIは `git` コマンドや `vercel` コマンドを勝手に実行してはいけません。必ず修正内容を提示し、許可を得てから操作すること。

FieldStyle Japan 2026 会場（東京ビッグサイト）向けの、スマートフォン最適化ブース検索・ナビゲーションアプリです。
**公開URL: [https://fieldstyle-nav.vercel.app](https://fieldstyle-nav.vercel.app)**

## 🚀 アプリの特長
- **インストール不要**: URLを開くだけで即座に起動します。
- **ユーザー登録/ログイン不要**: その場ですぐに使えます。
- **軽量・軽快**: ブラウザキャッシュ（約3MB）を活用し、オフラインでも軽快に動作。
- **公式準拠**: マップとブースリストは公式HPのデータを基盤に構築しています。

---

## 🚩 主要な機能

### 1. インタラクティブ・マップ
- **1F (西1・2)** および **4F (西3・4・南3)** のマップ切り替え。
- ピンチ操作による拡大縮小、ドラッグによる移動。
- **地図アイコンボタン**: クリック一つでマップ全体表示にリセットします。

### 2. 高度な検索・ナビゲーション
- **A (現在地)** と **B (目的地)** を設定することで、最短ルートを**青い点線**で表示。
- **フロアまたぎ対応**: AとBが異なるフロアにある場合、表示中のフロア内のエスカレーターを中継地点として自動案内します。
- **部分一致検索**: 1文字からの部分一致・前方一致検索に対応。

### 3. 会場設備の可視化
特定の設備は、地図上で独自の記号と識別番号で表示されます。
- **O01**: アトリウム・オブジェ（●）
- **E11 / E41**: エスカレーター（■ 正方形）
- **E12 / E42**: エレベーター（■ 正方形）
- **T41**: 喫煙所（▲ 三角形）

### 4. ヘルプガイド
- 画面右下の「？」ボタンから、操作方法の簡易ガイドを確認可能。
- 作者アイコンをガイド内に配置。

---

## 💻 使用技術・ツール

### 言語・フレームワーク
- **TypeScript**: 型安全な開発のためのメイン言語。
- **React (v19)**: UI 構築のためのフロントエンドライブラリ。
- **Vite (v7)**: 高速なビルドツールおよび開発サーバー。
- **Python**: 座標データの検証や画像処理などの開発補助スクリプトに使用。

### ライブラリ
- **PWA (vite-plugin-pwa)**: オフライン動作とインストール機能を実現。
- **Fuse.js**: ブース名の高速なあいまい検索エンジン。
- **react-quick-pinch-zoom**: 地図のピンチ・ズーム操作を制御。
- **Lucide React**: UI用アイコンライブラリ。
- **Pillow (PIL)**: Python用画像処理ライブラリ（座標プロット等で使用）。

### インフラ・運用
- **Vercel**: ホスティング、アナリティクス、パフォーマンス計測。
- **GitHub**: ソースコード管理。

---

## 🛠 開発・運用オペレーション
すべてのコマンドは、プロジェクトのルートフォルダ **`fieldstyle-nav-pwa`** で実行してください。

### 1. 開発環境の起動 (Local Dev)
```bash
npm run dev
```
ブラウザで `http://localhost:5173` を開き、リアルタイムで修正を確認できます。

### 2. 更新の保存とプッシュ (Git Workflow)
修正を GitHub に保存します。これにより Vercel へ自動デプロイされます。
```bash
git add .
git commit -m "修正内容を記入"
git push
```

### 3. 本番デプロイ (Vercel)
手動で即座に本番反映させたい場合、またはプロジェクトを再リンクする場合に使用します。
```bash
npx vercel --prod
```

---

## 📂 ワークスペース構成
- `src/App.tsx`: **メインプログラム**。UI・ナビ・検索ロジックの本体。
- `src/booths.json`: **会場データ**。ブース名や座標情報を集中管理。
- `src/index.css`: **デザイン設定**。全体の配色やレイアウトを定義。
- `public/`: 画像・アイコンなどの静的アセット。
- `vite.config.ts`: PWAの設定（manifest/Service Worker）やビルド設定。

---

## 🛠 開発者向け詳細情報

### データ構造 (`src/booths.json`)
ブースおよび設備の座標データはすべてこのファイルで管理されています。
```json
{
  "西展示棟1F": "E11",
  "__EMPTY": "エスカレータ（1Fアトリウム）",
  "mapId": "map1",
  "x": 919.0,
  "y": 910.0
}
```

### 座標の微調整スクリプト
設備やブースの座標を確認するための専用スクリプトが `scratch/` ディレクトリにあります。
- `python scratch/mark_equipment_v4.py`: 現在のJSONデータに基づき、座標点のみをプロットした確認用画像を生成します。

---

## 📊 運用管理・解析
- **本番URL**: [https://fieldstyle-nav.vercel.app](https://fieldstyle-nav.vercel.app)
- **管理画面**: [Vercel Dashboard](https://vercel.com/regzamaktak-4987s-projects/fieldstyle-nav)
- **統計分析**: Vercel Analytics / Speed Insights により、アクセス数や読み込み速度をリアルタイムで監視しています。

**Vercel Project ID:**
- `Project ID`: prj_suDscrqZsfraOVbg6NYlao7w9T0A
- `Org ID`: team_H3u2EWwgkNJRqtYOdjnyj6Q3

---

## 📂 アセット一覧
- 地図画像: `public/map1.jpg`, `public/map2.jpg`
- 地図ボタンアイコン: `public/map_home.png`
- 作者画像: `public/author.png`

---
Developed by **Antigravity** & **maktak105**.
Last Updated: 2026-05-03 13:41
