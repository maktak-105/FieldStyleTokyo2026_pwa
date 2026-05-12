import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

export const HelpModal: React.FC<{ 
  onClose: () => void, 
  onShowAppInfo: (v: boolean) => void, 
  showAppInfo: boolean, 
  onShowQR: (v: boolean) => void, 
  onShowAuthor: (v: boolean) => void 
}> = ({ onClose, onShowAppInfo, showAppInfo, onShowQR, onShowAuthor }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="help-modal" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px', borderBottom: '2px solid #f1f5f9', paddingBottom: '12px', gap: '12px' }}>
          <img 
            src="/author.png" 
            alt="author" 
            className="author-img-mini" 
            onClick={() => onShowAuthor(true)} 
            style={{ cursor: 'pointer' }}
            title="プロフィール画像を拡大"
          />
          <h2 style={{ margin: 0, border: 'none', padding: 0, flex: 1 }}>使い方ガイド</h2>
          <button className="qr-mini-btn" onClick={() => onShowQR(true)} title="共有用QRコードを表示">
            <QRCodeSVG value="https://fieldstyle-nav.vercel.app" size={24} />
          </button>
        </div>
        <div className="help-content">
          <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>※ホーム画面に追加すると一発起動できます</span><br/><br/>
          <b>1. マップ切替</b>: 上部のタブでフロアを切り替え。<br/>
          <b>2. 検索</b>: ブース番号や名称で素早く検索。<br/>
          <b>3. ジャンプボタン</b>: 検索窓横のボタンで対象に移動。<br/>
          <b>4. お気に入り</b>: ☆★ボタンで登録し、★ボタンで一括表示。<br/>
          <b>5. ナビゲーション</b>: 青点線でルートを案内（エスカレータ経由）。<br/>
          <b>6. 地図上の記号</b>: ● 一般 / ■ 昇降機 / ▲ 喫煙所<br/>
          <b>7. 地図の操作</b>: ピンチ操作でズーム、ドラッグで移動。<br/>
          <b>8. 地図リセット</b>: 右下の地図ボタンで全体を表示。<br/>
          <b>9. <span style={{display:'inline-flex', alignItems:'center', justifyContent:'center', width:'20px', height:'20px', borderRadius:'50%', background:'#f59e0b', border:'1.5px solid white', boxShadow:'0 1px 3px rgba(0,0,0,0.2)', color:'white', fontSize:'12px', fontWeight:'bold', marginRight:'2px'}}>★</span>ボタン</b>: お気に入り表示<br/><br/>
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
                  <li><b>PWA</b>: オフライン・インストール機能</li>
                  <li><b>Fuse.js</b>: 高速あいまい検索エンジン</li>
                  <li><b>react-quick-pinch-zoom</b>: 地図操作</li>
                  <li><b>Lucide React</b>: アイコン</li>
                  <li><b>Pillow (PIL)</b>: 画像処理用補助</li>
                </ul>
                <h4>インフラ・運用</h4>
                <ul>
                  <li><b>Vercel</b>: ホスティング・解析</li>
                  <li><b>GitHub</b>: ソースコード管理</li>
                </ul>
              </div>
            )}
          </div>
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
