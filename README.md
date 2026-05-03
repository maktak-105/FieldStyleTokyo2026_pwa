# 🧭 FieldStyle Japan 2026 Navigator (PWA版)

FieldStyle Japan 2026 の会場内を案内する、モバイル特化型の PWA (Progressive Web App) ナビゲーターです。

## 🚀 アプリの特長
- **インストール不要**: URLを開くだけで即座に起動します。
- **ログイン不要**: ユーザー登録の手間なく、その場ですぐに使えます。
- **超軽量・爆速**: ブラウザキャッシュ（約3MB）を活用し、ストレスのない動作を実現。
- **オフライン対応**: PWA機能により、電波の届かない会場奥深くでも動作を継続します。
- **公式準拠**: マップとブースリストは FieldStyle 公式HPのデータを基盤に構築しています。

---

## 🛠 開発・運用オペレーション
このセクションの手順をコピー＆ペーストするだけで、主要な操作が完結します。

### 1. 開発環境の起動 (Local Dev)
手元のPCで動作を確認しながら開発する場合に使用します。
```bash
npm run dev
```
起動後、ブラウザで `http://localhost:5173` を開きます。

### 2. 更新の保存とプッシュ (Git Workflow)
修正したコードを GitHub に保存します。
```bash
git add .
git commit -m "修正内容をここに記入"
git push
```

### 3. 本番環境へのデプロイ (Vercel)
GitHub と Vercel は連携済みのため、**`git push` を行うだけで自動的に本番環境が更新されます。**
手動で即座に反映させたい場合は以下を実行します：
```bash
npx vercel --prod
```

---

## 📂 ワークスペース構成
- `src/App.tsx`: **メインプログラム**。UIやナビゲーションのロジックが詰まっています。
- `src/booths.json`: **会場データ**。ブース名や座標情報はすべてここで管理します。
- `src/index.css`: **デザイン設定**。全体の配色やレイアウトを定義しています。
- `public/`: 画像アセット。
    - `map1.jpg`, `map2.jpg`: 会場マップ。
    - `map_home.png`: ホームボタン用アイコン。
    - `author.png`: ヘルプ内の作者画像。
- `vite.config.ts`: PWAの設定やビルド設定。

---

## 📊 運用管理・解析
- **本番URL**: [https://fieldstyle-nav-pwa.vercel.app](https://fieldstyle-nav-pwa.vercel.app)
- **管理画面**: [Vercel Dashboard](https://vercel.com/regzamaktak-4987s-projects/fieldstyle-nav-pwa)
- **統計分析**: Vercel Analytics & Speed Insights により、アクセス数や読み込み速度をリアルタイムで監視しています。

**Vercel Project Info:**
- `Project Name`: fieldstyle-nav-pwa
- `Project ID`: prj_suDscrqZsfraOVbg6NYlao7w9T0A
- `Org ID`: team_H3u2EWwgkNJRqtYOdjnyj6Q3

---

## 💾 データ構造 (`booths.json`)
ブース位置の微調整が必要な場合は、以下の形式で `x`, `y` 座標を編集してください。
```json
{
  "西展示棟1F": "E11",
  "booth": "エスカレータ（1Fアトリウム）",
  "mapId": "map1",
  "x": 919.0,
  "y": 910.0
}
```

---
Developed by **Antigravity** & **User**.
Last Updated: 2026-05-03 13:35
