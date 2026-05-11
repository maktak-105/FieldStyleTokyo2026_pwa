import React from 'react';

interface BoothTooltipProps {
  booths: any[];
}

export const BoothTooltip: React.FC<BoothTooltipProps> = ({ booths }) => {
  if (!booths || booths.length === 0) return null;

  const getBoothNo = (b: any) => {
    if (!b) return '';
    const exclude = ['mapId', 'x', 'y', '__EMPTY', 'x_pixel', 'y_pixel'];
    const key = Object.keys(b).find(k => !exclude.includes(k));
    return key ? String(b[key]) : '';
  };

  // ブース番号でグループ化
  const groups: { [key: string]: any[] } = {};
  booths.forEach(b => {
    const num = getBoothNo(b);
    if (!groups[num]) groups[num] = [];
    groups[num].push(b);
  });

  return (
    <div className="booth-tooltip">
      <div className="tooltip-content">
        <div className="tooltip-list" style={{ 
          overflowY: 'auto', 
          maxHeight: '300px',
          paddingRight: '4px'
        }}>
          {Object.entries(groups).map(([num, items], gIndex) => (
            <div key={num} className="tooltip-group" style={{ 
              marginBottom: gIndex < Object.keys(groups).length - 1 ? '12px' : '0',
              paddingBottom: gIndex < Object.keys(groups).length - 1 ? '8px' : '0',
              borderBottom: gIndex < Object.keys(groups).length - 1 ? '1px solid rgba(255,255,255,0.2)' : 'none',
              textAlign: 'left'
            }}>
              {/* 番号はグループごとに1回だけ表示 */}
              <div className="tooltip-number" style={{ fontSize: '0.8rem', color: '#60a5fa', fontWeight: '800', marginBottom: '4px' }}>
                #{num}
              </div>
              {/* その番号に属する名称をすべてリストアップ */}
              {items.map((item, iIndex) => (
                <div key={iIndex} className="tooltip-name" style={{ 
                  fontSize: '0.95rem', 
                  fontWeight: '600', 
                  marginTop: '2px',
                  whiteSpace: 'normal',
                  wordBreak: 'break-all'
                }}>
                  {item['__EMPTY']}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="tooltip-arrow"></div>
    </div>
  );
};
