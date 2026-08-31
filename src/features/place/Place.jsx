import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './Place.css';

import { CATEGORIES, DEFAULT_START_LOCATION } from './constants/mapConfig';
import { fetchPoiById } from './services/tmapApi';
import { useTmap } from './hooks/useTmap';
import { useUrlSync } from './hooks/useUrlSync';
import { usePlaceSearch } from './hooks/usePlaceSearch';
import { usePlaceRoute } from './hooks/usePlaceRoute';

import ModeBar from './components/ModeBar';
import SearchPanel from './components/SearchPanel';
import RoutePanel from './components/RoutePanel';
import CategoryBar from './components/CategoryBar';

export default function Place() {
  const navigate = useNavigate();

  const [currentMode, setCurrentMode] = useState('search');
  const [isOpen, setIsOpen] = useState(true);
  const [toastMessage, setToastMessage] = useState('');
  const toastTimerRef = useRef(null);

  const mapRef = useRef(null);
  const searchWrapperRef = useRef(null);
  const routeWrapperRef = useRef(null);
  const isInitializedRef = useRef(false);

  const { isRestoringRef, updateUrlParams } = useUrlSync();

  const showToast = useCallback((msg) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastMessage(msg);
    toastTimerRef.current = setTimeout(() => setToastMessage(''), 2500);
  }, []);

  const {
    mapInstanceRef,
    clearMarkers,
    clearPolylines,
    focusPoi,
    renderSearchMarkers,
    drawRoutePolyline,
    renderRouteMarkers,
  } = useTmap({
    mapRef,
    onZoomChanged: (zoom) => {
      if (!isRestoringRef.current) updateUrlParams({ zoom });
    },
    onInitialized: () => {
      if (!isInitializedRef.current) {
        isInitializedRef.current = true;
        restoreStateFromUrl();
      }
    },
  });

  const routeHook = usePlaceRoute({
    mapInstanceRef,
    clearPolylines,
    drawRoutePolyline,
    renderRouteMarkers,
    updateUrlParams,
    showToast,
  });

  const searchHook = usePlaceSearch({
    mapInstanceRef,
    renderSearchMarkers,
    focusPoi,
    clearMarkers,
    updateUrlParams,
    showToast,
    getFallbackKeyword: () => routeHook.endPoiRef.current?.name || routeHook.endPlace || '',
    onPoiMarkerClick: () => {
      setCurrentMode('search'); 
      setIsOpen(true);         
    },
  });

  const resetAllState = useCallback(() => {
    clearMarkers();
    clearPolylines();
    searchHook.resetSearchState();
    routeHook.resetRouteState();
  }, [clearMarkers, clearPolylines, routeHook, searchHook]);

  const handleHomeClick = () => {
    resetAllState();
    searchHook.setKeyword('');
    searchHook.setActiveCategory(null);
    setCurrentMode('search');
    setIsOpen(true);
    navigate('/');
  };

  const handlePlaceInfo = (poi) => {
    navigate(`/placeinfo/${poi.id}`);
  };

  const restoreStateFromUrl = useCallback(async () => {
    const params = new URLSearchParams(window.location.search);
    const modeParam = params.get('mode');
    const qParam = params.get('q');
    const categoryParam = params.get('category');
    const poiParam = params.get('poi');
    const startParam = params.get('start');
    const endParam = params.get('end');
    const transitParam = params.get('transit');
    const zoomParam = params.get('zoom');
    const parsedZoom = zoomParam ? parseInt(zoomParam, 10) : null;

    if (!modeParam && !qParam && !categoryParam && !startParam && !endParam && !parsedZoom) return;

    isRestoringRef.current = true;
    try {
      if (modeParam === 'route' || (startParam && endParam)) {
        setCurrentMode('route');
        if (transitParam) routeHook.setSelectedTransit(transitParam);

        // 1. 출발지 POI 정보 복원
        let startObj = null;
        if (startParam) {
          if (startParam === DEFAULT_START_LOCATION.id || startParam === DEFAULT_START_LOCATION.name) {
            startObj = DEFAULT_START_LOCATION;
          } else if (/^\d+$/.test(startParam)) {
            startObj = await fetchPoiById(startParam);
          }
          const startName = startObj?.name || startParam;
          routeHook.setStartPlace(startName);
          if (startObj) routeHook.setStartPoi(startObj);
        }

        // 2. 도착지 POI 정보 복원
        let endObj = null;
        if (endParam) {
          if (/^\d+$/.test(endParam)) {
            endObj = await fetchPoiById(endParam);
          }
          const endName = endObj?.name || endParam;
          routeHook.setEndPlace(endName);
          if (endObj) routeHook.setEndPoi(endObj);
        }

        // 3. 경로 탐색 실행
        if (startParam && endParam) {
          await routeHook.executeRouteSearch(
            startObj,
            endObj,
            transitParam || 'car',
            startObj?.name || startParam,
            endObj?.name || endParam
          );
        }
      } else if (qParam) {
        setCurrentMode('search');
        searchHook.setKeyword(qParam);

        if (categoryParam) {
          const topPoi = await searchHook.handleSearch(qParam, null, true);
          if (topPoi && mapInstanceRef.current) {
            const lat = parseFloat(topPoi.frontLat || topPoi.noorLat);
            const lng = parseFloat(topPoi.frontLon || topPoi.noorLon);
            mapInstanceRef.current.setCenter(new window.Tmapv2.LatLng(lat, lng));
            if (parsedZoom) mapInstanceRef.current.setZoom(parsedZoom);
          }
          const catObj = CATEGORIES.find((c) => c.id === categoryParam);
          if (catObj) await searchHook.searchNearbyCategory(catObj, poiParam, parsedZoom);
        } else {
          await searchHook.handleSearch(qParam, poiParam, false, parsedZoom);
        }
      } else if (categoryParam) {
        setCurrentMode('search');
        const catObj = CATEGORIES.find((c) => c.id === categoryParam);
        if (catObj) await searchHook.searchNearbyCategory(catObj, poiParam, parsedZoom);
      } else if (parsedZoom && mapInstanceRef.current) {
        mapInstanceRef.current.setZoom(parsedZoom);
      }
    } finally {
      setTimeout(() => { isRestoringRef.current = false; }, 200);
    }
  }, [isRestoringRef, mapInstanceRef, routeHook, searchHook]);

  // [수정] 플래너 페이지로 데이터 세션 저장 및 라우트 이동
  const handleNextStep = () => {
    const payload = routeHook.createNextPayload();
    sessionStorage.setItem('tmap_next_payload', JSON.stringify(payload));
    navigate('/planner');
  };

  const handleSetStartFromPoi = (poi) => {
    const poiId = poi.id || poi.poiId || poi.customId || poi.name;
    const poiObj = { 
      id: poiId,
      name: poi.name, 
      lat: parseFloat(poi.frontLat || poi.noorLat), 
      lng: parseFloat(poi.frontLon || poi.noorLon) 
    };
    const currentEnd = routeHook.endPoiRef.current || (routeHook.endPlace.trim() ? { name: routeHook.endPlace.trim() } : null);

    if (currentEnd && ((currentEnd.lat === poiObj.lat && currentEnd.lng === poiObj.lng) || (currentEnd.name?.trim() === poiObj.name.trim()))) {
      routeHook.setStartPoi(poiObj);
      routeHook.setStartPlace(poi.name);
      routeHook.setEndPoi(null);
      routeHook.setEndPlace('');
      routeHook.setIsRouteSearched(false);
      clearMarkers();
      clearPolylines();
      setCurrentMode('route');
      setIsOpen(true);
      updateUrlParams({ mode: 'route', start: poiId, end: null, q: null, poi: null });
      showToast('출발지와 도착지가 같습니다.');
      return;
    }

    routeHook.setStartPoi(poiObj);
    routeHook.setStartPlace(poi.name);
    setCurrentMode('route');
    setIsOpen(true);

    if (routeHook.endPoiRef.current || routeHook.endPlace.trim()) {
      clearMarkers();
      clearPolylines();
      routeHook.executeRouteSearch(poiObj, routeHook.endPoiRef.current, null, poiId, routeHook.endPoiRef.current?.id || routeHook.endPlace);
    } else {
      routeHook.setIsRouteSearched(false);
      clearMarkers();
      clearPolylines();
      renderRouteMarkers(poiObj, null);
      updateUrlParams({ mode: 'route', start: poiId, end: null, q: null, poi: null });
    }
  };

  const handleSetEndFromPoi = (poi) => {
    const poiId = poi.id || poi.poiId || poi.customId || poi.name;
    const poiObj = { 
      id: poiId,
      name: poi.name, 
      lat: parseFloat(poi.frontLat || poi.noorLat), 
      lng: parseFloat(poi.frontLon || poi.noorLon) 
    };
    let startObj = routeHook.startPoiRef.current || (routeHook.startPlace.trim() ? { name: routeHook.startPlace.trim() } : { name: '출발지' });

    if ((startObj.lat === poiObj.lat && startObj.lng === poiObj.lng) || (startObj.name?.trim() === poiObj.name.trim())) {
      routeHook.setEndPoi(null);
      routeHook.setEndPlace('');
      routeHook.setIsRouteSearched(false);
      clearMarkers();
      clearPolylines();
      renderRouteMarkers(startObj.lat ? startObj : null, null);
      setCurrentMode('route');
      setIsOpen(true);
      updateUrlParams({ mode: 'route', start: startObj.id || startObj.name || routeHook.startPlace, end: null, q: null, poi: null });
      showToast('출발지와 도착지가 같습니다.');
      return;
    }

    routeHook.setEndPoi(poiObj);
    routeHook.setEndPlace(poi.name);
    clearMarkers();
    clearPolylines();
    setCurrentMode('route');
    setIsOpen(true);
    routeHook.executeRouteSearch(routeHook.startPoiRef.current, poiObj, null, routeHook.startPoiRef.current?.id || routeHook.startPlace, poiId);
  };

  const toggleSidebarMode = (mode) => {
    if (currentMode === mode) {
      setIsOpen((prev) => !prev);
    } else {
      setCurrentMode(mode);
      setIsOpen(true);

      if (mode === 'search') {
        let activeQuery = searchHook.keyword.trim();
        if (!activeQuery && (routeHook.endPoiRef.current?.name || routeHook.endPlace.trim())) {
          activeQuery = routeHook.endPoiRef.current?.name || routeHook.endPlace.trim();
          searchHook.handleSearch(activeQuery);
          return;
        }

        updateUrlParams({ mode: 'search', q: activeQuery || null });
        clearPolylines();

        if (searchHook.searchResults.length > 0) {
          renderSearchMarkers(searchHook.searchResults, (poi) => {
            const key = poi.id || poi.poiId || poi.customId || poi.name;
            searchHook.setSelectedPoiId(key);
            updateUrlParams({ mode: 'search', poi: key });
            setCurrentMode('search');
            setIsOpen(true);
          });
          const targetPoi = searchHook.searchResults.find((p) => (p.id || p.poiId || p.customId) === searchHook.selectedPoiId) || searchHook.searchResults[0];
          if (targetPoi) focusPoi(targetPoi);
        } else if (activeQuery) {
          searchHook.handleSearch(activeQuery);
        } else {
          clearMarkers();
        }
      } else if (mode === 'route') {
        updateUrlParams({ mode: 'route' });
        if (routeHook.isRouteSearched && (routeHook.startPoiRef.current || routeHook.endPoiRef.current)) {
          renderRouteMarkers(routeHook.startPoiRef.current, routeHook.endPoiRef.current);
          const currentTransitObj = routeHook.routeData[routeHook.selectedTransit];
          if (currentTransitObj?.isAvailable) {
            const currentRoute = currentTransitObj.routes?.[routeHook.selectedRouteIndex];
            if (currentRoute) drawRoutePolyline(currentRoute);
          }
        } else {
          clearMarkers();
          clearPolylines();
          renderRouteMarkers(routeHook.startPoiRef.current, routeHook.endPoiRef.current);
        }
      }
    }
  };

  const handleCategoryClick = (category) => {
    if (searchHook.activeCategory === category.id) {
      searchHook.setActiveCategory(null);
      resetAllState();
      updateUrlParams({ category: null, poi: null });
    } else {
      searchHook.searchNearbyCategory(category, null, null, routeHook.endPoiRef.current);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!mapInstanceRef.current) return;
      window.dispatchEvent(new Event('resize'));

      if (routeHook.isRouteSearched && currentMode === 'route' && (routeHook.startPoiRef.current || routeHook.endPoiRef.current)) {
        const currentTransitObj = routeHook.routeData[routeHook.selectedTransit];
        if (currentTransitObj?.isAvailable) {
          const currentRoute = currentTransitObj.routes?.[routeHook.selectedRouteIndex];
          if (currentRoute) drawRoutePolyline(currentRoute);
        } else {
          renderRouteMarkers(routeHook.startPoiRef.current, routeHook.endPoiRef.current);
        }
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [isOpen, currentMode, routeHook.isRouteSearched, routeHook.routeData, routeHook.selectedTransit, routeHook.selectedRouteIndex, drawRoutePolyline, renderRouteMarkers, mapInstanceRef, routeHook.startPoiRef, routeHook.endPoiRef]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(e.target)) {
        searchHook.setAutoCompleteList([]);
      }
      if (routeWrapperRef.current && !routeWrapperRef.current.contains(e.target)) {
        if (routeHook.routeDebounceTimerRef?.current) {
          clearTimeout(routeHook.routeDebounceTimerRef.current);
        }
        routeHook.setStartAutoComplete([]);
        routeHook.setEndAutoComplete([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [routeHook, searchHook]);

  return (
    <div className="app-container">
      <ModeBar currentMode={currentMode} isOpen={isOpen} onHomeClick={handleHomeClick} onToggleMode={toggleSidebarMode} />

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <button className="toggle-btn" onClick={() => setIsOpen((prev) => !prev)}>
          {isOpen ? '◀' : '▶'}
        </button>

        {isOpen && (
          <div className="sidebar-content">
            {currentMode === 'search' ? (
              <SearchPanel 
                keyword={searchHook.keyword}
                setKeyword={searchHook.setKeyword}
                isSearchingRef={searchHook.isSearchingRef}
                searchWrapperRef={searchWrapperRef}
                autoCompleteList={searchHook.autoCompleteList}
                searchResults={searchHook.searchResults}
                selectedPoiId={searchHook.selectedPoiId}
                onSearch={searchHook.handleSearch}
                onFocusPoi={(poi) => {
                  const key = poi.id || poi.poiId || poi.customId || poi.name;
                  searchHook.setSelectedPoiId(key);
                  focusPoi(poi);
                  updateUrlParams({ poi: key });
                }}
                onSetStart={handleSetStartFromPoi}
                onSetEnd={handleSetEndFromPoi}
                onPlaceInfo={handlePlaceInfo}
              />
            ) : (
              <RoutePanel 
                routeWrapperRef={routeWrapperRef}
                startPlace={routeHook.startPlace}
                setStartPlace={routeHook.setStartPlace}
                endPlace={routeHook.endPlace}
                setEndPlace={routeHook.setEndPlace}
                startAutoComplete={routeHook.startAutoComplete}
                setStartAutoComplete={routeHook.setStartAutoComplete}
                endAutoComplete={routeHook.endAutoComplete}
                setEndAutoComplete={routeHook.setEndAutoComplete}
                startPoiRef={routeHook.startPoiRef}
                endPoiRef={routeHook.endPoiRef}
                isRouteSearched={routeHook.isRouteSearched}
                selectedTransit={routeHook.selectedTransit}
                routeData={routeHook.routeData}
                selectedRouteIndex={routeHook.selectedRouteIndex}
                onSelectRouteOption={routeHook.handleSelectRouteOption}
                onTransitChange={routeHook.handleTransitChange}
                onSwapRoute={routeHook.handleSwapRoute}
                onRouteSearch={routeHook.executeRouteSearch}
                onFetchAutoComplete={routeHook.fetchRouteAutoComplete}
                setIsRouteSearched={routeHook.setIsRouteSearched}
                onNextStep={handleNextStep}
              />
            )}
          </div>
        )}
      </aside>

      <div className="map-wrapper">
        <CategoryBar activeCategory={searchHook.activeCategory} onCategoryClick={handleCategoryClick} />
        <main ref={mapRef} className="map-canvas" />
        {toastMessage && (
          <div className="toast-notification">
            <span className="toast-text">{toastMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
}