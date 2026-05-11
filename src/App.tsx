import React, { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import boothsData from './booths.json';
import { BoothTooltip } from './BoothTooltip';
import { HelpModal, QRModal, AuthorModal } from './HelpBaseline';

const booths = boothsData;

const App: React.FC = () => {
  const [inputA, setInputA] = useState('');
  const [inputB, setInputB] = useState('');
  const [resultsA, setResultsA] = useState<any[]>([]);
  const [resultsB, setResultsB] = useState<any[]>([]);
  const [currentLocation, setCurrentLocation] = useState<any>(null);
  const [destination, setDestination] = useState<any>(null);
  const [history, setHistory] = useState<any[]>(() => {
    const saved = localStorage.getItem('nav_history');
    return saved ? JSON.parse(saved) : [];
  });
  const [showHistory, setShowHistory] = useState(false);
  const [activeMap, setActiveMap] = useState<'map1' | 'map2'>('map1');
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [imgSize, setImgSize] = useState({ w: 0, h: 0 });
  const [currentSize, setCurrentSize] = useState({ w: 0, h: 0 });
  const [showHelp, setShowHelp] = useState(false);
  const [showAppInfo, setShowAppInfo] = useState(false);
  const [showLargeQR, setShowLargeQR] = useState(false);
  const [showLargeAuthor, setShowLargeAuthor] = useState(false);
  const [selectedBooths, setSelectedBooths] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>(() => {
    const saved = localStorage.getItem('fs2026_favorites');
    return saved ? JSON.parse(saved) : [];
  });
  const [showFavoritesList, setShowFavoritesList] = useState(false);
  const [showAllFavoritesOnMap, setShowAllFavoritesOnMap] = useState(false);

  const mapCanvasRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('fs2026_favorites', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (booth: any) => {
    if (!booth) return;
    setFavorites(prev => {
      const exists = prev.find(f => f['__EMPTY'] === booth['__EMPTY'] && f.mapId === booth.mapId);
      if (exists) {
        return prev.filter(f => !(f['__EMPTY'] === booth['__EMPTY'] && f.mapId === booth.mapId));
      } else {
        return [booth, ...prev];
      }
    });
  };

  const isFavorite = (booth: any) => {
    if (!booth) return false;
    return favorites.some(f => f['__EMPTY'] === booth['__EMPTY'] && f.mapId === booth.mapId);
  };

  const resetLayout = () => {
    if (!imgRef.current || !mapCanvasRef.current) return;
    const { clientWidth: cw, clientHeight: ch } = mapCanvasRef.current;
    const { naturalWidth: nw, naturalHeight: nh } = imgRef.current;
    const headerHeight = headerRef.current?.clientHeight || 0;
    const availableHeight = ch - headerHeight;
    const s = Math.min(cw / nw, availableHeight / nh);
    setScale(s);
    setOffset({ x: (cw - nw * s) / 2, y: headerHeight + (availableHeight - nh * s) / 2 });
    setImgSize({ w: nw, h: nh });
    setCurrentSize({ w: nw, h: nh });
  };

  const jump = (booth: any) => {
    if (!booth || !mapCanvasRef.current) return;
    setActiveMap(booth.mapId);
    setOffset({ 
      x: mapCanvasRef.current.clientWidth / 2 - booth.x * scale, 
      y: mapCanvasRef.current.clientHeight / 2 - booth.y * scale 
    });
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomSpeed = 0.001;
    const newScale = Math.max(0.1, Math.min(5, scale * (1 - e.deltaY * zoomSpeed)));
    const { left, top } = mapCanvasRef.current!.getBoundingClientRect();
    const mouseX = e.clientX - left;
    const mouseY = e.clientY - top;
    const imgX = (mouseX - offset.x) / scale;
    const imgY = (mouseY - offset.y) / scale;
    setOffset({ x: mouseX - imgX * newScale, y: mouseY - imgY * newScale });
    setScale(newScale);
  };

  const handleStart = (e: any) => {
    setIsDragging(true);
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    setStartPos({ x: clientX - offset.x, y: clientY - offset.y });
  };

  const handleMove = (e: any) => {
    if (!isDragging) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    setOffset({ x: clientX - startPos.x, y: clientY - startPos.y });
  };

  const handleSearch = (q: string, setResults: any) => {
    if (!q) { setResults([]); return; }
    const filtered = booths.filter(b => 
      String(b['__EMPTY']).includes(q) || 
      Object.keys(b).some(k => !['mapId','x','y','__EMPTY','x_pixel','y_pixel'].includes(k) && String(b[k]).includes(q))
    ).slice(0, 50);
    setResults(filtered);
  };

  const getBoothNo = (b: any) => {
    if (!b) return '';
    const exclude = ['mapId', 'x', 'y', '__EMPTY', 'x_pixel', 'y_pixel'];
    const key = Object.keys(b).find(k => !exclude.includes(k));
    return key ? String(b[key]) : '';
  };

  const updateSelected = () => {
    if (!mapCanvasRef.current) return;
    const { clientWidth: cw, clientHeight: ch } = mapCanvasRef.current;
    const imgCenterX = (cw / 2 - offset.x) / scale;
    const imgCenterY = (ch / 2 - offset.y) / scale;
    const initialFitScale = imgRef.current ? Math.min(cw / imgRef.current.naturalWidth, (ch - (headerRef.current?.clientHeight || 0)) / imgRef.current.naturalHeight) : 0.1;
    const relativeScale = scale / initialFitScale;
    if (relativeScale >= 3.0) {
      const radius = 20; 
      const found = booths.filter(b => {
        if (b.mapId !== activeMap) return false;
        const dx = b.x - imgCenterX;
        const dy = b.y - imgCenterY;
        return Math.sqrt(dx * dx + dy * dy) < radius;
      });
      setSelectedBooths(found);
    } else {
      setSelectedBooths([]);
    }
  };

  useEffect(() => {
    updateSelected();
  }, [scale, offset, activeMap]);

  useEffect(() => {
    window.addEventListener('resize', resetLayout);
    return () => window.removeEventListener('resize', resetLayout);
  }, []);

  useEffect(() => {
    if (currentLocation && destination) {
      const newItem = { from: currentLocation, to: destination, timestamp: Date.now() };
      setHistory(prev => {
        const lastItem = prev[prev.length - 1];
        const isDuplicate = lastItem && lastItem.from['__EMPTY'] === newItem.from['__EMPTY'] && lastItem.to['__EMPTY'] === newItem.to['__EMPTY'];
        if (isDuplicate) return prev;
        const newHistory = [...prev, newItem].slice(-20);
        localStorage.setItem('nav_history', JSON.stringify(newHistory));
        return newHistory;
      });
    }
  }, [currentLocation, destination]);

  const Marker = ({ b, type }: { b: any, type: 'A' | 'B' }) => {
    const color = type === 'A' ? "#ef4444" : "#3b82f6";
    const strokeColor = type === 'A' ? "#991b1b" : "#1e40af";
    const r = 22 / scale;
    const isElevator = b['__EMPTY']?.includes('エレベータ');
    const isEscalator = b['__EMPTY']?.includes('エスカレータ');
    const isSmoking = b['__EMPTY']?.includes('喫煙所');

    const renderShape = () => {
      if (isElevator || isEscalator) {
        return <rect x={b.x - r} y={b.y - r} width={r * 2} height={r * 2} fill={color} stroke="white" strokeWidth={5 / scale} />;
      } else if (isSmoking) {
        const points = `${b.x},${b.y - r * 1.2} ${b.x - r * 1.2},${b.y + r * 0.8} ${b.x + r * 1.2},${b.y + r * 0.8}`;
        return <polygon points={points} fill={color} stroke="white" strokeWidth={5 / scale} />;
      } else {
        return <circle cx={b.x} cy={b.y} r={r} fill={color} stroke="white" strokeWidth={5 / scale} />;
      }
    };

    return (
      <g>
        {renderShape()}
        <text x={b.x} y={b.y} textAnchor="middle" dominantBaseline="central" style={{ 
          fontSize: `${22 / scale}px`, fontWeight: '900', fill: 'white', stroke: strokeColor, strokeWidth: `${2 / scale}px`, paintOrder: 'stroke', pointerEvents: 'none'
        }}>
          {getBoothNo(b)}
        </text>
      </g>
    );
  };

  const StarMarker = ({ b }: { b: any }) => {
    const r = 24 / scale;
    const px = b.x;
    const py = b.y;
    const starPath = `M ${px} ${py - r} L ${px + r * 0.22} ${py - r * 0.3} L ${px + r * 0.95} ${py - r * 0.3} L ${px + r * 0.36} ${py + r * 0.12} L ${px + r * 0.59} ${py + r * 0.81} L ${px} ${py + r * 0.38} L ${px - r * 0.59} ${py + r * 0.81} L ${px - r * 0.36} ${py + r * 0.12} L ${px - r * 0.95} ${py - r * 0.3} L ${px - r * 0.22} ${py - r * 0.3} Z`;
    return (
      <path d={starPath} fill="#f59e0b" stroke="white" strokeWidth={3 / scale} />
    );
  };

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
            <defs>
              <marker id="arrowhead" markerWidth="5" markerHeight="3.5" refX="4" refY="1.75" orient="auto">
                <polygon points="0 0, 5 1.75, 0 3.5" fill="#1d4ed8" />
              </marker>
            </defs>
            {(() => {
              if (!currentLocation || !destination) return null;
              if (currentLocation.mapId === destination.mapId) {
                if (currentLocation.mapId !== activeMap) return null;
                return <line x1={currentLocation.x} y1={currentLocation.y} x2={destination.x} y2={destination.y} stroke="#1d4ed8" strokeWidth={10 / scale} strokeDasharray={`${20 / scale} ${20 / scale}`} markerEnd="url(#arrowhead)" />;
              }
              const escalator = booths.find(b => b.mapId === activeMap && (b['西展示棟1F'] === 'E11' || b['西展示棟1F'] === 'E41'));
              if (!escalator) return null;
              if (currentLocation.mapId === activeMap) {
                return <line x1={currentLocation.x} y1={currentLocation.y} x2={escalator.x} y2={escalator.y} stroke="#1d4ed8" strokeWidth={10 / scale} strokeDasharray={`${20 / scale} ${20 / scale}`} markerEnd="url(#arrowhead)" />;
              } else if (destination.mapId === activeMap) {
                return <line x1={escalator.x} y1={escalator.y} x2={destination.x} y2={destination.y} stroke="#1d4ed8" strokeWidth={10 / scale} strokeDasharray={`${20 / scale} ${20 / scale}`} markerEnd="url(#arrowhead)" />;
              }
              return null;
            })()}
            {showAllFavoritesOnMap && favorites.filter(f => f.mapId === activeMap).map((f, i) => (
              <StarMarker key={i} b={f} />
            ))}
            {currentLocation && currentLocation.mapId === activeMap && <Marker b={currentLocation} type="A" />}
            {destination && destination.mapId === activeMap && <Marker b={destination} type="B" />}
          </svg>
        </div>
        <div onMouseDown={e => e.stopPropagation()} onTouchStart={e => e.stopPropagation()} onWheel={e => e.stopPropagation()}>
          <BoothTooltip booths={selectedBooths} onSelect={(b) => { setDestination(b); setInputB(`[${getBoothNo(b)}] ${b['__EMPTY']}`); setSelectedBooths([]); }} />
        </div>
        {scale >= 0.05 && (
          <div className="center-crosshair">
            <div className="crosshair-circle"></div>
            <div className="crosshair-h"></div>
            <div className="crosshair-v"></div>
          </div>
        )}
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
              <button className={`fav-toggle-btn ${isFavorite(currentLocation) ? 'active' : 'inactive'}`} onClick={() => toggleFavorite(currentLocation)} disabled={!currentLocation}>{isFavorite(currentLocation) ? '★' : '☆'}</button>
              <div className="search-container">
                <input className="search-input" type="text" placeholder="現在地 (番号/店名)" value={inputA} onChange={(e) => { setInputA(e.target.value); handleSearch(e.target.value, setResultsA); }} />
                {inputA && <div className="search-actions"><button className="clear-btn" onClick={() => { setInputA(''); setResultsA([]); setCurrentLocation(null); }}>×</button></div>}
                {resultsA.length > 0 && <div className="results-list">{resultsA.map((b, i) => (<div key={i} className="result-item" onClick={() => { setCurrentLocation(b); setInputA(`[${getBoothNo(b)}] ${b['__EMPTY']}`); setResultsA([]); jump(b); }}>[{getBoothNo(b)}] {b['__EMPTY']}</div>))}</div>}
              </div>
            </div>
            <div className="location-row">
              <button className="icon-btn blue-bg" onClick={() => jump(destination)} disabled={!destination}></button>
              <button className={`fav-toggle-btn ${isFavorite(destination) ? 'active' : 'inactive'}`} onClick={() => toggleFavorite(destination)} disabled={!destination}>{isFavorite(destination) ? '★' : '☆'}</button>
              <div className="search-container">
                <input className="search-input" type="text" placeholder="目的地 (番号/店名)" value={inputB} onChange={(e) => { setInputB(e.target.value); handleSearch(e.target.value, setResultsB); }} />
                {inputB && (
                  <div className="search-actions">
                    <button className="promote-btn" onClick={() => { if (destination) { setCurrentLocation(destination); setInputA(inputB); setDestination(null); setInputB(''); } }} title="現在地に設定">▲</button>
                    <button className="clear-btn" onClick={() => { setInputB(''); setResultsB([]); setDestination(null); }}>×</button>
                  </div>
                )}
                {resultsB.length > 0 && <div className="results-list">{resultsB.map((b, i) => (<div key={i} className="result-item" onClick={() => { setDestination(b); setInputB(`[${getBoothNo(b)}] ${b['__EMPTY']}`); setResultsB([]); jump(b); }}>[{getBoothNo(b)}] {getBoothNo(b)} {b['__EMPTY']}</div>))}</div>}
              </div>
            </div>
          </div>
        </div>
        <button className="fav-footer-btn" onClick={() => setShowFavoritesList(true)}>★</button>
        <button className="history-btn" onClick={() => setShowHistory(true)}>
          <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>
        </button>
        <div className="bottom-right-actions">
          <button className="help-btn" onClick={() => setShowHelp(true)}>？</button>
          <button className="reset-btn" onClick={resetLayout} style={{ overflow: 'hidden' }}>
            <img src="/map_home.png" alt="home" style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(1.15)' }} />
          </button>
        </div>
      </div>

      {showHelp && (
        <HelpModal 
          onClose={() => { setShowHelp(false); setShowAppInfo(false); }} 
          onShowAppInfo={setShowAppInfo} 
          showAppInfo={showAppInfo} 
          onShowQR={setShowLargeQR} 
          onShowAuthor={setShowLargeAuthor} 
        />
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

      {showHistory && (
        <div className="modal-overlay" onClick={() => setShowHistory(false)}>
          <div className="help-modal history-modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px', borderBottom: '2px solid #f1f5f9', paddingBottom: '12px' }}>
              <h2 style={{ margin: 0, border: 'none', padding: 0, flex: 1 }}>案内履歴</h2>
              <button className="clear-history-btn" onClick={() => { if (window.confirm('削除しますか？')) { setHistory([]); localStorage.removeItem('nav_history'); } }}>削除</button>
            </div>
            <div className="help-content" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              {history.slice().reverse().map((item, index) => {
                const originalIndex = history.length - 1 - index;
                return (
                  <div key={index} className="history-item" onClick={() => {
                    setCurrentLocation(item.from);
                    setInputA(`[${getBoothNo(item.from)}] ${item.from['__EMPTY']}`);
                    setDestination(item.to);
                    setInputB(`[${getBoothNo(item.to)}] ${item.to['__EMPTY']}`);
                    setActiveMap(item.from.mapId);
                    setShowHistory(false);
                    jump(item.from);
                  }}>
                    <div className="history-route">
                      <div className="history-point"><span className="dot red"></span>{item.from['__EMPTY']}</div>
                      <div className="history-point"><span className="dot blue"></span>{item.to['__EMPTY']}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div className="history-time">{new Date(item.timestamp).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}</div>
                      <button 
                        className="fav-remove-btn" 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          const newHistory = history.filter((_, i) => i !== originalIndex);
                          setHistory(newHistory);
                          localStorage.setItem('nav_history', JSON.stringify(newHistory));
                        }}
                      ></button>
                    </div>
                  </div>
                );
              })}
            </div>
            <button className="help-close" onClick={() => setShowHistory(false)}>閉じる</button>
          </div>
        </div>
      )}

      {showLargeQR && <QRModal onClose={() => setShowLargeQR(false)} />}
      {showLargeAuthor && <AuthorModal onClose={() => setShowLargeAuthor(false)} />}
    </div>
  );
};

export default App;
