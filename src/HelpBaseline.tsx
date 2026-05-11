import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

/**
 * FieldStyle 2026 Help Baseline
 * 使い方ガイドや各種モーダルの「文言・構造」を隔離。
 * ここにある情報は「完成品」であり、AIは省略してはいけません。
 */

export const HelpModal: React.FC<{ 
  onClose: () => void, 
  onShowAppInfo: (v: boolean) => void, 
  showAppInfo: boolean, 
  onShowQR: (v: boolean) => void, 
  onShowAuthor: (v: boolean) => void 
}> = ({ onClose, onShowAppInfo, showAppInfo, onShowQR, onShowAuthor }) => (
  <div className="modal-overlay" onClick={onClose}>
    <div className="help-modal" onClick={e => e.stopPropagation()}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px', borderBottom: '2px solid #f1f5f9', paddingBottom: '12px', gap: '12px' }}>
        <img src="/author.png" alt="author" className="author-img-mini" onClick={() => onShowAuthor(true)} style={{ cursor: 'pointer' }} title="プロフィール画像を拡大" />
        <h2 style={{ margin: 0, border: 'none', padding: 0, flex: 1 }}>使い方ガイド</h2>
        <button className="qr-mini-btn" onClick={() => onShowQR(true)} title="共有用QRコードを表示">
          <QRCodeSVG value="https://fieldstyle-nav.vercel.app" size={24} />
        </button>
      </div>
      <div className="help-content">
        <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>※ホーム画面に追加すると一発起動できます</span><br/>
        <br/>
        <b>1. マップ切替</b>: 上部のタブ<br/>
        <b>2. 検索</b>: ブース番号、名称（1文字でも）<br/>
        <b>3. <span style={{display:'inline-flex', alignItems:'center', justifyContent:'center', width:'20px', height:'20px', borderRadius:'50%', background:'#ef4444', border:'1.5px solid white', boxShadow:'0 1px 3px rgba(0,0,0,0.2)', marginRight:'2px'}}></span><span style={{display:'inline-flex', alignItems:'center', justifyContent:'center', width:'20px', height:'20px', borderRadius:'50%', background:'#3b82f6', border:'1.5px solid white', boxShadow:'0 1px 3px rgba(0,0,0,0.2)'}}></span>ボタン</b>: 検索したブースにジャンプ<br/>
        <b>4. ☆★ボタン</b>: お気に入りの追加・削除<br/>
        <b>5. ナビ</b>: 青点線（直線です）<br/>
        &nbsp;&nbsp;&nbsp;&nbsp;※フロア移動時はエスカレータ経由<br/>
        <b>6. マップ上の記号</b>:<br/>
        &nbsp;&nbsp;&nbsp;&nbsp;● 一般ブース<br/>
        &nbsp;&nbsp;&nbsp;&nbsp;■ エスカレータ、エレベータ<br/>
        &nbsp;&nbsp;&nbsp;&nbsp;▲ 喫煙所<br/>
        <b>7. 地図の操作</b>: だいたい他のアプリと同じ<br/>
        <b>8. 地図ボタン</b>: マップ全体表示<br/>
        <b>9. <span style={{display:'inline-flex', alignItems:'center', justifyContent:'center', width:'20px', height:'20px', borderRadius:'50%', background:'#f59e0b', border:'1.5px solid white', boxShadow:'0 1px 3px rgba(0,0,0,0.2)', color:'white', fontSize:'12px', fontWeight:'bold', marginRight:'2px'}}>★</span>ボタン</b>: お気に入り選択・全表示<br/>
        <br/>
        <div style={{ color: '#1e293b', fontWeight: 'bold', fontSize: '12px', marginTop: '4px' }}>
          ※Webアプリです、ブラウザキャッシュを約3MB使います、個人情報は一切収集してません
        </div>

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
                <li><b>Fuse.js</b>: 高速あいまい検索</li>
                <li><b>react-quick-pinch-zoom</b>: 地図操作</li>
                <li><b>Lucide React</b>: アイコン</li>
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
