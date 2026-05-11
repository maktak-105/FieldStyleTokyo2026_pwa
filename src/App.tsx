import { useState, useRef, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import boothsData from './booths.json';
import './index.css';
import { BoothTooltip } from './BoothTooltip';

function App() {
  const [inputA, setInputA] = useState('');
  const [inputB, setInputB] = useState('');
  const [resultsA, setResultsA] = useState<any[]>([]);
  const [resultsB, setResultsB] = useState<any[]>([]);
  const [currentLocation, setCurrentLocation] = useState<any>(null);
  const [destination, setDestination] = useState<any>(null);
  const [activeMap, setActiveMap] = useState<'map1' | 'map2'>('map1');
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [selectedBooths, setSelectedBooths] = useState<any[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });
  const [dist, setDist] = useState<number | null>(null);

  const imgRef = useRef<HTMLImageElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [showAppInfo, setShowAppInfo] = useState(false);
  const [showLargeQR, setShowLargeQR] = useState(false);
  const [showLargeAuthor, setShowLargeAuthor] = useState(false);
  const [favorites, setFavorites] = useState<any[]>(() => {
    const saved = localStorage.getItem('fs2026_favorites');
    return saved ? JSON.parse(saved) : [];
  });
  const [showAllFavoritesOnMap, setShowAllFavoritesOnMap] = useState(false);
  const [showFavoritesList, setShowFavoritesList] = useState(false);

  useEffect(() => {
    localStorage.setItem('fs2026_favorites', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (b: any) => {
    if (!b) return;
    const bId = getBoothNo(b);
    if (favorites.some(f => getBoothNo(f) === bId)) {
      setFavorites(favorites.filter(f => getBoothNo(f) !== bId));
    } else {
      setFavorites([b, ...favorites]);
    }
  };

  const isFavorite = (b: any) => {
    if (!b) return false;
    return favorites.some(f => getBoothNo(f) === getBoothNo(b));
  };

  const mapCanvasRef = useRef<HTMLDivElement>(null);
  const booths = boothsData as any[];

  const MAP_SIZES = {
    map1: { w: 1559, h: 1225 },
    map2: { w: 1695, h: 2214 }
  };

  // ブース番号のキー（西展示棟1Fなど）を動的に取得
  const getBoothNo = (b: any) => {
    if (!b) return '';
    const exclude = ['mapId', 'x', 'y', '__EMPTY', 'x_pixel', 'y_pixel'];
    const key = Object.keys(b).find(k => !exclude.includes(k));
    return key ? String(b[key]) : '';
  };

  // 【聖典：1:1 物理ピクセル描画】
  const getProjectedCoord = (val: number) => val;

  const resetLayout = () => {
    if (imgRef.current && headerRef.current) {
      const panelHeight = headerRef.current.offsetHeight + 12;
      const s = window.innerWidth / (imgRef.current.naturalWidth || 1000);
      setScale(s);
      setOffset({ x: 0, y: panelHeight });
    }
  };

  // 1. マップ切り替え時やリサイズ時のレイアウト初期化
  useEffect(() => {
    resetLayout();
    const handleResize = () => resetLayout();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [activeMap]);

  // 2. 拡大率や位置が変更された時のブース判定
  useEffect(() => {
    const updateSelected = () => {
      // テストのため閾値を極端に下げる (100%基準以下)
      if (!mapCanvasRef.current || scale < 0.1) {
        setSelectedBooths([]);
        return;
      }
      const rect = mapCanvasRef.current.getBoundingClientRect();
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      
      const mapX = (cx - offset.x) / scale;
      const mapY = (cy - offset.y) / scale;
      
      const founds = booths.filter(b => {
        // 現在表示中のマップと同じIDのブースのみを抽出
        if (b.mapId !== activeMap) return false;
        const dx = b.x - mapX;
        const dy = b.y - mapY;
        return Math.hypot(dx, dy) <= 20; // 20pxの範囲内
      });
      setSelectedBooths(founds);
    };

    updateSelected();
  }, [scale, offset, booths]);

  useEffect(() => {
    const preventZoom = (e: TouchEvent) => {
      if (e.touches.length > 1 && e.cancelable) e.preventDefault();
    };
    document.addEventListener('touchstart', preventZoom, { passive: false });
    document.addEventListener('touchmove', preventZoom, { passive: false });
    return () => {
      document.removeEventListener('touchstart', preventZoom);
      document.removeEventListener('touchmove', preventZoom);
    };
  }, []);

  const jump = (b: any) => {
    if (!b) return;
    setActiveMap(b.mapId);
    const z = 2.5;
    const px = getProjectedCoord(b.x);
    const py = getProjectedCoord(b.y);
    setScale(z);
    setOffset({ x: -px * z + window.innerWidth / 2, y: -py * z + window.innerHeight / 2 });
  };

  const handleSearch = (text: string, setResults: any) => {
    if (!text) { setResults([]); return; }
    // あいまい検索ロジック: ひらがな/カタカナ、全角/半角、大文字/小文字の差異を無視
    const normalize = (s: string) => s.toLowerCase()
      .replace(/[ぁ-ん]/g, m => String.fromCharCode(m.charCodeAt(0) + 0x60)) // ひらがな -> カタカナ
      .replace(/[！-～]/g, m => String.fromCharCode(m.charCodeAt(0) - 0xfee0)); // 全角 -> 半角
    
    const t = normalize(text);
    const filtered = booths.filter(b => {
      const no = normalize(getBoothNo(b));
      const name = normalize(b['__EMPTY'] || '');
      return no.includes(t) || name.includes(t);
    }).slice(0, 100);
    setResults(filtered);
  };

  const handleStart = (e: any) => {
    const t = e.touches ? e.touches[0] : e;
    setIsDragging(true);
    setLastPos({ x: t.clientX, y: t.clientY });
    if (e.touches && e.touches.length === 2) {
      setDist(Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY));
    }
  };

  const handleMove = (e: any) => {
    if (!isDragging) return;
    const touchCount = e.touches ? e.touches.length : 1;
    if (touchCount === 2 && dist) {
      const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      const newScale = Math.min(Math.max(scale * (d / dist), 0.1), 10);
      const cx = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      const cy = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      const newOffsetX = cx - (cx - offset.x) * (newScale / scale);
      const newOffsetY = cy - (cy - offset.y) * (newScale / scale);
      setScale(newScale);
      setOffset({ x: newOffsetX, y: newOffsetY });
      setDist(d);
    } else if (touchCount === 1) {
      const t = e.touches ? e.touches[0] : e;
      setOffset(o => ({ x: o.x + (t.clientX - lastPos.x), y: o.y + (t.clientY - lastPos.y) }));
      setLastPos({ x: t.clientX, y: t.clientY });
    }
  };

  const handleWheel = (e: any) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.min(Math.max(scale * delta, 0.1), 10);
    const cx = e.clientX;
    const cy = e.clientY;
    const newOffsetX = cx - (cx - offset.x) * (newScale / scale);
    const newOffsetY = cy - (cy - offset.y) * (newScale / scale);
    setScale(newScale);
    setOffset({ x: newOffsetX, y: newOffsetY });
  };

  const Marker = ({ b, type }: { b: any, type: 'A' | 'B' }) => {
    const px = getProjectedCoord(b.x);
    const py = getProjectedCoord(b.y);
    const color = type === 'A' ? "#ef4444" : "#3b82f6";
    const strokeColor = type === 'A' ? "#991b1b" : "#1e40af";
    const r = 22 / scale;
    const isElevator = b['__EMPTY']?.includes('エレベータ');
    const isEscalator = b['__EMPTY']?.includes('エスカレータ');
    const isSmoking = b['__EMPTY']?.includes('喫煙所');

    const renderShape = () => {
      if (isElevator || isEscalator) {
        return <rect x={px - r} y={py - r} width={r * 2} height={r * 2} fill={color} stroke="white" strokeWidth={5 / scale} />;
      } else if (isSmoking) {
        const points = `${px},${py - r * 1.2} ${px - r * 1.2},${py + r * 0.8} ${px + r * 1.2},${py + r * 0.8}`;
        return <polygon points={points} fill={color} stroke="white" strokeWidth={5 / scale} />;
      } else {
        return <circle cx={px} cy={py} r={r} fill={color} stroke="white" strokeWidth={5 / scale} />;
      }
    };

    return (
      <g>
        {renderShape()}
        <text x={px} y={py} textAnchor="middle" dominantBaseline="central" style={{ 
          fontSize: `${22 / scale}px`, 
          fontWeight: '900', 
          fill: 'white', 
          stroke: strokeColor, 
          strokeWidth: `${2 / scale}px`, 
          paintOrder: 'stroke' 
        }}>
          {getBoothNo(b)}
        </text>
      </g>
    );
  };

  const StarMarker = ({ b }: { b: any }) => {
    const px = getProjectedCoord(b.x);
    const py = getProjectedCoord(b.y);
    const r = 24 / scale;
    // 星のパス (中心 px, py)
    const starPath = `M ${px} ${py - r} L ${px + r * 0.22} ${py - r * 0.3} L ${px + r * 0.95} ${py - r * 0.3} L ${px + r * 0.36} ${py + r * 0.12} L ${px + r * 0.59} ${py + r * 0.81} L ${px} ${py + r * 0.38} L ${px - r * 0.59} ${py + r * 0.81} L ${px - r * 0.36} ${py + r * 0.12} L ${px - r * 0.95} ${py - r * 0.3} L ${px - r * 0.22} ${py - r * 0.3} Z`;
    return (
      <path d={starPath} fill="#f59e0b" stroke="white" strokeWidth={3 / scale} />
    );
  };

  const currentSize = MAP_SIZES[activeMap];

  return (
    <div className="app-container">
      <div className="map-canvas" ref={mapCanvasRef}
        onWheel={handleWheel}
        onMouseDown={handleStart} onMouseMove={handleMove} onMouseUp={() => setIsDragging(false)}
        onTouchStart={handleStart} onTouchMove={handleMove} onTouchEnd={() => setIsDragging(false)}
        style={{ touchAction: 'none' }}>
        <div style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`, transformOrigin: '0 0', position: 'relative', width: 'max-content' }}>
          <img ref={imgRef} src={activeMap === 'map1' ? '/map1.jpg' : '/map2.jpg'} alt="map" draggable="false" onLoad={resetLayout} style={{ display: 'block', maxWidth: 'none' }} />
          <svg viewBox={`0 0 ${currentSize.w} ${currentSize.h}`} style={{ position: 'absolute', top: 0, left: 0, width: `${currentSize.w}px`, height: `${currentSize.h}px`, pointerEvents: 'none' }}>
            {(() => {
              if (!currentLocation || !destination) return null;
              
              // 同じフロアの場合
              if (currentLocation.mapId === destination.mapId) {
                if (currentLocation.mapId !== activeMap) return null;
                return (
                  <line 
                    x1={getProjectedCoord(currentLocation.x)} y1={getProjectedCoord(currentLocation.y)} 
                    x2={getProjectedCoord(destination.x)} y2={getProjectedCoord(destination.y)} 
                    stroke="#1d4ed8" strokeWidth={10 / scale} strokeDasharray={`${20 / scale} ${20 / scale}`}
                    opacity="0.8"
                  />
                );
              }

              // 階層をまたぐ場合
              const escalator = booths.find(b => b.mapId === activeMap && (b['西展示棟1F'] === 'E11' || b['西展示棟1F'] === 'E41'));
              if (!escalator) return null;

              if (currentLocation.mapId === activeMap) {
                // Aからエスカレーターへ
                return (
                  <line 
                    x1={getProjectedCoord(currentLocation.x)} y1={getProjectedCoord(currentLocation.y)} 
                    x2={getProjectedCoord(escalator.x)} y2={getProjectedCoord(escalator.y)} 
                    stroke="#1d4ed8" strokeWidth={10 / scale} strokeDasharray={`${20 / scale} ${20 / scale}`}
                    opacity="0.8"
                  />
                );
              } else if (destination.mapId === activeMap) {
                // エスカレーターからBへ
                return (
                  <line 
                    x1={getProjectedCoord(escalator.x)} y1={getProjectedCoord(escalator.y)} 
                    x2={getProjectedCoord(destination.x)} y2={getProjectedCoord(destination.y)} 
                    stroke="#1d4ed8" strokeWidth={10 / scale} strokeDasharray={`${20 / scale} ${20 / scale}`}
                    opacity="0.8"
                  />
                );
              }
              return null;
            })()}
            {showAllFavoritesOnMap && favorites.filter(f => f.mapId === activeMap).map((f, i) => (
              <StarMarker key={`fav-${i}`} b={f} />
            ))}
            {currentLocation?.mapId === activeMap && <Marker b={currentLocation} type="A" />}
            {destination?.mapId === activeMap && <Marker b={destination} type="B" />}
          </svg>
        </div>
        
        {/* 吹き出しの操作時に地図が動かないようにガード */}
        <div onMouseDown={e => e.stopPropagation()} onTouchStart={e => e.stopPropagation()} onWheel={e => e.stopPropagation()}>
          <BoothTooltip booths={selectedBooths} />
        </div>
        {(() => {
          if (scale >= 0.1) {
            return (
              <div className="center-crosshair">
                <div className="crosshair-circle"></div>
                <div className="crosshair-h"></div>
                <div className="crosshair-v"></div>
              </div>
            );
          }
          return null;
        })()}
      </div>

      <div className="ui-layer">
        <div className="header-card" ref={headerRef}>
          <div className="map-tabs">
            <button className={`map-tab ${activeMap === 'map1' ? 'active' : ''}`} onClick={() => setActiveMap('map1')}>西1・2 【1F】</button>
            <button className={`map-tab ${activeMap === 'map2' ? 'active' : ''}`} onClick={() => setActiveMap('map2')}>西3・4・南3 【4F】</button>
          </div>
          <div className="location-picker">
            <div className="location-row">
              <button className="icon-btn red-bg" onClick={() => jump(currentLocation)} disabled={!currentLocation}></button>
              <button className={`fav-toggle-btn ${isFavorite(currentLocation) ? 'active' : 'inactive'}`} onClick={() => toggleFavorite(currentLocation)} disabled={!currentLocation}>
                {isFavorite(currentLocation) ? '★' : '☆'}
              </button>
              <div className="search-container">
                <input className="search-input" type="text" placeholder="現在地 (番号/店名)" value={inputA} onChange={(e) => { setInputA(e.target.value); handleSearch(e.target.value, setResultsA); }} />
                {inputA && (
                  <button className="clear-btn" onClick={() => { setInputA(''); setResultsA([]); setCurrentLocation(null); }}>×</button>
                )}
                {resultsA.length > 0 && (
                  <div className="results-list">
                    {resultsA.map((b, i) => (
                      <div key={i} className="result-item" onClick={() => { 
                        setCurrentLocation(b); 
                        setInputA(`[${getBoothNo(b)}] ${b['__EMPTY']}`); 
                        setResultsA([]); 
                        jump(b); 
                      }}>
                        [{getBoothNo(b)}] {b['__EMPTY']}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="location-row">
              <button className="icon-btn blue-bg" onClick={() => jump(destination)} disabled={!destination}></button>
              <button className={`fav-toggle-btn ${isFavorite(destination) ? 'active' : 'inactive'}`} onClick={() => toggleFavorite(destination)} disabled={!destination}>
                {isFavorite(destination) ? '★' : '☆'}
              </button>
              <div className="search-container">
                <input className="search-input" type="text" placeholder="目的地 (番号/店名)" value={inputB} onChange={(e) => { setInputB(e.target.value); handleSearch(e.target.value, setResultsB); }} />
                {inputB && (
                  <button className="clear-btn" onClick={() => { setInputB(''); setResultsB([]); setDestination(null); }}>×</button>
                )}
                {resultsB.length > 0 && (
                  <div className="results-list">
                    {resultsB.map((b, i) => (
                      <div key={i} className="result-item" onClick={() => { 
                        setDestination(b); 
                        setInputB(`[${getBoothNo(b)}] ${b['__EMPTY']}`); 
                        setResultsB([]); 
                        jump(b); 
                      }}>
                        [{getBoothNo(b)}] {b['__EMPTY']}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <button className="help-btn" onClick={() => setShowHelp(true)}>？</button>
      <button className="fav-footer-btn" onClick={() => setShowFavoritesList(true)}>★</button>
      <button className="reset-btn" onClick={resetLayout} style={{ overflow: 'hidden' }}>
        <img src="/map_home.png" alt="home" style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(1.15)' }} />
      </button>

      {showHelp && (
        <div className="modal-overlay" onClick={() => { setShowHelp(false); setShowAppInfo(false); }}>
          <div className="help-modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px', borderBottom: '2px solid #f1f5f9', paddingBottom: '12px', gap: '12px' }}>
              <img 
                src="/author.png" 
                alt="author" 
                className="author-img-mini" 
                onClick={() => setShowLargeAuthor(true)} 
                style={{ cursor: 'pointer' }}
                title="プロフィール画像を拡大"
              />
              <h2 style={{ margin: 0, border: 'none', padding: 0, flex: 1 }}>使い方ガイド</h2>
              <button 
                className="qr-mini-btn" 
                onClick={() => setShowLargeQR(true)}
                title="共有用QRコードを表示"
              >
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
                  onClick={() => setShowAppInfo(!showAppInfo)} 
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
            <button className="help-close" onClick={() => { setShowHelp(false); setShowAppInfo(false); }}>閉じる</button>
          </div>
        </div>
      )}

      {showFavoritesList && (
        <div className="modal-overlay" onClick={() => setShowFavoritesList(false)}>
          <div className="help-modal" onClick={e => e.stopPropagation()}>
            <h2>お気に入りリスト</h2>
            <div className="help-content" style={{ maxHeight: '400px', overflowY: 'auto' }}>
              <div className={`fav-list-item all-show`} onClick={() => { setShowAllFavoritesOnMap(!showAllFavoritesOnMap); setShowFavoritesList(false); }}>
                <span className="fav-star-icon">★</span> {showAllFavoritesOnMap ? '一括表示を解除' : 'すべて表示'}
              </div>
              {favorites.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>お気に入りはまだありません</div>
              ) : (
                favorites.map((b, i) => (
                  <div key={i} className="fav-list-item" onClick={() => {
                    setDestination(b);
                    setInputB(`[${getBoothNo(b)}] ${b['__EMPTY']}`);
                    setShowFavoritesList(false);
                    jump(b);
                  }}>
                    <span className="fav-star-icon">★</span> [{getBoothNo(b)}] {b['__EMPTY']}
                    <button className="fav-remove-btn" onClick={(e) => { e.stopPropagation(); toggleFavorite(b); }} title="削除" />
                  </div>
                ))
              )}
            </div>
            <button className="help-close" onClick={() => setShowFavoritesList(false)}>閉じる</button>
          </div>
        </div>
      )}

      {showLargeQR && (
        <div className="qr-modal-overlay" onClick={() => setShowLargeQR(false)}>
          <div className="qr-container" onClick={e => e.stopPropagation()}>
            <h3>共有用QRコード</h3>
            <div className="qr-wrapper">
              <QRCodeSVG value="https://fieldstyle-nav.vercel.app" size={200} level="H" includeMargin={true} />
            </div>
            <p>https://fieldstyle-nav.vercel.app</p>
            <button className="help-close" onClick={() => setShowLargeQR(false)}>閉じる</button>
          </div>
        </div>
      )}

      {showLargeAuthor && (
        <div className="modal-overlay" onClick={() => setShowLargeAuthor(false)} style={{ zIndex: 50000 }}>
          <div className="author-large-container" onClick={e => e.stopPropagation()}>
            <img src="/author.png" alt="author" className="author-img-large" />
            <button className="help-close" onClick={() => setShowLargeAuthor(false)}>閉じる</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
