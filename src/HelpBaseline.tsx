import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { MessageSquare } from 'lucide-react';

export const HelpModal: React.FC<{
  onClose: () => void,
  onShowAppInfo: (v: boolean) => void,
  showAppInfo: boolean,
  onShowQR: (v: boolean) => void,
  onShowAuthor: (v: boolean) => void,
  onShowNavGuide: () => void,
  onShowFeedback: () => void
}> = ({ onClose, onShowAppInfo, showAppInfo, onShowQR, onShowAuthor, onShowNavGuide, onShowFeedback }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="help-modal" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '2px solid #f1f5f9', paddingBottom: '12px', position: 'relative', minHeight: '44px' }}>
          <img
            src="/author.png"
            alt="author"
            className="author-img-mini"
            onClick={() => onShowAuthor(true)}
            style={{ cursor: 'pointer', zIndex: 1 }}
            title="プロフィール画像を拡大"
          />
          <h2 style={{ 
            margin: 0, border: 'none', padding: 0, 
            position: 'absolute', left: '50%', transform: 'translateX(-50%)',
            fontSize: '20px', color: '#1e293b', whiteSpace: 'nowrap'
          }}>
            使い方ガイド
          </h2>
          <button className="qr-mini-btn" onClick={() => onShowQR(true)} title="共有用QRコードを表示" style={{ zIndex: 1 }}>
            <QRCodeSVG value="https://fieldstyle-nav.vercel.app" size={24} />
          </button>
        </div>
        <div className="help-content">
          <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>※ホーム画面に追加すると一発起動できます</span><br /><br />
          <b>1. マップ切替</b>: 上部のタブでフロア切替<br />
          <b>2. 検索</b>: ブース番号や名称で検索<br />
          <b>3. ジャンプボタン</b>: <span style={{ display: 'inline-block', width: '16px', height: '16px', borderRadius: '50%', background: '#ef4444', border: '1.5px solid white', boxShadow: '0 1px 2px rgba(0,0,0,0.2)', verticalAlign: 'middle', marginRight: '1px' }}></span><span style={{ display: 'inline-block', width: '16px', height: '16px', borderRadius: '50%', background: '#3b82f6', border: '1.5px solid white', boxShadow: '0 1px 2px rgba(0,0,0,0.2)', verticalAlign: 'middle', marginRight: '4px' }}></span>対象に移動<br />
          <b>4. お気に入り</b>: ☆★ボタンで登録し、<span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px', borderRadius: '50%', background: '#f59e0b', border: '1.5px solid white', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', color: 'white', fontSize: '12px', fontWeight: 'bold', marginRight: '2px' }}>★</span>ボタンで一括表示<br />
          <b>5. ナビゲーション</b>: 青点線でルートを案内<br />
          　<span onClick={onShowNavGuide} style={{ color: '#3b82f6', textDecoration: 'underline', cursor: 'pointer', fontSize: '13px' }}>使い方</span><br />
          <b>6. 記号</b>:<br />
          　●：ブース<br />
          　■：エスカレータ/エレベータ<br />
          　▲：喫煙所<br />
          <b>7. 地図操作</b>: ピンチでズーム、ドラッグで移動<br />
          <b>8. <svg viewBox="0 0 24 24" width="20" height="20" fill="none" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '2px' }}><path d="M4 0V24M20 0V24M0 4H24M0 20H24" stroke="#94a3b8" strokeWidth="1.5" /><circle cx="12" cy="12" r="3.5" fill="#3b82f6" /></svg> ボタン</b>: 全体マップ表示<br /><br />
          ※Webアプリです、ブラウザキャッシュを約3MB使います、個人情報は一切収集してません

          <div style={{ marginTop: '16px', borderTop: '1px dashed #e2e8f0', paddingTop: '12px' }}>
            <button
              onClick={() => onShowAppInfo(!showAppInfo)}
              style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '11px', textDecoration: 'underline', cursor: 'pointer', padding: '0', display: 'block', margin: '0 auto' }}
            >
              {showAppInfo ? '説明を閉じる' : '開発技術・アプリ説明を表示'}
            </button>
            {showAppInfo && (
              <div className="app-info-section">
                <h3>アプリ概要</h3>
                <h4>言語・フレームワーク</h4>
                <ul>
                  <li><b>TypeScript</b>: 型安全なメイン言語</li>
                  <li><b>React (v19)</b>: UI 構築ライブラリ</li>
                  <li><b>Vite (v7)</b>: 高速ビルドツール</li>
                  <li><b>Python</b>: 座標検証・画像処理補助</li>
                </ul>
                <h4>ライブラリ</h4>
                <ul>
                  <li><b>dnd-kit</b>: 案内履歴の直感的な並べ替え機能</li>
                  <li><b>qrcode.react</b>: 共有用QRコード生成</li>
                  <li><b>PWA</b>: オフライン・インストール機能</li>
                  <li><b>Fuse.js</b>: 高速あいまい検索エンジン</li>
                  <li><b>Lucide React</b>: アイコン</li>
                  <li><b>Pillow (PIL)</b>: 画像処理用補助</li>
                </ul>
                <h4>インフラ・運用</h4>
                <ul>
                  <li><b>Vercel</b>: ホスティング・高速化・利用解析</li>
                  <li><b>GitHub</b>: ソースコード管理</li>
                </ul>
                <h4>AI アシスタント</h4>
                <ul>
                  <li><b>Antigravity</b>: メイン開発・コード作成</li>
                  <li><b>Claude Code</b>: マップ・座標解析</li>
                  <li><b>Copilot 365</b>: ブースリスト・データ作成</li>
                </ul>
              </div>
            )}
          </div>
          <button className="feedback-help-btn" onClick={onShowFeedback}>
            <MessageSquare size={16} />
            フィードバックを送る
          </button>
        </div>

        <button className="help-close" onClick={onClose}>閉じる</button>
      </div>
    </div>
  );
};

