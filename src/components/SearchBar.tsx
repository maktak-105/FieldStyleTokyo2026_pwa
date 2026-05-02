import React, { useState, useEffect, useRef } from 'react';
import Fuse from 'fuse.js';
import { Search, MapPin } from 'lucide-react';
import type { Booth } from '../types';

interface SearchBarProps {
  booths: Booth[];
  onSelect: (booth: Booth | null) => void;
  placeholder: string;
  value: Booth | null;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  booths,
  onSelect,
  placeholder,
  value,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Booth[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // 選択されたブースがある場合、その「番号と名前」を表示
  useEffect(() => {
    if (value) {
      const boothNo = value['西展示棟1F'];
      const boothName = value['__EMPTY'];
      setQuery(`[${boothNo}] ${boothName}`);
    } else {
      setQuery('');
    }
  }, [value]);

  const fuse = new Fuse(booths, {
    keys: ['西展示棟1F', '__EMPTY'],
    threshold: 0.3,
  });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setQuery(text);
    if (text.length > 0) {
      const searchResults = fuse.search(text).map(r => r.item).slice(0, 5);
      setResults(searchResults);
      setIsOpen(true);
    } else {
      setResults([]);
      setIsOpen(false);
      onSelect(null);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="search-wrapper" ref={wrapperRef}>
      <div className="search-input-container">
        <Search className="search-icon" size={18} />
        <input
          type="text"
          className="search-input"
          placeholder={placeholder}
          value={query}
          onChange={handleSearch}
          onFocus={() => query.length > 0 && setIsOpen(true)}
        />
      </div>

      {isOpen && results.length > 0 && (
        <div className="search-results">
          {results.map((booth, index) => (
            <div
              key={`${booth['西展示棟1F']}-${index}`}
              className="search-result-item"
              onClick={() => {
                onSelect(booth);
                setIsOpen(false);
              }}
            >
              <div className="result-icon-wrapper">
                <MapPin size={16} />
              </div>
              <div className="result-text">
                <span className="result-title">[{booth['西展示棟1F']}] {booth['__EMPTY']}</span>
                <span className="result-subtitle">{booth.mapId === 'map1' ? '西1・2' : '西3・4・南3'}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
