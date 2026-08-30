export default function ModeBar({ currentMode, isOpen, onHomeClick, onToggleMode }) {
  return (
    <nav className="mode-bar">
      <button className="mode-btn" onClick={onHomeClick}>
        홈
      </button>
      <button 
        className={`mode-btn ${isOpen && currentMode === 'search' ? 'active' : ''}`}
        onClick={() => onToggleMode('search')}
      >
        검색
      </button>
      <button 
        className={`mode-btn ${isOpen && currentMode === 'route' ? 'active' : ''}`}
        onClick={() => onToggleMode('route')}
      >
        길찾기
      </button>
    </nav>
  );
}