export const QRModal: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <div className="qr-modal-overlay" onClick={onClose}>
    <div className="qr-container" onClick={e => e.stopPropagation()}>
      <h3>共有用QRコード</h3>
      <div className="qr-wrapper">
        <QRCodeSVG value="https://fieldstyle-nav.vercel.app" size={200} level="H" includeMargin={true} />
      </div>
      <p>https://fieldstyle-nav.vercel.app</p>
      <button className="help-close" onClick={onClose}>閉じる</button>
    </div>
  </div>
);

export const AuthorModal: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <div className="modal-overlay" onClick={onClose} style={{ zIndex: 50000 }}>
    <div className="author-large-container" onClick={e => e.stopPropagation()}>
      <img src="/author.png" alt="author" className="author-img-large" />
      <button className="help-close" onClick={onClose}>閉じる</button>
    </div>
  </div>
);

export const NavigationGuideModal: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <div className="modal-overlay" onClick={onClose} style={{ zIndex: 50001 }}>
    <div className="help-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '90%', width: '400px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', borderBottom: '2px solid #f1f5f9', paddingBottom: '12px' }}>
        <h2 style={{ margin: 0, fontSize: '20px', color: '#1e293b' }}>ナビゲーションの使い方</h2>
      </div>
      <div className="help-content" style={{ maxHeight: '70vh', overflowY: 'auto', fontSize: '14px', lineHeight: '1.6' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div><b>1.</b> 履歴ボタンを押して上部中央の”すべて表示”をタップ</div>
          <div><b>2.</b> メイン画面に戻って上の枠でスタート地点を検索する</div>
          <div>もしくはマップを拡大してクロスヘアでブースを選択する</div>
          <div>下の枠に入力されるので右の▲で上の枠に移動</div>
          <div><b>3.</b> 下の枠で最初の目的地を検索もしくはマップから選択→ルートが表示される</div>
          <div><b>4.</b> 下の枠で検索もしくは同様にマップから選択</div>
          <div><b>5.</b> 下枠右の▲押すと上の枠に移動して、下枠が空白になる</div>
          <div><b>6.</b> 4.-5.を繰り返すとどんどん矢印とポイントが繋がっていく</div>
          <div><b>7.</b> 履歴ボタンで登録した順に下に追加されたリストを見る</div>
          <div><b>8.</b> 行ったところや飛ばしたいブースはチェックボックスで外す</div>
          <div><b>9.</b> 個別に削除もできる</div>
          <div><b>10.</b> 左のマークをドラッグすることで順番を変える</div>
          <div><b>11.</b> 右上の削除で全部消せる（確認出る）</div>
        </div>
      </div>
      <button className="help-close" onClick={onClose} style={{ marginTop: '16px' }}>閉じる</button>
    </div>
  </div>
);
