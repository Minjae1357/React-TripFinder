// 각종 상수
export const APP_KEY = import.meta.env.VITE_TMAP_API_KEY || '';
export const ODSAY_API_KEY = import.meta.env.VITE_ODSAY_API_KEY || '';

export const ODSAY_MAX_ROUTE_COUNT = 1;

export const TRANSIT_HYBRID_DISTANCE_THRESHOLD = 30000; // 시내/시외 구분 거리 (m)

export const SEOUL_CENTER = { lat: 37.566535, lng: 126.977969 }; // 시작 지도 중심
export const DEFAULT_ZOOM = 14;   // 기본 확대 정도
export const MIN_FOCUS_ZOOM = 17;  // 선택시 이 수치보다 낮으면 이 수치까지 확대시킴
export const SEARCH_COUNT = 10; // 검색시 나오는 결과 숫자
export const FIND_RADIUS = 3; // 카테고리 선택시 불러오는 범위 (km)
export const FIND_COUNT = 20; // 카테고리 선택시 가져오는 숫자

export const DEFAULT_START_LOCATION = {
  id: '10486877',
  name: '패스트캠퍼스 구로학원',
  lat: 37.50304313,
  lng: 126.87925408,
};

export const CATEGORIES = [
  { id: 'cafe', label: '카페', icon: '☕' },
  { id: 'restaurant', label: '식당', icon: '🍚' },
  { id: 'parking', label: '주차장', icon: '🅿️' },
  { id: 'convenience', label: '편의점', icon: '🏪' },
  { id: 'hotel', label: '호텔', icon: '🏨' },
  { id: 'tourist', label: '관광명소', icon: '🎡' },
];

// 아래는 지원되는 모든 카테고리 주석화 (필요시 넣으면 자동 반영)

// 1. 생활 / 편의 / 쇼핑
// { id: 'gas_station', label: '주유소', icon: '⛽' },
// { id: 'ev_charging', label: '전기차충전소', icon: '🔋' },
// { id: 'mart', label: '대형마트', icon: '🛒' },
// { id: 'supermarket', label: '슈퍼마켓', icon: '🛍️' },
// { id: 'bakery', label: '베이커리', icon: '🍞' },
// { id: 'laundry', label: '세탁소', icon: '🧺' },
// { id: 'car_wash', label: '세차장', icon: '🚗' },
// { id: 'car_repair', label: '정비소', icon: '🔧' },

// 2. 금융 / 공공기관
// { id: 'bank', label: '은행', icon: '🏦' },
// { id: 'atm', label: 'ATM', icon: '🏧' },
// { id: 'post_office', label: '우체국', icon: '📮' },
// { id: 'police', label: '경찰서', icon: '👮' },
// { id: 'fire_station', label: '소방서', icon: '🚒' },
// { id: 'community_center', label: '주민센터', icon: '🏛️' },

// 3. 의료 / 건강
// { id: 'pharmacy', label: '약국', icon: '💊' },
// { id: 'hospital', label: '병원', icon: '🏥' },
// { id: 'dentist', label: '치과', icon: '🦷' },
// { id: 'animal_hospital', label: '동물병원', icon: '🐾' },

// 4. 문화 / 여가 / 스포츠
// { id: 'cinema', label: '영화관', icon: '🎬' },
// { id: 'park', label: '공원', icon: '🌳' },
// { id: 'fitness', label: '헬스장', icon: '🏋️' },
// { id: 'golf', label: '골프장', icon: '⛳' },
// { id: 'library', label: '도서관', icon: '📚' },

// 5. 교통
// { id: 'subway', label: '지하철역', icon: '🚇' },
// { id: 'bus_terminal', label: '버스터미널', icon: '🚌' },
// { id: 'train_station', label: '기차역', icon: '🚆' },
// { id: 'airport', label: '공항', icon: '✈️' },