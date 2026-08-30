import { 
  APP_KEY, 
  ODSAY_API_KEY, 
  ODSAY_MAX_ROUTE_COUNT, 
  TRANSIT_HYBRID_DISTANCE_THRESHOLD 
} from '../constants/mapConfig';
import { getDistanceInMeters } from '../utils/geoUtils';

// 지하철 호선 별 색상
export const SUBWAY_COLORS = {
  1: '#0052A4', 2: '#00A84D', 3: '#EF7C1C', 4: '#00A5DE',
  5: '#996CAC', 6: '#CD7C2F', 7: '#747F00', 8: '#E6186C',
  9: '#BB8336', 101: '#0090D2', 104: '#77C4A3', 108: '#F5A200',
  109: '#D4003B', 113: '#B7C450', 114: '#81A914', 115: '#AD8605',
  116: '#6789CA', 117: '#9A6292', default: '#0284c7',
};

// 이동 수단 별 색상
export const TMAP_TRANSIT_COLORS = {
  WALK: '#94a3b8',
  SUBWAY: '#0052A4',
  BUS: '#16a34a',
  EXPRESSBUS: '#dc2626',
  TRAIN: '#7e22ce',
  AIRPLANE: '#0284c7',
};

// 1. 단거리 전용: ODsay API (시내 지하철/버스)
async function fetchODsayGraphicSections(mapObj) { // 버스-지하철이 지나가는 도로 좌표를 가져와서 지도용 선 데이터로 가공하는 함수
  if (!mapObj) return []; // 식별 번호가 없다면 즉시 빈 배열 반환
  const cacheKey = `odsay_lane_${mapObj}`;
  const cached = sessionStorage.getItem(cacheKey); // 한 번 불러온 궤적은 세션에 저장 (일일 호출 횟수 제한 아끼기 위함)
  if (cached) { 
    try {
      const parsed = JSON.parse(cached); // 순수 좌표를 TMAP 전용 객체로 변환
      return parsed.map((sec) => ({
        ...sec,
        path: sec.rawPath.map((p) => new window.Tmapv2.LatLng(p.lat, p.lng)),
      }));
    } catch {
      // ignore
    }
  }

  try {
    // 실제 API 호출
    const encodedKey = encodeURIComponent(ODSAY_API_KEY);
    const url = `https://api.odsay.com/v1/api/loadLane?mapObject=0:0@${mapObj}&apiKey=${encodedKey}`;
    const res = await fetch(url);
    const data = await res.json();

    const laneList = data.result?.lane || []; // 버스, 지하철 노선 정보 꺼내기
    const sections = [];
    const cacheData = [];

    laneList.forEach((lane) => { // 노선 파악 반복문
      const secList = lane.section || [];
      const coords = [];
      const rawCoords = [];

      secList.forEach((sec) => { // 구간 파악 반복문
        const graphPos = sec.graphPos || [];
        graphPos.forEach((pos) => { // 지점 파악 반복문
          if (pos.y && pos.x && window.Tmapv2?.LatLng) {
            coords.push(new window.Tmapv2.LatLng(pos.y, pos.x));
            rawCoords.push({ lat: pos.y, lng: pos.x });
          }
        });
      });

      if (coords.length > 0) {
        // ODsay 전용 규칙. 2면 지하철, 아니면 버스로 구분
        sections.push({ type: lane.class === 2 ? 'subway' : 'bus', path: coords });
        cacheData.push({ type: lane.class === 2 ? 'subway' : 'bus', rawPath: rawCoords });
      }
    });

    if (cacheData.length > 0) {
      sessionStorage.setItem(cacheKey, JSON.stringify(cacheData)); // 세션에 저장
    }
    return sections; // 완성된 배열 반환
  } catch {
    return []; // 오류 발생시 빈 배열 반환
  }
}

