import { useState, useRef, useCallback, useEffect } from 'react';
import { SEOUL_CENTER, MIN_FOCUS_ZOOM, SEARCH_COUNT, FIND_RADIUS, FIND_COUNT } from '../constants/mapConfig';
import { fetchPoiList } from '../services/tmapApi';

export function usePlaceSearch({
  mapInstanceRef,
  renderSearchMarkers,
  focusPoi,
  updateUrlParams,
  showToast,
  getFallbackKeyword,
  onPoiMarkerClick,
}) {
  const [keyword, setKeyword] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [autoCompleteList, setAutoCompleteList] = useState([]);
  const [selectedPoiId, setSelectedPoiId] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);

  const debounceTimerRef = useRef(null);
  const isSearchingRef = useRef(false);

  // POI 객체에서 ID추출
  const getPoiKey = (poi) => poi?.id || poi?.poiId;

  // 검색 상태 초기화
  const resetSearchState = useCallback(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    setAutoCompleteList([]);
    setSearchResults([]);
    setSelectedPoiId(null);
  }, []);

  // 장소 키워드 검색
  const handleSearch = useCallback(async (targetQuery, targetPoiId = null, skipCenterMove = false, initialZoom = null) => {
    const fallback = getFallbackKeyword ? getFallbackKeyword() : '';
    const query = (targetQuery ?? (keyword || fallback)).trim();
    if (!query) return null;

    isSearchingRef.current = true;
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    resetSearchState();
    setKeyword(query);
    setActiveCategory(null);

    updateUrlParams({
      mode: 'search',
      q: query,
      category: null,
      poi: targetPoiId,
      start: null,
      end: null,
      transit: null,
    });

    const center = mapInstanceRef.current?.getCenter() || SEOUL_CENTER;
    const [centerLat, centerLng] = [center.lat(), center.lng()];

    try {
      const poiList = await fetchPoiList({ query, centerLat, centerLng, searchtypCd: 'A', count: SEARCH_COUNT });

      if (poiList.length > 0) {
        setSearchResults(poiList);
        
        // 검색 결과 마커 렌더링 & 클릭 콜백 등록
        renderSearchMarkers(poiList, (poi) => {
          const key = getPoiKey(poi);
          setSelectedPoiId(key);
          focusPoi(poi);
          updateUrlParams({ mode: 'search', poi: key, category: null });

          // 핀 클릭 시 사이드바를 '검색' 탭으로 즉시 전환
          if (onPoiMarkerClick) {
            onPoiMarkerClick();
          }
        });

        const decodedPoiId = targetPoiId ? decodeURIComponent(targetPoiId) : null;
        const targetPoi = (decodedPoiId && poiList.find((p) => getPoiKey(p) === decodedPoiId)) || poiList[0];

        const targetKey = getPoiKey(targetPoi);
        setSelectedPoiId(targetKey);
        updateUrlParams({ poi: targetKey });

        if (!skipCenterMove) focusPoi(targetPoi, initialZoom);
        return targetPoi;
      } else {
        showToast('검색 결과가 없습니다.');
      }
    } catch {
      showToast('검색 중 오류가 발생했습니다.');
    } finally {
      setTimeout(() => { isSearchingRef.current = false; }, 100);
    }
    return null;
  }, [focusPoi, getFallbackKeyword, keyword, mapInstanceRef, onPoiMarkerClick, renderSearchMarkers, resetSearchState, showToast, updateUrlParams]);

  // 카테고리 주변 검색
  const searchNearbyCategory = useCallback(async (category, targetPoiId = null, initialZoom = null, centerPoi = null) => {
    if (!mapInstanceRef.current) return;

    isSearchingRef.current = true;
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    resetSearchState();
    setActiveCategory(category.id);

    let queryKeyword = keyword.trim();
    if (!queryKeyword && centerPoi?.name) {
      queryKeyword = centerPoi.name;
      setKeyword(queryKeyword);
    }

    let centerLat = centerPoi?.lat || mapInstanceRef.current.getCenter().lat();
    let centerLng = centerPoi?.lng || mapInstanceRef.current.getCenter().lng();

    updateUrlParams({
      mode: 'search',
      q: null,
      category: category.id,
      poi: targetPoiId,
      start: null,
      end: null,
      transit: null,
    });

    try {
      const poiList = await fetchPoiList({
        query: category.label,
        centerLat,
        centerLng,
        searchtypCd: 'R',
        radius: FIND_RADIUS,
        count: FIND_COUNT,
      });

      if (poiList.length > 0) {
        setSearchResults(poiList);

        // 카테고리 마커 렌더링 & 클릭 콜백 등록
        renderSearchMarkers(poiList, (poi) => {
          const key = getPoiKey(poi);
          setSelectedPoiId(key);
          focusPoi(poi);
          updateUrlParams({ mode: 'search', category: category.id, poi: key });

          // 핀을 클릭했을 때만 길찾기에서 검색 탭으로 화면 전환 실행!
          if (onPoiMarkerClick) {
            onPoiMarkerClick();
          }
        });

        const bounds = new window.Tmapv2.LatLngBounds();
        poiList.forEach((poi) => {
          bounds.extend(new window.Tmapv2.LatLng(parseFloat(poi.frontLat || poi.noorLat), parseFloat(poi.frontLon || poi.noorLon)));
        });

        if (poiList.length > 1) {
          mapInstanceRef.current.fitBounds(bounds, 80);
        } else {
          mapInstanceRef.current.setCenter(new window.Tmapv2.LatLng(parseFloat(poiList[0].frontLat || poiList[0].noorLat), parseFloat(poiList[0].frontLon || poiList[0].noorLon)));
          mapInstanceRef.current.setZoom(MIN_FOCUS_ZOOM);
        }

        const decodedPoiId = targetPoiId ? decodeURIComponent(targetPoiId) : null;
        if (decodedPoiId) {
          const targetPoi = poiList.find((p) => getPoiKey(p) === decodedPoiId);
          if (targetPoi) {
            setSelectedPoiId(getPoiKey(targetPoi));
            focusPoi(targetPoi, initialZoom);
          }
        }
      } else {
        showToast(`주변에 '${category.label}' 검색 결과가 없습니다.`);
      }
    } catch {
      showToast('주변 시설을 검색하는 중 오류가 발생했습니다.');
    } finally {
      setTimeout(() => { isSearchingRef.current = false; }, 100);
    }
  }, [focusPoi, keyword, mapInstanceRef, onPoiMarkerClick, renderSearchMarkers, resetSearchState, showToast, updateUrlParams]);

  // 검색창 입력 200ms 디바운스 자동완성
  useEffect(() => {
    const trimmed = keyword.trim();
    if (!trimmed || isSearchingRef.current) return setAutoCompleteList([]);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    debounceTimerRef.current = setTimeout(async () => {
      if (isSearchingRef.current) return;
      const center = mapInstanceRef.current?.getCenter() || SEOUL_CENTER;

      try {
        const poiList = await fetchPoiList({ query: trimmed, centerLat: center.lat(), centerLng: center.lng(), searchtypCd: 'A', count: 6 });
        if (!isSearchingRef.current && poiList.length > 0) {
          const names = Array.from(new Set(poiList.map((p) => p.name))).slice(0, 6);
          setAutoCompleteList(names);
        } else {
          setAutoCompleteList([]);
        }
      } catch {
        setAutoCompleteList([]);
      }
    }, 200);

    return () => { if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current); };
  }, [keyword, mapInstanceRef]);

  return {
    keyword, setKeyword,
    searchResults, setSearchResults,
    autoCompleteList, setAutoCompleteList,
    selectedPoiId, setSelectedPoiId,
    activeCategory, setActiveCategory,
    isSearchingRef, resetSearchState, handleSearch, searchNearbyCategory,
  };
}