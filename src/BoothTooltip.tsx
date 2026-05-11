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

  return (
    <div className="booth-tooltip">
      <div className="tooltip-content">
        <div className="tooltip-list" style={{ 
          overflowY: 'auto', 
          maxHeight: '250px',
          paddingRight: '4px'
        }}>
          {booths.map((booth, index) => (
            <div key={index} className="tooltip-item" style={{ 
              marginBottom: index < booths.length - 1 ? '10px' : '0',
              paddingBottom: index < booths.length - 1 ? '8px' : '0',
              borderBottom: index < booths.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none',
              textAlign: 'left'
            }}>
              <div className="tooltip-number" style={{ fontSize: '0.75rem', color: '#60a5fa', fontWeight: '800' }}>
                #{getBoothNo(booth)}
              </div>
              <div className="tooltip-name" style={{ fontSize: '0.95rem', fontWeight: '600', marginTop: '2px' }}>
                {booth['__EMPTY']}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="tooltip-arrow"></div>
    </div>
  );
};