async function fetchODsayShortDistanceRoute({ startCoord, endCoord }) {
  // 출발지, 도착지 위도 경도 받아오기
  const sx = startCoord.lng;
  const sy = startCoord.lat;
  const ex = endCoord.lng;
  const ey = endCoord.lat;

  // API
  const encodedKey = encodeURIComponent(ODSAY_API_KEY);
  const url = `https://api.odsay.com/v1/api/searchPubTransPathT?SX=${sx}&SY=${sy}&EX=${ex}&EY=${ey}&apiKey=${encodedKey}`;

  const res = await fetch(url);
  const data = await res.json();

  // API 오류 or 경로가 없을 경우 처리
  if (data.error || !data.result?.path || data.result.path.length === 0) {
    return { isAvailable: false, message: data.error?.msg || '대중교통 경로를 찾을 수 없습니다.', routes: [] };
  }

  // ODsay는 여러 추천 경로를 반환해주는데, API 토큰 소비량을 감안하여 1개의 경로만 추천하도록 지정
  const maxCount = Math.max(1, ODSAY_MAX_ROUTE_COUNT || 1);
  const targetPaths = data.result.path.slice(0, maxCount);

  // 시작 지점과 도착 지점 미리 구성 (나중에 선으로 잇기 위함)
  const startLatLng = new window.Tmapv2.LatLng(startCoord.lat, startCoord.lng);
  const endLatLng = new window.Tmapv2.LatLng(endCoord.lat, endCoord.lng);

  const routesPromises = targetPaths.map(async (p, idx) => {
    // 요금 정보 (ODsay 버전에 따라 달라져서 2개에 대응하도록 구성함)
    const info = p.info || {};
    const subPath = p.subPath || [];
    const totalFare = info.totalPayment || info.payment || 0; 

    const steps = subPath.map((sub) => {
      if (sub.trafficType === 3) { // if-else 문을 이용하여 이동 방법 별로 나눔 (3:도보, 1:지하철, 2:버스)
        return {
          type: 'walk',
          name: '도보',
          text: `도보 ${sub.sectionTime}분 (${sub.distance}m)`,
          sectionTime: sub.sectionTime,
          distance: sub.distance,
          color: '#94a3b8',
        };
      } else if (sub.trafficType === 1) {
        const lane = sub.lane?.[0] || {};
        const color = SUBWAY_COLORS[lane.subwayCode] || SUBWAY_COLORS.default;
        return {
          type: 'subway',
          name: lane.name || '지하철',
          text: `[${lane.name || '지하철'}] (${sub.startName} → ${sub.endName}${sub.stationCount > 0 ? `, ${sub.stationCount}개 역` : ''})`,
          color,
          sectionTime: sub.sectionTime,
          distance: sub.distance,
        };
      } else if (sub.trafficType === 2) {
        const lane = sub.lane?.[0] || {};
        const color = lane.type === 4 || lane.type === 6 || lane.type === 14 ? '#dc2626' : (lane.type === 3 ? '#10b981' : '#2563eb');
        return {
          type: 'bus',
          name: lane.busNo || '버스',
          text: `[${lane.busNo || '버스'}] (${sub.startName} → ${sub.endName}${sub.stationCount > 0 ? `, ${sub.stationCount}개 정류장` : ''})`,
          color,
          sectionTime: sub.sectionTime,
          distance: sub.distance,
        };
      }
      return null;
    }).filter(Boolean);

    let graphicSections = []; // 구간 별 곡선 좌표 배열
    if (info.mapObj) {
      graphicSections = await fetchODsayGraphicSections(info.mapObj);
    }

    const pathSegments = [];
    const transitSteps = steps.filter((s) => s.type !== 'walk'); // 도보를 제외한 버스-지하철 경로만 남김

    if (graphicSections.length > 0) {
      const firstPoint = graphicSections[0]?.path?.[0];
      // 시작 지점부터 대중교통 탑승 지점까지 연결
      if (firstPoint) {
        pathSegments.push({
          type: 'walk',
          color: '#94a3b8',
          path: [startLatLng, firstPoint],
          rawPath: [{ lat: startCoord.lat, lng: startCoord.lng }, { lat: firstPoint.lat(), lng: firstPoint.lng() }],
        });
      }

      // 교통지점 사이 연결
      graphicSections.forEach((sec, sIdx) => {
        // 대중교통 지점(정거장)끼리 연결
        const matchedColor = transitSteps[sIdx]?.color || (sec.type === 'subway' ? '#0284c7' : '#16a34a');
        pathSegments.push({
          type: sec.type,
          color: matchedColor,
          path: sec.path,
          rawPath: sec.path.map((pt) => ({ lat: pt.lat(), lng: pt.lng() })),
        });

        // 대중교통 지점(정거장)사이 환승 경로 도보로 연결
        if (sIdx < graphicSections.length - 1) {
          const curLast = sec.path[sec.path.length - 1];
          const nextFirst = graphicSections[sIdx + 1]?.path?.[0];
          if (curLast && nextFirst) {
            pathSegments.push({
              type: 'walk',
              color: '#94a3b8',
              path: [curLast, nextFirst],
              rawPath: [{ lat: curLast.lat(), lng: curLast.lng() }, { lat: nextFirst.lat(), lng: nextFirst.lng() }],
            });
          }
        }
      });

      // 최종 하차 지점에서 목적지를 도보로 연결
      const lastSec = graphicSections[graphicSections.length - 1];
      const lastPoint = lastSec?.path?.[lastSec.path.length - 1];
      if (lastPoint) {
        pathSegments.push({
          type: 'walk',
          color: '#94a3b8',
          path: [lastPoint, endLatLng],
          rawPath: [{ lat: lastPoint.lat(), lng: lastPoint.lng() }, { lat: endCoord.lat, lng: endCoord.lng }],
        });
      }
    } else { // 경로 불러오기 실패시 시작점과 도착점을 일직선으로 연결하는 예외처리
      pathSegments.push({
        type: 'walk',
        color: '#94a3b8',
        path: [startLatLng, endLatLng],
        rawPath: [{ lat: startCoord.lat, lng: startCoord.lng }, { lat: endCoord.lat, lng: endCoord.lng }],
      });
    }

    const allPoints = pathSegments.flatMap((seg) => seg.path); // 구한 선들을 연결
    const totalTransits = Math.max(0, transitSteps.length - 1); // 환승 횟수 구하기

    return { // 반환 객체
      id: `odsay_transit_${idx}`,
      apiSource: 'ODsay (단거리/시내)',
      label: p.pathType === 1 ? '지하철' : p.pathType === 2 ? '버스' : '대중교통',
      totalTime: (info.totalTime || 0) * 60,
      totalDistance: info.totalDistance || 0,
      tollFee: totalFare,
      transitCount: totalTransits,
      steps,
      path: allPoints,
      pathSegments,
      rawPath: allPoints.map((pt) => ({ lat: pt.lat(), lng: pt.lng() })),
    };
  });

  const routes = await Promise.all(routesPromises); // 대기
  return { isAvailable: routes.length > 0, message: '', routes };
}








