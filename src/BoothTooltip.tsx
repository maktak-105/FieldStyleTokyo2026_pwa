import React from 'react';
import { getBoothNo } from './utils';

interface BoothTooltipProps {
  booths: any[];
  onSelect?: (booth: any) => void;
}

export const BoothTooltip: React.FC<BoothTooltipProps> = ({ booths, onSelect }) => {
  if (!booths || booths.length === 0) return null;

  // ブース番号でグループ化
  const groups: { [key: string]: any[] } = {};
  booths.forEach(b => {
    const num = getBoothNo(b);
    if (!groups[num]) groups[num] = [];
    groups[num].push(b);
  });

  return (
    <div className="booth-tooltip">
      <div className="tooltip-content" style={{ padding: '0' }}> {/* パディングを内部に移動 */}
        <div className="tooltip-list" style={{ 
          overflowY: 'auto', 
          maxHeight: '250px',
          padding: '10px 16px' // スクロール領域内部にパディングを設定
        }}>
          {Object.entries(groups).map(([num, items], gIndex) => (
            <div key={num} className="tooltip-group" style={{ 
              marginBottom: gIndex < Object.keys(groups).length - 1 ? '16px' : '0',
              textAlign: 'left'
            }}>
              {/* 【重要】sticky設定により、スクロールしても番号が上部に固定される */}
              <div className="tooltip-number" style={{ 
                position: 'sticky', 
                top: '-10px', // 親のパディング分を調整
                background: 'rgba(15, 23, 42, 0.95)', // 背後の文字を隠すための背景
                padding: '4px 0',
                margin: '0 -16px 8px -16px', // 左右に広げて背景をカバー
                paddingLeft: '16px',
                fontSize: '0.85rem', 
                color: '#60a5fa', 
                fontWeight: '800',
                zIndex: 1,
                borderBottom: '1px solid rgba(255,255,255,0.1)'
              }}>
                #{num}
              </div>
              
              {items.map((item, iIndex) => (
                <div 
                  key={iIndex} 
                  className="tooltip-name" 
                  onClick={() => onSelect?.(item)}
                  style={{ 
                    fontSize: '0.95rem', 
                    fontWeight: '600', 
                    margin: '6px 0',
                    whiteSpace: 'normal',
                    wordBreak: 'break-all',
                    color: 'white',
                    cursor: 'pointer'
                  }}
                >
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
