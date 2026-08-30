import { useRef, useCallback, useEffect } from 'react';
import { SEOUL_CENTER, DEFAULT_ZOOM, MIN_FOCUS_ZOOM } from '../constants/mapConfig';
import { getDistanceInMeters } from '../utils/geoUtils';

export function useTmap({ mapRef, onZoomChanged, onInitialized }) {
  // 선언부
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const polylinesRef = useRef([]);

  const clearMarkers = useCallback(() => {
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];
  }, []);

  const clearPolylines = useCallback(() => {
    polylinesRef.current.forEach((line) => line.setMap(null));
    polylinesRef.current = [];
  }, []);

  // 장소 포커싱 함수
  const focusPoi = useCallback((poi, targetZoom = null) => {
    if (!mapInstanceRef.current || !poi) return;

    // 좌표 탐색
    const lat = parseFloat(poi.frontLat || poi.noorLat || poi.lat);
    const lng = parseFloat(poi.frontLon || poi.noorLon || poi.lng);
    const targetPos = new window.Tmapv2.LatLng(lat, lng);

    // 줌 레벨 설정
    const currentCenter = mapInstanceRef.current.getCenter();
    const currentZoom = mapInstanceRef.current.getZoom() || DEFAULT_ZOOM;
    const nextZoom = targetZoom !== null ? targetZoom : Math.max(currentZoom, MIN_FOCUS_ZOOM);

    // 이동 애니메이션
    const dist = getDistanceInMeters(currentCenter.lat(), currentCenter.lng(), lat, lng);
    if (dist < 15000 && currentZoom === nextZoom) {
      mapInstanceRef.current.panTo(targetPos);
    } else {
      mapInstanceRef.current.setCenter(targetPos);
      mapInstanceRef.current.setZoom(nextZoom);
    }
  }, []);

  // 핀 불러오기
  const renderSearchMarkers = useCallback((poiList, onMarkerClick) => {
    // 핀, 선 초기화
    clearMarkers();
    clearPolylines();

    // 마커, 지도 배치
    poiList.forEach((poi) => {
      const lat = parseFloat(poi.frontLat || poi.noorLat || poi.lat);
      const lng = parseFloat(poi.frontLon || poi.noorLon || poi.lng);

      const marker = new window.Tmapv2.Marker({
        position: new window.Tmapv2.LatLng(lat, lng),
        map: mapInstanceRef.current,
        title: poi.name,
      });

      // 핀 클릭 이벤트
      marker.addListener('click', () => {
        focusPoi(poi);
        if (onMarkerClick) onMarkerClick(poi);
      });
      markersRef.current.push(marker);
    });
  }, [clearMarkers, clearPolylines, focusPoi]);

  // 구간별 색상 그리기
  const drawRoutePolyline = useCallback((targetRoute) => {
    if (!mapInstanceRef.current || !targetRoute) return;

    // 기존 선 제거
    clearPolylines();

    // 대중교통 경로 (구간별 이동이 쪼개진 경우)
    if (targetRoute.pathSegments && targetRoute.pathSegments.length > 0) {
      const bounds = new window.Tmapv2.LatLngBounds();

      targetRoute.pathSegments.forEach((seg) => {
        if (!seg.path || seg.path.length === 0) return;

        // 걷기 판별 및 선 생성
        const isWalk = seg.type === 'walk';
        const polyline = new window.Tmapv2.Polyline({
          path: seg.path,
          strokeColor: seg.color || '#2563eb',
          strokeWeight: isWalk ? 5 : 7,
          strokeOpacity: isWalk ? 0.75 : 0.9,
          strokeStyle: isWalk ? 'dash' : 'solid', // 도보는 점선, 대중교통은 실선
          map: mapInstanceRef.current,
        });

        polylinesRef.current.push(polyline);
        seg.path.forEach((pt) => bounds.extend(pt));
      });

      // 카메라 맞춤
      mapInstanceRef.current.fitBounds(bounds, 80);
      return;
    }

    // 차량, 도보 (구간 분할 없음)
    if (!targetRoute.path || targetRoute.path.length === 0) return;

    // 선 생성
    const polyline = new window.Tmapv2.Polyline({
      path: targetRoute.path,
      strokeColor: targetRoute.color || '#2563eb',
      strokeWeight: 6,
      strokeOpacity: 0.85,
      map: mapInstanceRef.current,
    });
    polylinesRef.current.push(polyline);

    const bounds = new window.Tmapv2.LatLngBounds();
    targetRoute.path.forEach((pt) => bounds.extend(pt));
    // 카메라 맞춤
    mapInstanceRef.current.fitBounds(bounds, 80);
  }, [clearPolylines]);

  // 길찾기 모드에서 출발지/도착지 핀 찍기
  const renderRouteMarkers = useCallback((startCoord, endCoord) => {
    clearMarkers();

    // 두 핀 지점 영역 개체
    const bounds = new window.Tmapv2.LatLngBounds();

    // 출발지 마커 생성
    if (startCoord) {
      const startPos = new window.Tmapv2.LatLng(startCoord.lat, startCoord.lng);
      const startMarker = new window.Tmapv2.Marker({
        position: startPos,
        map: mapInstanceRef.current,
        title: `출발: ${startCoord.name}`,
      });
      markersRef.current.push(startMarker);
      bounds.extend(startPos);
    }

    // 도착지 마커 생성
    if (endCoord) {
      const endPos = new window.Tmapv2.LatLng(endCoord.lat, endCoord.lng);
      const endMarker = new window.Tmapv2.Marker({
        position: endPos,
        map: mapInstanceRef.current,
        title: `도착: ${endCoord.name}`,
      });
      markersRef.current.push(endMarker);
      bounds.extend(endPos);
    }

    if (!mapInstanceRef.current) return;

    // 상황 별 줌 제어
    if (startCoord && endCoord) { // 둘 다 존재
      mapInstanceRef.current.fitBounds(bounds, 80);
    } else if (startCoord) { // 출발지만
      mapInstanceRef.current.setCenter(new window.Tmapv2.LatLng(startCoord.lat, startCoord.lng));
      mapInstanceRef.current.setZoom(MIN_FOCUS_ZOOM);
    } else if (endCoord) { // 도착지만
      mapInstanceRef.current.setCenter(new window.Tmapv2.LatLng(endCoord.lat, endCoord.lng));
      mapInstanceRef.current.setZoom(MIN_FOCUS_ZOOM);
    }
  }, [clearMarkers]);

  // 주기적 지도 렌더링
  useEffect(() => {
    const timer = setInterval(() => {
      if (window.Tmapv2?.Map && mapRef.current && !mapRef.current.hasChildNodes()) {
        // 조건 충족시 타이머 중단
        clearInterval(timer);
        const params = new URLSearchParams(window.location.search);

        // 파라미터의 줌 값 적용, 없을 경우 디폴트
        const initialZoom = params.get('zoom') ? parseInt(params.get('zoom'), 10) : DEFAULT_ZOOM;

        // 지도 생성
        const map = new window.Tmapv2.Map(mapRef.current, {
          center: new window.Tmapv2.LatLng(SEOUL_CENTER.lat, SEOUL_CENTER.lng),
          width: '100%',
          height: '100%',
          zoom: initialZoom,
        });

        // 줌 변경 감지
        map.addListener('zoom_changed', () => {
          if (onZoomChanged) onZoomChanged(map.getZoom());
        });

        // 지도 객체 저장
        mapInstanceRef.current = map;
        if (onInitialized) onInitialized(map);
      }
    }, 100);

    return () => clearInterval(timer);
  }, [mapRef, onInitialized, onZoomChanged]);

  return {
    mapInstanceRef,
    clearMarkers,
    clearPolylines,
    focusPoi,
    renderSearchMarkers,
    drawRoutePolyline,
    renderRouteMarkers,
  };
}