// 2. 장거리 전용: TMAP Transit API (고속버스/시외버스/기차 KTX)
async function fetchTmapLongDistanceRoute({ startCoord, endCoord }) {
  const url = `https://apis.openapi.sk.com/transit/routes?version=1&appKey=${APP_KEY}`;

  const response = await fetch(url, { // TMAP API 요청
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      appKey: APP_KEY,
    },
    body: JSON.stringify({
      startX: startCoord.lng.toString(),
      startY: startCoord.lat.toString(),
      endX: endCoord.lng.toString(),
      endY: endCoord.lat.toString(),
      count: 1, // 경로 갯수 (토큰 낭비 줄이기 위해 1개만 호출)
      lang: 0, // 언어 (0은 한국어, 1은 영어)
      format: 'json',
    }),
  });

  if (response.status === 429) { // 한도 초과 오류
    return { isAvailable: false, message: 'API 호출 한도 초과', routes: [] };
  }

  if (!response.ok) { // 응답 오류
    return { isAvailable: false, message: '장거리 대중교통 경로를 찾을 수 없습니다.', routes: [] };
  }

  const data = await response.json(); // 데이터 수신
  const itineraries = data.metaData?.plan?.itineraries || [];

  if (itineraries.length === 0) { // 경로 없을 경우 조기 종료
    return { isAvailable: false, message: '이동 가능한 장거리 대중교통 경로가 없습니다.', routes: [] };
  }

  const routes = itineraries.map((itinerary, idx) => {
    // 변수 선언부
    const pathSegments = []; // 색깔 선 데이터 
    const steps = []; // 텍스트 목록
    const allPoints = []; // 전체 좌표 배열


    itinerary.legs.forEach((leg) => {
      // 지역 변수 선언부
      const mode = leg.mode || 'WALK'; // 점을 잇는 경로
      const segColor = TMAP_TRANSIT_COLORS[mode] || '#2563eb'; // 색상
      const legPoints = []; // 좌표 배열

      // 미가공 데이터를 분리하여 좌표로 불러와서 변수에 담음
      if (leg.passShape?.linestring) {
        leg.passShape.linestring.split(' ').forEach((p) => {
          const [lng, lat] = p.split(',');
          if (lat && lng && window.Tmapv2?.LatLng) {
            const pt = new window.Tmapv2.LatLng(parseFloat(lat), parseFloat(lng));
            legPoints.push(pt);
            allPoints.push(pt);
          }
        });
      }

      // 구간별로 저장
      if (legPoints.length > 0) {
        pathSegments.push({
          type: mode.toLowerCase(),
          color: segColor,
          path: legPoints,
          rawPath: legPoints.map((pt) => ({ lat: pt.lat(), lng: pt.lng() })),
        });
      }

      // UI용 객체 작성
      const stopCount = leg.passStopList?.stationList?.length || 0;
      const startName = leg.start?.name || '출발지';
      const endName = leg.end?.name || '도착지';
      const routeName = leg.route || '';

      // 걷기, 고속버스, 열차, 지하철, 보스 등 개별 지정
      if (mode === 'WALK') {
        steps.push({
          type: 'walk',
          name: '도보',
          text: `도보 ${Math.round((leg.sectionTime || 0) / 60)}분 (${leg.distance || 0}m)`,
          color: TMAP_TRANSIT_COLORS.WALK,
          sectionTime: leg.sectionTime,
          distance: leg.distance,
        });
      } else if (mode === 'EXPRESSBUS') {
        steps.push({
          type: 'expressBus',
          name: routeName || '고속/시외버스',
          text: `[${routeName}] 고속/시외버스 (${startName} → ${endName})`,
          color: TMAP_TRANSIT_COLORS.EXPRESSBUS,
          sectionTime: leg.sectionTime,
          distance: leg.distance,
        });
      } else if (mode === 'TRAIN') {
        steps.push({
          type: 'train',
          name: routeName || '기차',
          text: `[${routeName}] 기차/KTX (${startName} → ${endName})`,
          color: TMAP_TRANSIT_COLORS.TRAIN,
          sectionTime: leg.sectionTime,
          distance: leg.distance,
        });
      } else if (mode === 'SUBWAY') {
        steps.push({
          type: 'subway',
          name: routeName || '지하철',
          text: `[${routeName}] 지하철 (${startName} → ${endName}${stopCount > 0 ? `, ${stopCount}개 역` : ''})`,
          color: TMAP_TRANSIT_COLORS.SUBWAY,
          sectionTime: leg.sectionTime,
          distance: leg.distance,
        });
      } else if (mode === 'BUS') {
        steps.push({
          type: 'bus',
          name: routeName || '버스',
          text: `[${routeName}] 버스 (${startName} → ${endName}${stopCount > 0 ? `, ${stopCount}개 정류장` : ''})`,
          color: TMAP_TRANSIT_COLORS.BUS,
          sectionTime: leg.sectionTime,
          distance: leg.distance,
        });
      }
    });

    const transitCount = Math.max(0, steps.filter((s) => s.type !== 'walk').length - 1);

    return { // 객체 반환
      id: `tmap_transit_${idx}`,
      apiSource: 'TMAP (장거리/시외)',
      label: '고속버스/열차 최적',
      totalTime: itinerary.totalTime,
      totalDistance: itinerary.totalDistance,
      tollFee: itinerary.fare?.regular?.totalFare || 0,
      transitCount,
      steps,
      path: allPoints,
      pathSegments,
      rawPath: allPoints.map((pt) => ({ lat: pt.lat(), lng: pt.lng() })),
    };
  });

  return { isAvailable: routes.length > 0, message: '', routes };
}








