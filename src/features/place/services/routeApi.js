import { APP_KEY } from '../constants/mapConfig';
import { getDistanceInMeters } from '../utils/geoUtils';

// 초 단위 시간 데이터 가공
export const formatTime = (seconds) => {
  if (!seconds || seconds <= 0) return '0분';
  const min = Math.round(seconds / 60);
  if (min < 60) return `${min}분`;
  const hour = Math.floor(min / 60);
  const remMin = min % 60;
  return remMin > 0 ? `${hour}시간 ${remMin}분` : `${hour}시간`;
};

// 거리 데이터 가공
export const formatDistance = (meters) => {
  if (!meters || meters <= 0) return '0m';
  if (meters < 1000) return `${meters}m`;
  return (meters / 1000).toFixed(1) + 'km';
};

// 도보 호출 함수
const fetchSinglePedestrianRoute = async ({ startCoord, endCoord, searchOption, label, desc, color }) => {
  try {
    const res = await fetch("https://apis.openapi.sk.com/tmap/routes/pedestrian?version=1", {
      method: "POST",
      headers: { "Content-Type": "application/json", appKey: APP_KEY },
      body: JSON.stringify({
        startX: startCoord.lng.toString(),
        startY: startCoord.lat.toString(),
        endX: endCoord.lng.toString(),
        endY: endCoord.lat.toString(),
        startName: startCoord.name || "출발지",
        endName: endCoord.name || "도착지",
        searchOption: searchOption.toString(), // 0 : 추천 경로, 4 : 큰길 우선, 30 : 계단 제외, 10 : 최단 거리
        reqCoordType: "WGS84GEO", // 표준 GPS 호출 방식이라함
        resCoordType: "WGS84GEO"
      })
    });

    if (!res.ok) return null;
    const data = await res.json(); // 값 불러오기
    if (!data.features || data.features.length === 0) return null;

    const props = data.features[0].properties;
    const path = [];
    data.features.forEach((f) => { // 선 값을 불러와 좌표 추출
      if (f.geometry && f.geometry.type === "LineString") { 
        f.geometry.coordinates.forEach((c) => {
          // GeoJSON는 좌표를 경도, 위도 순으로 주기 때문에 TMap에는 역순 c[1], c[0] 순으로 전송
          path.push(new window.Tmapv2.LatLng(c[1], c[0]));
        });
      }
    });

    // 결과 포장 및 반환
    return { 
      id: `walk_${searchOption}`,
      label,
      desc,
      totalTime: props.totalTime,
      totalDistance: props.totalDistance,
      path,
      color,
    };
  } catch {
    return null;
  }
};

// 30km 초과시 미반환 
export const fetchPedestrianRouteApi = async ({ startCoord, endCoord }) => {
  const dist = getDistanceInMeters(startCoord.lat, startCoord.lng, endCoord.lat, endCoord.lng);
  if (dist > 30000) {
    return {
      isAvailable: false,
      message: '거리(30km 초과)가 너무 멀어 도보 경로를 제공할 수 없습니다.',
      routes: [],
    };
  }

  // 도보 경로 옵션 (병렬 호출)
  const optionConfigs = [
    { searchOption: 0, label: '추천 경로', desc: '보행자 도로망 기준 최적 추천', color: '#3b82f6' },
    { searchOption: 4, label: '큰길 우선', desc: '안전한 대로 위주 보행 경로', color: '#2563eb' },
    { searchOption: 30, label: '계단 제외', desc: '계단을 회피하는 완만한 경로', color: '#0ea5e9' },
    { searchOption: 10, label: '최단 거리', desc: '골목을 포함한 최단 도보 거리', color: '#6366f1' },
  ];

  const results = await Promise.all(
    optionConfigs.map((cfg) => fetchSinglePedestrianRoute({ startCoord, endCoord, ...cfg }))
  );

  // 호출된 경로 중 null 값 제외
  const validRoutes = results.filter(Boolean);

  if (validRoutes.length === 0) {
    return {
      isAvailable: false,
      message: '도보 경로를 탐색할 수 없는 구간입니다.',
      routes: [],
    };
  }

  // 반환
  return {
    isAvailable: true,
    routes: validRoutes,
  };
};








// 차량 단일 옵션 호출 함수
const fetchSingleCarRoute = async ({ startCoord, endCoord, searchOption, label, desc, color }) => {
  try {
    // 위의 도보 코드와 거의 일치
    // 보행자용 주소인 '/pedestrian'가 빠짐
    const res = await fetch("https://apis.openapi.sk.com/tmap/routes?version=1", {
      method: "POST",
      headers: { "Content-Type": "application/json", appKey: APP_KEY },
      body: JSON.stringify({
        startX: startCoord.lng.toString(),
        startY: startCoord.lat.toString(),
        endX: endCoord.lng.toString(),
        endY: endCoord.lat.toString(),
        searchOption: searchOption.toString(),
        reqCoordType: "WGS84GEO",
        resCoordType: "WGS84GEO"
      })
    });

    if (!res.ok) return null;
    const data = await res.json();
    if (!data.features || data.features.length === 0) return null;

    // 도보와 동일한 선 좌표 추출
    const props = data.features[0].properties;
    const path = [];
    data.features.forEach((f) => {
      if (f.geometry && f.geometry.type === "LineString") {
        f.geometry.coordinates.forEach((c) => {
          path.push(new window.Tmapv2.LatLng(c[1], c[0]));
        });
      }
    });

    // 반환
    return {
      id: `car_${searchOption}`,
      label,
      desc,
      totalTime: props.totalTime,
      totalDistance: props.totalDistance,
      tollFee: props.totalFare || 0, // 고속도로, 유료도로 요금
      path,
      color,
    };
  } catch {
    return null;
  }
};

// 차량 다중 옵션 병렬 탐색
// 도보와 구조적으로 유사하지만 거리 조건(30km)가 빠짐
export const fetchCarRouteApi = async ({ startCoord, endCoord }) => {
  const optionConfigs = [ // 3가지 옵션 병렬 조회
    { searchOption: 0, label: '추천 경로', desc: '실시간 교통정보 반영 최적 경로', color: '#ef4444' },
    { searchOption: 1, label: '무료 우선', desc: '유료 도로를 제외한 경제적인 경로', color: '#f97316' },
    { searchOption: 2, label: '최단 거리', desc: '교통상황 무관 물리적 최단 주행 거리', color: '#eab308' },
  ];

  const results = await Promise.all( // 병렬 호출
    optionConfigs.map((cfg) => fetchSingleCarRoute({ startCoord, endCoord, ...cfg }))
  );

  const validRoutes = results.filter(Boolean); // 오류값 필터링

  if (validRoutes.length === 0) { // 실패 메시지
    return {
      isAvailable: false,
      message: '차량 경로를 탐색할 수 없습니다.',
      routes: [],
    };
  }

  // 반환
  return {
    isAvailable: true,
    routes: validRoutes,
  };
};