import React, { useState, useEffect, useRef, useMemo } from 'react';
import boothsData from './booths.json';
import { BoothTooltip } from './BoothTooltip';
import { HelpModal, QRModal, AuthorModal } from './HelpBaseline';
import Fuse from 'fuse.js';

// Dnd Kit
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const booths = Array.isArray(boothsData) 
  ? boothsData 
  : (boothsData as any)?.default && Array.isArray((boothsData as any).default)
    ? (boothsData as any).default
    : [];

const SortableHistoryItem = ({ id, item, onToggle, onDelete, getBoothNo, isOverlay }: any) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  
  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging && !isOverlay ? 0.3 : 1,
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px',
    borderBottom: '1px solid #f8fafc',
    backgroundColor: isOverlay ? '#ffffff' : 'transparent',
    boxShadow: isOverlay ? '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' : 'none',
    borderRadius: isOverlay ? '8px' : '0',
    zIndex: isOverlay ? 1000 : 1,
    cursor: isOverlay ? 'grabbing' : 'default'
  };

  if (!item || !item.booth) return null;
  
  return (
    <div ref={setNodeRef} style={style} className="history-item">
      <div className="history-drag-handle" {...attributes} {...listeners} style={{ cursor: isOverlay ? 'grabbing' : 'grab', color: '#94a3b8', fontSize: '18px', userSelect: 'none', padding: '0 4px' }}>☰</div>
      <input type="checkbox" checked={!!item.visible} onChange={() => onToggle(item.id)} style={{ cursor: 'pointer', width: '18px', height: '18px' }} />
      <div className="history-item-info" style={{ flex: 1, fontSize: '14px', color: '#1e293b', lineHeight: '1.4', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        <span style={{ fontWeight: 'bold', color: '#3b82f6', marginRight: '6px' }}>[{getBoothNo(item.booth)}]</span>
        {item.booth['__EMPTY'] || '名称不明'}
      </div>
      {!isOverlay && (
        <button className="delete-history-item" onClick={() => onDelete(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none"><circle cx="12" cy="12" r="10" fill="#ef4444" /><path d="M7 12H17" stroke="white" strokeWidth="2.5" strokeLinecap="round" /></svg>
        </button>
      )}
    </div>
  );
};

const App: React.FC = () => {
  const [inputA, setInputA] = useState('');
  const [inputB, setInputB] = useState('');
  const [resultsA, setResultsA] = useState<any[]>([]);
  const [resultsB, setResultsB] = useState<any[]>([]);
  const [currentLocation, setCurrentLocation] = useState<any>(null);
  const [destination, setDestination] = useState<any>(null);
  
  const [navHistory, setNavHistory] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('fieldstyle_nav_history_v10');
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed.filter(i => i && i.id && i.booth) : [];
    } catch (e) { return []; }
  });
  
  const [showHistory, setShowHistory] = useState(false);
  const [showAllHistoryOnMap, setShowAllHistoryOnMap] = useState(false);
  const [activeMap, setActiveMap] = useState<'map1' | 'map2'>('map1');
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });
  const [dist, setDist] = useState<number | null>(null);
  const [currentSize, setCurrentSize] = useState({ w: 1000, h: 1000 });
  
  const [showHelp, setShowHelp] = useState(false);
  const [showTechInfo, setShowTechInfo] = useState(false);
  const [showLargeQR, setShowLargeQR] = useState(false);
  const [showAuthorModal, setShowAuthorModal] = useState(false);
  const [selectedBooths, setSelectedBooths] = useState<any[]>([]);
  
  const [favorites, setFavorites] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('fs2026_favorites');
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) { return []; }
  });
  const [showFavoritesList, setShowFavoritesList] = useState(false);
  const [showAllFavoritesOnMap, setShowAllFavoritesOnMap] = useState(false);

  const [activeId, setActiveId] = useState<string | null>(null);

  const mapCanvasRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  const fuse = useMemo(() => new Fuse(booths, {
    keys: Object.keys(booths[0] || {}).filter(k => !['mapId', 'x', 'y', 'x_pixel', 'y_pixel', '__EMPTY'].includes(k)).concat(['__EMPTY']),
    threshold: 0.4, 
    distance: 100,
    minMatchCharLength: 1
  }), [booths]);

  useEffect(() => { localStorage.setItem('fs2026_favorites', JSON.stringify(favorites)); }, [favorites]);
  useEffect(() => { localStorage.setItem('fieldstyle_nav_history_v10', JSON.stringify(navHistory)); }, [navHistory]);

  const toggleFavorite = (booth: any) => {
    if (!booth) return;
    setFavorites(prev => {
      const exists = prev.find(f => f['__EMPTY'] === booth['__EMPTY'] && f.mapId === booth.mapId);
      return exists ? prev.filter(f => !(f['__EMPTY'] === booth['__EMPTY'] && f.mapId === booth.mapId)) : [booth, ...prev];
    });
  };

  const isFavorite = (booth: any) => booth ? favorites.some(f => f['__EMPTY'] === booth['__EMPTY'] && f.mapId === booth.mapId) : false;

  const resetLayout = () => {
    if (!imgRef.current || !mapCanvasRef.current) return;
    const nw = imgRef.current.naturalWidth || 1000;
    const nh = imgRef.current.naturalHeight || 1000;
    const cw = mapCanvasRef.current.clientWidth;
    const ch = mapCanvasRef.current.clientHeight;
    const s = cw / nw;
    setScale(s);
    setOffset({ x: 0, y: (ch - nh * s) / 2 });
    setCurrentSize({ w: nw, h: nh });
  };

  const jump = (booth: any) => {
    if (!booth || !mapCanvasRef.current) return;
    setActiveMap(booth.mapId);
    setOffset({ x: mapCanvasRef.current.clientWidth / 2 - (booth.x || 0) * scale, y: mapCanvasRef.current.clientHeight / 2 - (booth.y || 0) * scale });
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const newScale = Math.max(0.1, Math.min(5, scale * (1 - e.deltaY * 0.001)));
    const rect = mapCanvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mouseX = e.clientX - rect.left; const mouseY = e.clientY - rect.top;
    const imgX = (mouseX - offset.x) / scale; const imgY = (mouseY - offset.y) / scale;
    setOffset({ x: mouseX - imgX * newScale, y: mouseY - imgY * newScale });
    setScale(newScale);
  };

  const handleStart = (e: any) => {
    const t = e.touches ? e.touches[0] : e;
    setIsDragging(true); setLastPos({ x: t.clientX, y: t.clientY });
    if (e.touches && e.touches.length === 2) setDist(Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY));
  };

  const handleMove = (e: any) => {
    if (!isDragging) return;
    if (e.touches?.length === 2 && dist) {
      const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      const newScale = Math.min(Math.max(scale * (d / dist), 0.1), 10);
      const cx = (e.touches[0].clientX + e.touches[1].clientX) / 2; const cy = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      setOffset({ x: cx - (cx - offset.x) * (newScale / scale), y: cy - (cy - offset.y) * (newScale / scale) });
      setScale(newScale); setDist(d);
    } else {
      const t = e.touches ? e.touches[0] : e;
      setOffset(o => ({ x: o.x + (t.clientX - lastPos.x), y: o.y + (t.clientY - lastPos.y) }));
      setLastPos({ x: t.clientX, y: t.clientY });
    }
  };

  const getBoothNo = (b: any) => {
    if (!b) return '';
    const exclude = ['mapId', 'x', 'y', '__EMPTY', 'x_pixel', 'y_pixel'];
    const key = Object.keys(b).find(k => !exclude.includes(k));
    return key ? String(b[key]) : '';
  };

  const handleSearch = (query: string, setResults: React.Dispatch<React.SetStateAction<any[]>>) => {
    if (!query) { setResults([]); return; }
    setResults(fuse.search(query).map(r => r.item).slice(0, 10));
  };

  const promoteToStart = () => {
    if (!destination) return;
    setCurrentLocation(destination); setInputA(inputB);
    setDestination(null); setInputB('');
  };

  useEffect(() => {
    if (!mapCanvasRef.current) return;
    const cw = mapCanvasRef.current.clientWidth;
    const ch = mapCanvasRef.current.clientHeight;
    const imgCenterX = (cw / 2 - offset.x) / (scale || 1);
    const imgCenterY = (ch / 2 - offset.y) / (scale || 1);
    if (scale >= 1.0) {
      const found = booths.filter(b => b.mapId === activeMap && Math.sqrt((b.x - imgCenterX)**2 + (b.y - imgCenterY)**2) < 40);
      setSelectedBooths(found);
    } else {
      setSelectedBooths([]);
    }
  }, [scale, offset, activeMap]);

  useEffect(() => {
    if (destination) {
      const last = navHistory[navHistory.length - 1];
      if (!last || last.booth['__EMPTY'] !== destination['__EMPTY'] || last.booth.mapId !== destination.mapId) {
        setNavHistory(prev => {
          if (prev.length === 0 && currentLocation) {
            return [
              { id: Date.now().toString() + "-start", booth: currentLocation, visible: true },
              { id: Date.now().toString() + "-end", booth: destination, visible: true }
            ];
          }
          return [...prev, { id: Date.now().toString() + Math.random(), booth: destination, visible: true }];
        });
      }
    }
  }, [destination, currentLocation]);

  const onDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const onDragEnd = (event: any) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setNavHistory((items) => {
        const oldIndex = items.findIndex(i => i.id === active.id);
        const newIndex = items.findIndex(i => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
    setActiveId(null);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const Marker = ({ b, type, colorOverride, isHistory }: any) => {
    if (!b) return null;
    const color = colorOverride || (type === 'A' ? "#ef4444" : "#3b82f6");
    const strokeColor = type === 'A' ? "#991b1b" : (type === 'B' ? "#1e40af" : "#065f46");
    const r = 22 / scale;
    return (
      <g>
        {!isHistory && (b['__EMPTY']?.includes('エスカレータ')) 
          ? <rect x={(b.x || 0) - r} y={(b.y || 0) - r} width={r * 2} height={r * 2} fill={color} stroke="white" strokeWidth={5 / scale} />
          : <circle cx={b.x || 0} cy={b.y || 0} r={r} fill={color} stroke="white" strokeWidth={5 / scale} />
        }
        <text x={b.x || 0} y={b.y || 0} textAnchor="middle" dominantBaseline="central" style={{ fontSize: `${22 / scale}px`, fontWeight: '900', fill: 'white', stroke: strokeColor, strokeWidth: `${2 / scale}px`, paintOrder: 'stroke', pointerEvents: 'none' }}>{getBoothNo(b)}</text>
      </g>
    );
  };

  const StarMarker = ({ b }: any) => {
    if (!b) return null;
    const r = 24 / scale;
    const px = b.x; const py = b.y;
    const starPath = `M ${px} ${py - r} L ${px + r * 0.22} ${py - r * 0.3} L ${px + r * 0.95} ${py - r * 0.3} L ${px + r * 0.36} ${py + r * 0.12} L ${px + r * 0.59} ${py + r * 0.81} L ${px} ${py + r * 0.38} L ${px - r * 0.59} ${py + r * 0.81} L ${px - r * 0.36} ${py + r * 0.12} L ${px - r * 0.95} ${py - r * 0.3} L ${px - r * 0.22} ${py - r * 0.3} Z`;
    return <path d={starPath} fill="#f59e0b" stroke="white" strokeWidth={3 / scale} />;
  };

  const visibleHistoryBooths = navHistory.filter(h => h && h.visible && h.booth);

  return (
    <div className="app-container">
      <div className="map-canvas" ref={mapCanvasRef} onWheel={handleWheel} onMouseDown={handleStart} onMouseMove={handleMove} onMouseUp={() => setIsDragging(false)} onTouchStart={handleStart} onTouchMove={handleMove} onTouchEnd={() => setIsDragging(false)} style={{ touchAction: 'none' }}>
        <div style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`, transformOrigin: '0 0', position: 'relative' }}>
          <img ref={imgRef} src={activeMap === 'map1' ? '/map1.jpg' : '/map2.jpg'} alt="map" draggable="false" onLoad={resetLayout} style={{ display: 'block', maxWidth: 'none' }} />
          <svg viewBox={`0 0 ${currentSize.w} ${currentSize.h}`} style={{ position: 'absolute', top: 0, left: 0, width: currentSize.w, height: currentSize.h, pointerEvents: 'none' }}>
            <defs><marker id="arrowhead" markerWidth="5" markerHeight="3.5" refX="4" refY="1.75" orient="auto"><polygon points="0 0, 5 1.75, 0 3.5" fill="#1d4ed8" /></marker></defs>
            {showAllHistoryOnMap && visibleHistoryBooths.length > 1 && visibleHistoryBooths.slice(0, -1).map((h, i) => {
              const s = h.booth; const e = visibleHistoryBooths[i+1]?.booth;
              const isTrans = (b: any) => b['__EMPTY']?.includes('エスカレータ');
              if (s.mapId === e.mapId) {
                if (s.mapId === activeMap) return <line key={i} x1={s.x} y1={s.y} x2={e.x} y2={e.y} stroke="#1d4ed8" strokeWidth={10 / scale} strokeDasharray={`${20 / scale}, ${20 / scale}`} markerEnd="url(#arrowhead)" />;
              } else {
                const esc1 = booths.filter(b => b.mapId === s.mapId && isTrans(b)).sort((a,b) => Math.hypot(a.x-s.x, a.y-s.y) - Math.hypot(b.x-s.x, b.y-s.y))[0];
                const esc2 = booths.filter(b => b.mapId === e.mapId && isTrans(b)).sort((a,b) => Math.hypot(a.x-e.x, a.y-e.y) - Math.hypot(b.x-e.x, b.y-e.y))[0];
                if (s.mapId === activeMap && esc1) return <line key={i} x1={s.x} y1={s.y} x2={esc1.x} y2={esc1.y} stroke="#1d4ed8" strokeWidth={10 / scale} strokeDasharray={`${20 / scale}, ${20 / scale}`} markerEnd="url(#arrowhead)" />;
                if (e.mapId === activeMap && esc2) return <line key={i} x1={esc2.x} y1={esc2.y} x2={e.x} y2={e.y} stroke="#1d4ed8" strokeWidth={10 / scale} strokeDasharray={`${20 / scale}, ${20 / scale}`} markerEnd="url(#arrowhead)" />;
              }
              return null;
            })}
            {!showAllHistoryOnMap && currentLocation && destination && (() => {
              const isTrans = (b: any) => b['__EMPTY']?.includes('エスカレータ');
              if (currentLocation.mapId === destination.mapId) {
                if (currentLocation.mapId === activeMap) return <line x1={currentLocation.x} y1={currentLocation.y} x2={destination.x} y2={destination.y} stroke="#1d4ed8" strokeWidth={10 / scale} strokeDasharray={`${20 / scale}, ${20 / scale}`} markerEnd="url(#arrowhead)" />;
              } else {
                const esc1 = booths.filter(b => b.mapId === currentLocation.mapId && isTrans(b)).sort((a,b) => Math.hypot(a.x-currentLocation.x, a.y-currentLocation.y) - Math.hypot(b.x-currentLocation.x, b.y-currentLocation.y))[0];
                const esc2 = booths.filter(b => b.mapId === destination.mapId && isTrans(b)).sort((a,b) => Math.hypot(a.x-destination.x, a.y-destination.y) - Math.hypot(b.x-destination.x, b.y-destination.y))[0];
                if (currentLocation.mapId === activeMap && esc1) return <line x1={currentLocation.x} y1={currentLocation.y} x2={esc1.x} y2={esc1.y} stroke="#1d4ed8" strokeWidth={10 / scale} strokeDasharray={`${20 / scale}, ${20 / scale}`} markerEnd="url(#arrowhead)" />;
                if (destination.mapId === activeMap && esc2) return <line x1={esc2.x} y1={esc2.y} x2={e.x} y2={e.y} stroke="#1d4ed8" strokeWidth={10 / scale} strokeDasharray={`${20 / scale}, ${20 / scale}`} markerEnd="url(#arrowhead)" />;
              }
              return null;
            })()}
            {showAllHistoryOnMap && visibleHistoryBooths.map((h, i) => {
              if (h.booth.mapId !== activeMap) return null;
              const color = i === 0 ? "#FF0000" : (i === visibleHistoryBooths.length - 1 ? "#0000FF" : "#00FF00");
              return <Marker key={h.id} b={h.booth} colorOverride={color} isHistory={true} />;
            })}
            {showAllFavoritesOnMap && favorites.filter(f => f.mapId === activeMap).map((f, i) => (
              <StarMarker key={`fav-${i}`} b={f} />
            ))}
            {!showAllHistoryOnMap && currentLocation?.mapId === activeMap && <Marker b={currentLocation} type="A" />}
            {!showAllHistoryOnMap && destination?.mapId === activeMap && <Marker b={destination} type="B" />}
          </svg>
        </div>
        <BoothTooltip booths={selectedBooths} onSelect={(b) => { setDestination(b); setInputB(`[${getBoothNo(b)}] ${b['__EMPTY']}`); setSelectedBooths([]); }} />
        {scale >= 0.05 && (
          <div className="center-crosshair">
            <div className="crosshair-circle"></div><div className="crosshair-h"></div><div className="crosshair-v"></div>
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
            {[ {id:'A', label:'現在地', val:inputA, set:setInputA, res:resultsA, setRes:setResultsA, cur:currentLocation, setCur:setCurrentLocation, bg:'red-bg'},
               {id:'B', label:'目的地', val:inputB, set:setInputB, res:resultsB, setRes:setResultsB, cur:destination, setCur:setDestination, bg:'blue-bg'} ].map((row) => (
              <div key={row.id} className="location-row">
                <button className={`icon-btn ${row.bg}`} onClick={() => jump(row.cur)} disabled={!row.cur}></button>
                <button className={`fav-toggle-btn ${isFavorite(row.cur) ? 'active' : 'inactive'}`} onClick={() => toggleFavorite(row.cur)} disabled={!row.cur}>{isFavorite(row.cur) ? '★' : '☆'}</button>
                <div className="search-container">
                  <input className="search-input" type="text" placeholder={`${row.label} (番号/店名)`} value={row.val} onChange={(e) => { row.set(e.target.value); handleSearch(e.target.value, row.setRes); }} />
                  <div className="search-actions">
                    {row.id === 'B' && row.cur && <button className="promote-btn" onClick={promoteToStart} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>▲</button>}
                    {row.val && <button className="clear-btn" onClick={() => { row.set(''); row.setRes([]); row.setCur(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 8px', fontSize: '20px', color: '#94a3b8' }}>×</button>}
                  </div>
                  {row.res.length > 0 && <div className="results-list">{row.res.map((b, i) => (<div key={i} className="result-item" onClick={() => { row.setCur(b); row.set(`[${getBoothNo(b)}] ${b['__EMPTY']}`); row.setRes([]); jump(b); }}>[{getBoothNo(b)}] {b['__EMPTY']}</div>))}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
        <button className="fav-footer-btn" onClick={() => setShowFavoritesList(true)}>★</button>
        <button className="history-btn" onClick={() => setShowHistory(true)}>
          <svg viewBox="0 0 24 24" width="40" height="40" fill="none"><path d="M 5 18 C 5 2, 12 2, 12 12 S 19 22, 19 6" stroke="#1e293b" strokeWidth="3.2" strokeLinecap="round"/><circle cx="5" cy="18" r="4" fill="#ef4444" /><circle cx="12" cy="12" r="4" fill="#22c55e" /><circle cx="19" cy="6" r="4" fill="#3b82f6" /></svg>
        </button>
        <div className="bottom-right-actions">
          <button className="help-btn" onClick={() => setShowHelp(true)}>？</button>
          <button className="reset-btn" onClick={resetLayout}><svg viewBox="0 0 24 24" width="48" height="48" fill="none"><path d="M4 0V24M20 0V24M0 4H24M0 20H24" stroke="#94a3b8" strokeWidth="1.0"/><circle cx="12" cy="12" r="3.5" fill="#3b82f6"/></svg></button>
        </div>
      </div>

      {showHistory && (
        <div className="modal-overlay" onClick={() => setShowHistory(false)}>
          <div className="help-modal history-modal" onClick={e => e.stopPropagation()}>
            <div className="history-modal-header" style={{ display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px', marginBottom: '12px' }}>
              <h2 className="history-modal-title" style={{ margin: 0, padding: 0, fontSize: '18px', fontWeight: 'bold', border: 'none', color: '#1e293b', flexShrink: 0 }}>案内履歴</h2>
              <button className={`toggle-all-history-btn ${showAllHistoryOnMap ? 'active' : 'inactive'}`} onClick={() => setShowAllHistoryOnMap(!showAllHistoryOnMap)} style={{ background: '#f1f5f9', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', flexShrink: 0 }}>
                {showAllHistoryOnMap ? '一括表示を解除' : 'すべて表示'}
              </button>
              <div style={{ flex: 1 }}></div>
              <button className="clear-history-btn" onClick={() => { 
                setNavHistory([]);
                setInputA(''); setInputB('');
                setCurrentLocation(null); setDestination(null);
                setResultsA([]); setResultsB([]);
              }} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', flexShrink: 0 }}>削除</button>
            </div>
            <div className="help-content" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              {navHistory.length === 0 ? <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>履歴はありません</div> : (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={onDragStart} onDragEnd={onDragEnd}>
                  <SortableContext items={navHistory.map(i => i.id)} strategy={verticalListSortingStrategy}>
                    <div className="history-list">
                      {navHistory.map(item => (
                        <SortableHistoryItem key={item.id} id={item.id} item={item} getBoothNo={getBoothNo} onToggle={(id:any) => setNavHistory(prev => prev.map(i => i.id === id ? {...i, visible: !i.visible} : i))} onDelete={(id:any) => setNavHistory(prev => prev.filter(i => i.id !== id))} />
                      ))}
                    </div>
                  </SortableContext>
                  <DragOverlay dropAnimation={{ sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.5' } } }) }}>
                    {activeId ? (
                      <SortableHistoryItem id={activeId} item={navHistory.find(i => i.id === activeId)} getBoothNo={getBoothNo} isOverlay />
                    ) : null}
                  </DragOverlay>
                </DndContext>
              )}
            </div>
          </div>
        </div>
      )}

      {showFavoritesList && (
        <div className="modal-overlay" onClick={() => setShowFavoritesList(false)}>
          <div className="help-modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px', marginBottom: '12px' }}>
              <h2 style={{ margin: 0, padding: 0, fontSize: '18px', fontWeight: 'bold', border: 'none', color: '#1e293b', flexShrink: 0 }}>お気に入り</h2>
              <button className={`toggle-all-history-btn ${showAllFavoritesOnMap ? 'active' : 'inactive'}`} onClick={() => setShowAllFavoritesOnMap(!showAllFavoritesOnMap)} style={{ background: '#f1f5f9', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', flexShrink: 0 }}>
                {showAllFavoritesOnMap ? 'すべて解除' : 'すべて表示'}
              </button>
            </div>
            <div className="help-content" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              {favorites.length === 0 ? <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>お気に入りはありません</div> : (
                <div className="history-list">
                  {favorites.map((b, i) => (
                    <div key={i} className="history-item" onClick={() => { jump(b); setShowFavoritesList(false); }} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', borderBottom: '1px solid #f8fafc', cursor: 'pointer' }}>
                      <div className="history-item-info" style={{ flex: 1, fontSize: '14px', color: '#1e293b' }}>
                        <span style={{ fontWeight: 'bold', color: '#3b82f6', marginRight: '6px' }}>[{getBoothNo(b)}]</span>
                        {b['__EMPTY']}
                      </div>
                      <button className="delete-history-item" onClick={(e) => { e.stopPropagation(); toggleFavorite(b); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="none"><circle cx="12" cy="12" r="10" fill="#ef4444" /><path d="M7 12H17" stroke="white" strokeWidth="2.5" strokeLinecap="round" /></svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showHelp && <HelpModal onClose={() => { setShowHelp(false); setShowTechInfo(false); }} onShowAppInfo={(v) => setShowTechInfo(v)} showAppInfo={showTechInfo} onShowQR={() => setShowLargeQR(true)} onShowAuthor={() => setShowAuthorModal(true)} />}
      {showAuthorModal && <AuthorModal onClose={() => setShowAuthorModal(false)} />}
      {showLargeQR && <QRModal onClose={() => setShowLargeQR(false)} />}
    </div>
  );
};

export default App;