// 3. 하이브리드 라우터
export async function fetchHybridTransitRouteApi({ startCoord, endCoord }) {
  if (!startCoord || !endCoord) {
    return { isAvailable: false, message: '출발지와 도착지 정보가 부족합니다.', routes: [] };
  }

  // geoUtils의 지점 별 거리 계산 공식을 통한 거리 계산
  const distanceInMeters = getDistanceInMeters(
    startCoord.lat, startCoord.lng,
    endCoord.lat, endCoord.lng
  );

  const isLongDistance = distanceInMeters > TRANSIT_HYBRID_DISTANCE_THRESHOLD; // 거리 제한 상수값(30km)
  const engineType = isLongDistance ? 'TMAP_LONG' : 'ODSAY_SHORT'; // 거리 구분에 따른 API 유형 결정

  // 엔진 종류, 출발/도착 좌표를 이용해 고유의 캐시 키를 만들어 API 토큰 절약
  const cacheKey = `hybrid_transit_v6_${engineType}_${startCoord.lng.toFixed(4)}_${startCoord.lat.toFixed(4)}_${endCoord.lng.toFixed(4)}_${endCoord.lat.toFixed(4)}`;
  
  // 존재하는 캐시라면 값 반환
  const cached = sessionStorage.getItem(cacheKey);
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      parsed.routes.forEach((r) => {
        if (r.pathSegments) {
          r.pathSegments.forEach((seg) => {
            seg.path = seg.rawPath.map((pt) => new window.Tmapv2.LatLng(pt.lat, pt.lng));
          });
        }
        if (r.rawPath) {
          r.path = r.rawPath.map((pt) => new window.Tmapv2.LatLng(pt.lat, pt.lng));
        }
      });
      return parsed;
    } catch {
      // ignore
    }
  }

  try {
    let result;
    // 오디세이나 TMAP 한쪽 탐색 실패시 다른 API로 탐색 재개
    if (isLongDistance) {
      result = await fetchTmapLongDistanceRoute({ startCoord, endCoord });
      if (!result.isAvailable) {
        result = await fetchODsayShortDistanceRoute({ startCoord, endCoord });
      }
    } else {
      result = await fetchODsayShortDistanceRoute({ startCoord, endCoord });
      if (!result.isAvailable) {
        result = await fetchTmapLongDistanceRoute({ startCoord, endCoord });
      }
    }

    // 캐시 저장 및 결과 반환
    if (result.isAvailable) {
      sessionStorage.setItem(cacheKey, JSON.stringify(result));
    }
    return result;
  } catch (err) {
    console.error('[대중교통 통신 오류]:', err);
    return { isAvailable: false, message: '대중교통 정보를 불러오는 중 오류가 발생했습니다.', routes: [] };
  }
}