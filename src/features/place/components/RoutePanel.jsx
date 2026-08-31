import { useRef } from 'react';
import { formatTime, formatDistance } from '../services/routeApi';

export default function RoutePanel({
  routeWrapperRef,
  startPlace,
  setStartPlace,
  endPlace,
  setEndPlace,
  startAutoComplete,
  setStartAutoComplete,
  endAutoComplete,
  setEndAutoComplete,
  startPoiRef,
  endPoiRef,
  isRouteSearched,
  selectedTransit,
  routeData,
  selectedRouteIndex,
  onSelectRouteOption,
  onTransitChange,
  onSwapRoute,
  onRouteSearch,
  onFetchAutoComplete,
  setIsRouteSearched,
  onNextStep,
}) {
  const startInputRef = useRef(null);
  const endInputRef = useRef(null);

  const currentTransitData = routeData[selectedTransit];
  const routeList = currentTransitData?.routes || [];

  const handleStartKeyDown = (e) => {
    if (e.nativeEvent.isComposing) return;
    if (e.key === 'Enter') {
      setStartAutoComplete([]);
      if (startInputRef.current) startInputRef.current.blur();
      onRouteSearch();
    } else if (e.key === 'Escape') {
      setStartAutoComplete([]);
      if (startInputRef.current) startInputRef.current.blur();
    }
  };

  const handleEndKeyDown = (e) => {
    if (e.nativeEvent.isComposing) return;
    if (e.key === 'Enter') {
      setEndAutoComplete([]);
      if (endInputRef.current) endInputRef.current.blur();
      onRouteSearch();
    } else if (e.key === 'Escape') {
      setEndAutoComplete([]);
      if (endInputRef.current) endInputRef.current.blur();
    }
  };

  const handleStartBlur = () => {
    setTimeout(() => {
      setStartAutoComplete([]);
    }, 150);
  };

  const handleEndBlur = () => {
    setTimeout(() => {
      setEndAutoComplete([]);
    }, 150);
  };

  return (
    <div className="route-form-wrapper" ref={routeWrapperRef}>
      {/* 출발지 입력 행 */}
      <div className="route-input-row">
        <input
          ref={startInputRef}
          type="text"
          placeholder="출발지 입력"
          className="route-input"
          value={startPlace}
          onChange={(e) => {
            setStartPlace(e.target.value);
            startPoiRef.current = null;
            setIsRouteSearched(false);
            onFetchAutoComplete(e.target.value, setStartAutoComplete);
          }}
          onKeyDown={handleStartKeyDown}
          onBlur={handleStartBlur}
        />
        <button 
          className="route-swap-btn" 
          title="출발지/도착지 전환" 
          onClick={onSwapRoute}
        >
          ↕
        </button>

        {startAutoComplete.length > 0 && (
          <div className="route-autocomplete-list">
            {startAutoComplete.map((poi, index) => (
              <div
                key={index}
                className="autocomplete-item"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setStartPlace(poi.name);
                  startPoiRef.current = {
                    name: poi.name,
                    lat: parseFloat(poi.frontLat || poi.noorLat),
                    lng: parseFloat(poi.frontLon || poi.noorLon),
                  };
                  setStartAutoComplete([]);
                }}
              >
                <span>{poi.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 도착지 입력 행 */}
      <div className="route-input-row">
        <input
          ref={endInputRef}
          type="text"
          placeholder="도착지 입력"
          className="route-input"
          value={endPlace}
          onChange={(e) => {
            setEndPlace(e.target.value);
            endPoiRef.current = null;
            setIsRouteSearched(false);
            onFetchAutoComplete(e.target.value, setEndAutoComplete);
          }}
          onKeyDown={handleEndKeyDown}
          onBlur={handleEndBlur}
        />
        <button 
          className="route-search-btn" 
          onClick={() => {
            setStartAutoComplete([]);
            setEndAutoComplete([]);
            if (startInputRef.current) startInputRef.current.blur();
            if (endInputRef.current) endInputRef.current.blur();
            onRouteSearch();
          }}
        >
          길찾기
        </button>

        {endAutoComplete.length > 0 && (
          <div className="route-autocomplete-list">
            {endAutoComplete.map((poi, index) => (
              <div
                key={index}
                className="autocomplete-item"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setEndPlace(poi.name);
                  endPoiRef.current = {
                    name: poi.name,
                    lat: parseFloat(poi.frontLat || poi.noorLat),
                    lng: parseFloat(poi.frontLon || poi.noorLon),
                  };
                  setEndAutoComplete([]);
                }}
              >
                <span>{poi.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 이동수단 3종 탭 */}
      {isRouteSearched && (
        <>
          <div className="transit-type-container">
            <button
              className={`transit-type-btn ${selectedTransit === 'transit' ? 'active' : ''}`}
              onClick={() => onTransitChange('transit')}
            >
              대중교통
            </button>
            <button
              className={`transit-type-btn ${selectedTransit === 'walk' ? 'active' : ''}`}
              onClick={() => onTransitChange('walk')}
            >
              도보
            </button>
            <button
              className={`transit-type-btn ${selectedTransit === 'car' ? 'active' : ''}`}
              onClick={() => onTransitChange('car')}
            >
              차량
            </button>
          </div>

          {/* 경로 옵션 카드 리스트 */}
          {currentTransitData ? (
            currentTransitData.isAvailable ? (
              <div className="route-option-list">
                {routeList.map((route, idx) => {
                  const isSelected = idx === selectedRouteIndex;
                  return (
                    <div
                      key={route.id || idx}
                      className={`route-option-card ${isSelected ? 'active' : ''}`}
                      onClick={() => onSelectRouteOption(idx)}
                    >
                      <div className="option-header">
                        <span className="option-badge">{route.label}</span>
                        {route.tollFee > 0 && (
                          <span className="option-toll">
                            {selectedTransit === 'transit' ? `요금 ` : `통행료 `}
                            {route.tollFee.toLocaleString()}원
                          </span>
                        )}
                      </div>
                      
                      <div className="summary-main">
                        <span className="summary-time">{formatTime(route.totalTime)}</span>
                        <span className="summary-dist">{formatDistance(route.totalDistance)}</span>
                        {selectedTransit === 'transit' && route.transitCount !== undefined && (
                          <span className="transit-count-badge">
                            {route.transitCount === 0 ? '환승없음' : `환승 ${route.transitCount}회`}
                          </span>
                        )}
                      </div>

                      {/* 대중교통 스텝 뱃지 (지하철, 버스 환승 경로 표시) */}
                      {selectedTransit === 'transit' && route.steps && (
                        <div className="transit-step-flow">
                          {route.steps.map((st, sIdx) => (
                            <span key={sIdx} className="transit-step-item">
                              {sIdx > 0 && <span className="step-arrow">›</span>}
                              <span className={`step-badge ${st.type}`}>
                                {st.name}
                              </span>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* 하단 다음 버튼 */}
                {routeList.length > 0 && onNextStep && (
                  <div className="route-next-btn-wrapper">
                    <button className="route-next-btn" onClick={onNextStep}>
                      다음
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="route-warning-box">
                <span>{currentTransitData.message}</span>
              </div>
            )
          ) : (
            <div className="route-loading-box">
              경로를 계산하고 있습니다...
            </div>
          )}
        </>
      )}
    </div>
  );
}