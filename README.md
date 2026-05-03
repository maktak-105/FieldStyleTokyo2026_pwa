# 🧭 FieldStyle Japan 2026 Navigator (PWA版)

FieldStyle Japan 2026 の会場内を案内する、モバイル特化型の PWA (Progressive Web App) ナビゲーターです。

## 🚀 アプリの特長
- **インストール不要**: URLを開くだけで即座に起動します。
- **ユーザー登録不要**: ログインの手間なく、その場ですぐに使えます。
- **軽量・爆速**: ブラウザキャッシュ（約3MB）を活用し、オフラインでも軽快に動作。
- **公式準拠**: マップとブースリストは公式HPのデータを基盤に構築しています。

---

## 🚩 主要な機能

### 1. インタラクティブ・マップ
- ピンチ操作による拡大縮小、ドラッグによる自由な移動が可能。
- **地図アイコンボタン**: クリック一つでマップ全体表示にリセットします。

### 2. 高度な検索・ナビゲーション
- **A (現在地)** と **B (目的地)** を設定し、最短ルートを**青い点線**で表示。
- **フロアまたぎ対応**: AとBが異なるフロアにある場合、エスカレーターを中継地点として自動案内します。
- **部分一致検索**: 1文字からブース番号や名称を検索可能。

### 3. 会場設備の可視化
特定の設備は、独自の記号と識別番号で分かりやすく表示されます。
- **一般ブース・オブジェ**: ●
- **エスカレーター・エレベーター**: ■
- **喫煙所**: ▲

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
手動で即座に本番反映させたい場合：
```bash
npx vercel --prod
```

---

## 📂 ワークスペース構成
- `src/App.tsx`: **メインプログラム**。UI・ナビ・検索ロジックを管理。
- `src/booths.json`: **会場データ**。全ブースの名称と座標を格納。
- `src/index.css`: **デザイン設定**。全体のカラーやレイアウトを定義。
- `public/`: マップ画像や各種アイコンアセット。
- `vite.config.ts`: PWAの設定やビルド設定。

---

## 📊 運用管理・解析
- **本番URL**: [https://fieldstyle-nav-pwa.vercel.app](https://fieldstyle-nav-pwa.vercel.app)
- **管理画面**: [Vercel Dashboard](https://vercel.com/regzamaktak-4987s-projects/fieldstyle-nav-pwa)
- **解析ツール**: Vercel Analytics / Speed Insights 稼働中。

**Vercel Project Info:**
- `Project ID`: prj_suDscrqZsfraOVbg6NYlao7w9T0A
- `Org ID`: team_H3u2EWwgkNJRqtYOdjnyj6Q3

---
Developed by **Antigravity** & **User**.
Last Updated: 2026-05-03 13:40
