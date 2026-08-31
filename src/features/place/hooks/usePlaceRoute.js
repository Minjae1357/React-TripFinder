import { useState, useRef, useCallback } from 'react';
import { DEFAULT_START_LOCATION, SEOUL_CENTER } from '../constants/mapConfig';
import { fetchPoiList } from '../services/tmapApi';
import { fetchPedestrianRouteApi, fetchCarRouteApi } from '../services/routeApi';
import { fetchHybridTransitRouteApi } from '../services/transitHybridApi';

export function usePlaceRoute({
  mapInstanceRef, // TMAP 지도 객체
  clearPolylines, // 기존 경로 제거 함수
  drawRoutePolyline, // 선택 경로에 선 그리는 함수
  renderRouteMarkers, // 출발지, 도착지에 핀 찍는 함수
  updateUrlParams, // 파라미터 반영 함수
  showToast, // 알림 팝업 함수
}) {
  // useState
  const [startPlace, setStartPlace] = useState(DEFAULT_START_LOCATION.name);
  const [endPlace, setEndPlace] = useState('');
  const [startAutoComplete, setStartAutoComplete] = useState([]);
  const [endAutoComplete, setEndAutoComplete] = useState([]);
  const [isRouteSearched, setIsRouteSearched] = useState(false);
  const [selectedTransit, setSelectedTransit] = useState('car');
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);
  const [routeData, setRouteData] = useState({ walk: null, car: null, transit: null });

  // useRef
  const startPoiRef = useRef(DEFAULT_START_LOCATION);
  const endPoiRef = useRef(null);
  const routeDebounceTimerRef = useRef(null);

  // POI에서 TMAP 고유 ID 추출
  const getPoiKey = (poi) => poi?.id || poi?.poiId;

  // 출발지 정보
  const setStartPoi = useCallback((poi) => {
    startPoiRef.current = poi;
  }, []);

  // 도착지 정보
  const setEndPoi = useCallback((poi) => {
    endPoiRef.current = poi;
  }, []);

  // 자동 완성 초기화
  const resetRouteState = useCallback(() => {
    if (routeDebounceTimerRef.current) clearTimeout(routeDebounceTimerRef.current);
    setStartAutoComplete([]);
    setEndAutoComplete([]);
    setIsRouteSearched(false);
    setRouteData({ walk: null, car: null, transit: null });
    setSelectedRouteIndex(0);
  }, []);

  // 출발지와 도착지 사이 핀 찍고 경로 불러오기
  const executeRouteSearch = useCallback(async (startObj, endObj, transitMode = null, startTextOverride = null, endTextOverride = null) => {
    if (!mapInstanceRef.current) return;

    if (routeDebounceTimerRef.current) clearTimeout(routeDebounceTimerRef.current);
    setStartAutoComplete([]);
    setEndAutoComplete([]);
    clearPolylines();
    setSelectedRouteIndex(0);

    let startCoord = startObj || startPoiRef.current;
    let endCoord = endObj || endPoiRef.current;
    const currentTransit = transitMode || selectedTransit;

    const targetStartText = (startTextOverride !== null && startTextOverride !== undefined ? startTextOverride : startPlace).trim();
    const targetEndText = (endTextOverride !== null && endTextOverride !== undefined ? endTextOverride : endPlace).trim();

    const center = mapInstanceRef.current.getCenter();
    const centerLat = center.lat();
    const centerLng = center.lng();

    // 출발지 검색어로 좌표 추출
    if (!startCoord && targetStartText) {
      try {
        const res = await fetchPoiList({ query: targetStartText, centerLat, centerLng, searchtypCd: 'A', count: 1 });
        if (res.length > 0) {
          startCoord = {
            id: res[0].id || res[0].poiId,
            name: res[0].name,
            lat: parseFloat(res[0].frontLat || res[0].noorLat),
            lng: parseFloat(res[0].frontLon || res[0].noorLon),
          };
          startPoiRef.current = startCoord;
          setStartPlace(res[0].name);
        }
      } catch (err) {
        console.warn('출발지 좌표 변환 실패:', err);
      }
    }

    // 도착지 검색어로 좌표 추출
    if (!endCoord && targetEndText) {
      try {
        const res = await fetchPoiList({ query: targetEndText, centerLat, centerLng, searchtypCd: 'A', count: 1 });
        if (res.length > 0) {
          endCoord = {
            id: res[0].id || res[0].poiId,
            name: res[0].name,
            lat: parseFloat(res[0].frontLat || res[0].noorLat),
            lng: parseFloat(res[0].frontLon || res[0].noorLon),
          };
          endPoiRef.current = endCoord;
          setEndPlace(res[0].name);
        }
      } catch (err) {
        console.warn('도착지 좌표 변환 실패:', err);
      }
    }

    if (!startCoord || !endCoord) {
      showToast('출발지와 도착지를 모두 올바르게 입력해주세요.');
      return;
    }

    // 동일 장소 검증
    const isSameLocation = (startCoord.lat === endCoord.lat && startCoord.lng === endCoord.lng);

    if (isSameLocation) {
      endPoiRef.current = null;
      setEndPlace('');
      setIsRouteSearched(false);
      clearPolylines();
      renderRouteMarkers(startCoord, null);
      updateUrlParams({ mode: 'route', start: getPoiKey(startCoord), end: null });
      showToast('출발지와 도착지가 같습니다.');
      return;
    }

    // 길찾기 상태 및 마커 렌더링
    setIsRouteSearched(true);
    renderRouteMarkers(startCoord, endCoord);

    // TMAP ID 우선으로 URL 쿼리 파라미터 갱신
    updateUrlParams({
      mode: 'route',
      start: getPoiKey(startCoord),
      end: getPoiKey(endCoord),
      transit: currentTransit,
      q: null,
      poi: null,
      category: null,
    });

    try {
      const [walkRes, carRes, transitRes] = await Promise.allSettled([
        fetchPedestrianRouteApi({ startCoord, endCoord }),
        fetchCarRouteApi({ startCoord, endCoord }),
        fetchHybridTransitRouteApi({ startCoord, endCoord }),
      ]);

      const failMessage = { isAvailable: false, message: '경로를 탐색할 수 없습니다.', routes: [] };
      const walkRouteData = walkRes.status === 'fulfilled' ? walkRes.value : failMessage;
      const carRouteData = carRes.status === 'fulfilled' ? carRes.value : failMessage;
      const transitRouteData = transitRes.status === 'fulfilled' ? transitRes.value : failMessage;

      const newRouteData = { walk: walkRouteData, car: carRouteData, transit: transitRouteData };
      setRouteData(newRouteData);

      const targetTransitObj = newRouteData[currentTransit];
      const defaultRoute = targetTransitObj?.routes?.[0];
      if (defaultRoute && targetTransitObj.isAvailable) {
        drawRoutePolyline(defaultRoute);
      }
    } catch (err) {
      console.error('경로 탐색 실패:', err);
    }
  }, [clearPolylines, drawRoutePolyline, endPlace, mapInstanceRef, renderRouteMarkers, selectedTransit, showToast, startPlace, updateUrlParams]);

  // 이동수단 변경
  const handleTransitChange = useCallback((type) => {
    setSelectedTransit(type);
    setSelectedRouteIndex(0);
    updateUrlParams({ transit: type });

    const targetTransitObj = routeData[type];
    if (targetTransitObj && targetTransitObj.isAvailable) {
      const target = targetTransitObj.routes?.[0];
      if (target) drawRoutePolyline(target);
    } else {
      clearPolylines();
    }
  }, [clearPolylines, drawRoutePolyline, routeData, updateUrlParams]);

  // 경로 옵션 선택
  const handleSelectRouteOption = useCallback((index) => {
    setSelectedRouteIndex(index);
    const targetRoutes = routeData[selectedTransit]?.routes || [];
    const target = targetRoutes[index];
    if (target) {
      drawRoutePolyline(target);
    }
  }, [drawRoutePolyline, routeData, selectedTransit]);

  // 출발지, 도착지 스왑
  const handleSwapRoute = useCallback(() => {
    const tempText = startPlace;
    setStartPlace(endPlace);
    setEndPlace(tempText);

    const tempPoi = startPoiRef.current;
    startPoiRef.current = endPoiRef.current;
    endPoiRef.current = tempPoi;

    if (startPoiRef.current && endPoiRef.current) {
      executeRouteSearch(startPoiRef.current, endPoiRef.current, selectedTransit);
    }
  }, [endPlace, executeRouteSearch, selectedTransit, startPlace]);

  // 자동완성 검색
  const fetchRouteAutoComplete = useCallback((text, setList) => {
    const trimmed = text.trim();
    if (routeDebounceTimerRef.current) clearTimeout(routeDebounceTimerRef.current);
    if (!trimmed) {
      setList([]);
      return;
    }

    routeDebounceTimerRef.current = setTimeout(async () => {
      const center = mapInstanceRef.current ? mapInstanceRef.current.getCenter() : SEOUL_CENTER;
      const centerLat = center.lat();
      const centerLng = center.lng();

      try {
        const poiList = await fetchPoiList({ query: trimmed, centerLat, centerLng, searchtypCd: 'A', count: 6 });
        setList(poiList.slice(0, 6));
      } catch {
        setList([]);
      }
    }, 200);
  }, [mapInstanceRef]);

  // JSON 형태로 내보내기
  const createNextPayload = useCallback(() => {
    const currentRoutes = routeData[selectedTransit]?.routes || [];
    const selectedRoute = currentRoutes[selectedRouteIndex] || null;

    return {
      timestamp: new Date().toISOString(),
      transportMode: selectedTransit,
      start: {
        name: startPlace,
        lat: startPoiRef.current?.lat,
        lng: startPoiRef.current?.lng,
      },
      destination: {
        name: endPlace,
        lat: endPoiRef.current?.lat,
        lng: endPoiRef.current?.lng,
      },
      selectedRoute: selectedRoute ? {
        id: selectedRoute.id,
        apiSource: selectedRoute.apiSource || '',
        label: selectedRoute.label || selectedRoute.name,
        totalTime: selectedRoute.totalTime,
        totalDistance: selectedRoute.totalDistance,
        tollFee: selectedRoute.tollFee || 0,
        transitCount: selectedRoute.transitCount ?? 0,
        steps: selectedRoute.steps || [],
        pathCoordinatesCount: selectedRoute.path ? selectedRoute.path.length : 0,
      } : null,
      allAvailableRoutes: currentRoutes.map((r, i) => ({
        index: i,
        label: r.label || r.name,
        totalTime: r.totalTime,
        totalDistance: r.totalDistance,
        tollFee: r.tollFee || 0,
      })),
    };
  }, [endPlace, routeData, selectedRouteIndex, selectedTransit, startPlace]);

  return {
    startPlace, setStartPlace,
    endPlace, setEndPlace,
    startAutoComplete, setStartAutoComplete,
    endAutoComplete, setEndAutoComplete,
    isRouteSearched, setIsRouteSearched,
    selectedTransit, setSelectedTransit,
    selectedRouteIndex, setSelectedRouteIndex,
    routeData, setRouteData,
    startPoiRef, endPoiRef,
    setStartPoi, setEndPoi,
    resetRouteState,
    executeRouteSearch,
    handleTransitChange,
    handleSelectRouteOption,
    handleSwapRoute,
    fetchRouteAutoComplete,
    createNextPayload,
  };
}