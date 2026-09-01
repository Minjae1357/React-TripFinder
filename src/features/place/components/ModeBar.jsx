import React from 'react';

export default function ModeBar({ currentMode, onToggleMode }) {
  return (
    <div className="mode-bar">
      {/* 탐색 모드 버튼 */}
      <button
        className={`mode-btn ${currentMode === 'search' ? 'active' : ''}`}
        onClick={() => onToggleMode('search')}
        title="장소 탐색"
      >
        탐색
      </button>

      {/* 길찾기 모드 버튼 */}
      <button
        className={`mode-btn ${currentMode === 'route' ? 'active' : ''}`}
        onClick={() => onToggleMode('route')}
        title="길찾기"
      >
        길찾기
      </button>
    </div>
  );
}