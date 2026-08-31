import { APP_KEY } from '../constants/mapConfig';

// 노이즈 POI 제외 블랙리스트 키워드 목록
const EXCLUDE_POI_KEYWORDS = [
  '주차장',
  '공영주차장',
  '민영주차장',
  '임시주차장',
  '주차타워',
  '안내소',
  '관광안내소',
  '화장실',
  '공중화장실',
  '매표소',
  '출입구',
  '게이트',
  '행사장',
  '관리소',
  '관리사무소',
  '충전소',
  '전기차충전소',
];

export const fetchPoiList = async ({ query, centerLat, centerLng, searchtypCd = 'A', count = 10, radius }) => {
  let url = `https://apis.openapi.sk.com/tmap/pois?version=1` +
            `&searchKeyword=${encodeURIComponent(query)}` + // 키워드
            `&centerLat=${centerLat}` + // 위도
            `&centerLon=${centerLng}` + // 경도
            `&searchtypCd=${searchtypCd}` + // 타입 ( A : 모든 결과, B : 반경 거리 우선)
            `&count=${count}` + // 불러올 갯수
            `&reqCoordType=WGS84GEO` +
            `&resCoordType=WGS84GEO` +
            `&appKey=${APP_KEY}`;

  if (radius) url += `&radius=${radius}`; // 반경

  try {
    const res = await fetch(url);
    if (!res.ok) return []; // 빈 응답이나 오류 시 빈 배열 반환

    const data = await res.json(); // 값 불러오기
    const rawList = data.searchPoiInfo?.pois?.poi || []; // 빈 배열 보장

    return rawList
      // 1. [필터링] 주차장, 안내소 등 노이즈 시설 제거
      .filter((poi) => {
        const name = poi.name || '';
        const lowerCategory = poi.lowerBizName || '';
        const middleCategory = poi.middleBizName || '';
        const fullText = `${name} ${lowerCategory} ${middleCategory}`;

        return !EXCLUDE_POI_KEYWORDS.some((keyword) => fullText.includes(keyword));
      })
      // 2. [가공] 기존 프로젝트 데이터 구조에 맞게 매핑
      .map((poi) => {
        const lat = poi.frontLat || poi.noorLat; // front : 입구 좌표, noor : 건물의 중심 좌표
        const lng = poi.frontLon || poi.noorLon;
        const cleanMiddleBiz = poi.middleBizName ? poi.middleBizName.replace(/\\\//g, '/') : ''; // 업종 중(대)분류
        const cleanLowerBiz = poi.lowerBizName ? poi.lowerBizName.replace(/\\\//g, '/') : ''; // 업종 소분류
        const bizCategory = cleanLowerBiz || cleanMiddleBiz; // 소분류 우선 표기

        // 업체 이름, 좌표, TMAP ID 반환
        return {
          ...poi,
          id: poi.id || poi.poiId,
          bizCategory,
          customId: `${poi.name}_${lat}_${lng}`,
        };
      });
  } catch (err) {
    console.warn('POI 리스트 조회 실패:', err);
    return [];
  }
};

// POI ID 단건 상세 조회 (새로고침 시 ID를 상호명/좌표로 복원할 때 사용)
export const fetchPoiById = async (poiId) => {
  if (!poiId) return null;

  const url = `https://apis.openapi.sk.com/tmap/pois/${poiId}?version=1` +
              `&reqCoordType=WGS84GEO` +
              `&resCoordType=WGS84GEO` +
              `&format=json` +
              `&appKey=${APP_KEY}`;

  try {
    const res = await fetch(url);
    if (!res.ok) return null;

    const data = await res.json();
    const poi = data.poiDetailInfo;
    if (!poi) return null;

    const lat = parseFloat(poi.frontLat || poi.noorLat || poi.lat);
    const lng = parseFloat(poi.frontLon || poi.noorLon || poi.lon);

    return {
      id: String(poiId),
      name: poi.name || '',
      lat,
      lng,
      frontLat: poi.frontLat,
      frontLon: poi.frontLon,
      noorLat: poi.noorLat,
      noorLon: poi.noorLon,
    };
  } catch (err) {
    console.warn('POI ID 조회 실패:', err);
    return null;
  }
};