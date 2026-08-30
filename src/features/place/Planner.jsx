/* ==============================================================================
 * [팀원 숙소 예약/결제 페이지 연동 가이드]
 * ------------------------------------------------------------------------------
 * 1. 지도 페이지(Place.jsx) 등에서 넘어올 숙소 데이터 구조:
 *    routePayload.lodging = {
 *      id: "hotel_12345",
 *      name: "유에이치스위트 센트럴서울",
 *      roomType: "디럭스 더블",
 *      pricePerNight: 150000,
 *      checkIn: "2026-08-30",
 *      checkOut: "2026-08-31"
 *    };
 *
 * 2. handleNavigateToBooking 함수에서 팀원이 작업한 결제/예약 라우트 주소(예: '/booking' 또는 '/payment')로
 *    데이터를 state 또는 쿼리 파라미터로 넘겨주면 됩니다.
 * ============================================================================== */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchPoiList } from './services/tmapApi';
import { generateTravelPlanWithGemini } from './services/geminiApi';

const DURATION_OPTIONS = ['당일치기', '1박 2일', '2박 3일', '3박 이상'];
const CAFE_PREFERENCES = ['반드시 포함', '일정 여유 있을 때만', '카페 방문 불필요'];

// 숙소 기본 모델 (전달된 숙소 정보가 없을 때 사용)
const DEFAULT_LODGING_INFO = {
  id: 'default_hotel',
  name: '목적지 추천 베스트 호텔',
  address: '목적지 중심가 인근',
  pricePerNight: 150000, // 1박 기본 기준가
};

// 이동수단 및 거리 기반 왕복 교통비 계산 순수 헬퍼 함수
function calculateTransportCost(routePayload) {
  const oneWayDistanceKm = (routePayload?.selectedRoute?.totalDistance || 0) / 1000;
  const oneWayToll = routePayload?.selectedRoute?.tollFee || 0;
  const mode = routePayload?.transportMode || 'car';

  if (mode === 'walk') {
    return {
      totalTransportCost: 0,
      transportDetailLabel: '도보 이동 (교통비 0원)',
    };
  }

  if (mode === 'car') {
    const fuelCostPerKm = 1650 / 12; // 12km/L, 휘발유 1,650원 기준
    const roundTripFuel = Math.round(oneWayDistanceKm * 2 * fuelCostPerKm);
    const roundTripToll = oneWayToll * 2;
    return {
      totalTransportCost: roundTripFuel + roundTripToll,
      transportDetailLabel: `왕복 자가용 (주유비 ${roundTripFuel.toLocaleString()}원 + 톨비 ${roundTripToll.toLocaleString()}원)`,
    };
  }

  // 대중교통
  if (oneWayDistanceKm < 30) {
    return {
      totalTransportCost: 3000,
      transportDetailLabel: '왕복 시내 대중교통 (지하철/버스)',
    };
  }

  const transitFare = Math.round(oneWayDistanceKm * 2 * 140);
  return {
    totalTransportCost: transitFare,
    transportDetailLabel: `왕복 광역/고속 대중교통 (${Math.round(oneWayDistanceKm * 2)}km)`,
  };
}

export default function Planner() {
  const navigate = useNavigate();

  // 1. 화면 뷰 모드 ('form': 질문 폼, 'result': 플랜 결과 화면)
  const [viewMode, setViewMode] = useState('form');

  // 2. 경로 데이터 로드
  const [routePayload] = useState(() => {
    try {
      const saved = sessionStorage.getItem('tmap_next_payload');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error('데이터 파싱 실패:', e);
      return null;
    }
  });

  // 3. 목적지 주변 식당/관광지 추천 목록
  const [rawRestaurants, setRawRestaurants] = useState([]);
  const [rawSpots, setRawSpots] = useState([]);
  const [restaurantList, setRestaurantList] = useState([]);
  const [spotList, setSpotList] = useState([]);
  const [isLoadingPoi, setIsLoadingPoi] = useState(false);

  // 4. 사용자 단계별 선택 상태
  const [duration, setDuration] = useState('');

  // 식당 다중 선택
  const [selectedFoods, setSelectedFoods] = useState([]);
  const [isFoodCustom, setIsFoodCustom] = useState(false);
  const [customFood, setCustomFood] = useState('');
  const [isFoodNone, setIsFoodNone] = useState(false);

  // 관광지 다중 선택
  const [selectedSpots, setSelectedSpots] = useState([]);
  const [isSpotCustom, setIsSpotCustom] = useState(false);
  const [customSpot, setCustomSpot] = useState('');
  const [isSpotNone, setIsSpotNone] = useState(false);

  const [extraRequirement, setExtraRequirement] = useState('');

  // 5. 상세 설정(모달) 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('20:00');
  const [cafePreference, setCafePreference] = useState('일정 여유 있을 때만');

  // 6. 생성 결과 및 로딩 상태
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState(null);

  // 7. 목적지 주변 POI 20개 조회
  useEffect(() => {
    if (!routePayload?.destination?.lat || !routePayload?.destination?.lng) return;

    const loadNearbyPois = async () => {
      setIsLoadingPoi(true);
      try {
        const lat = routePayload.destination.lat;
        const lng = routePayload.destination.lng;

        const [restaurants, spots] = await Promise.all([
          fetchPoiList({ query: '식당', centerLat: lat, centerLng: lng, searchtypCd: 'R', radius: 3, count: 20 }),
          fetchPoiList({ query: '관광명소', centerLat: lat, centerLng: lng, searchtypCd: 'R', radius: 5, count: 20 }),
        ]);

        setRawRestaurants(restaurants || []);
        setRawSpots(spots || []);

        const formattedRestaurants = (restaurants || [])
          .filter((p) => p.name)
          .slice(0, 10)
          .map((p) => {
            const cat = p.lowerBizName || p.middleBizName || p.bizCategory || '일반';
            return `${p.name} (${cat})`;
          });
        setRestaurantList(
          formattedRestaurants.length > 0
            ? formattedRestaurants
            : ['맛있는식당 (한식)', '골목식당 (분식)', '화덕피자 (양식)', '스시야 (일식)', '중화원 (중식)']
        );

        const formattedSpots = (spots || [])
          .filter((p) => p.name)
          .slice(0, 10)
          .map((p) => {
            const cat = p.lowerBizName || p.middleBizName || '';
            return cat ? `${p.name} (${cat})` : p.name;
          });
        setSpotList(
          formattedSpots.length > 0
            ? formattedSpots
            : ['광안리해수욕장 (해수욕장)', '민락수변공원 (공원)', '광안리M드론라이트쇼 (축제)']
        );
      } catch (err) {
        console.error('주변 시설 로드 실패:', err);
        setRestaurantList(['로컬식당 (한식)', '브런치카페 (양식)', '고기마을 (구이)']);
        setSpotList(['광안리해수욕장', '민락수변공원', '테마거리']);
      } finally {
        setIsLoadingPoi(false);
      }
    };

    loadNearbyPois();
  }, [routePayload]);

  const handleBack = () => navigate(-1);

  // --- [선택 토글 핸들러] ---
  const handleToggleFoodItem = (item) => {
    setIsFoodNone(false);
    setSelectedFoods((prev) =>
      prev.includes(item) ? prev.filter((v) => v !== item) : [...prev, item]
    );
  };

  const handleToggleFoodCustom = () => {
    setIsFoodNone(false);
    setIsFoodCustom((prev) => !prev);
  };

  const handleSelectFoodNone = () => {
    setIsFoodNone(true);
    setSelectedFoods([]);
    setIsFoodCustom(false);
    setCustomFood('');
  };

  const handleToggleSpotItem = (item) => {
    setIsSpotNone(false);
    setSelectedSpots((prev) =>
      prev.includes(item) ? prev.filter((v) => v !== item) : [...prev, item]
    );
  };

  const handleToggleSpotCustom = () => {
    setIsSpotNone(false);
    setIsSpotCustom((prev) => !prev);
  };

  const handleSelectSpotNone = () => {
    setIsSpotNone(true);
    setSelectedSpots([]);
    setIsSpotCustom(false);
    setCustomSpot('');
  };

  // --- [단계 완료 판별] ---
  const isFoodStepCompleted =
    isFoodNone ||
    selectedFoods.length > 0 ||
    (isFoodCustom && customFood.trim().length > 0);

  const isSpotStepCompleted =
    isSpotNone ||
    selectedSpots.length > 0 ||
    (isSpotCustom && customSpot.trim().length > 0);

  // --- [플래너 생성 실행] ---
  const handleGeneratePlan = async () => {
    const finalFoodPreferences = isFoodNone
      ? ['딱히 없음']
      : [
          ...selectedFoods,
          ...(isFoodCustom && customFood.trim() ? [`직접 입력: ${customFood.trim()}`] : []),
        ];

    const finalSpotPreferences = isSpotNone
      ? ['딱히 없음']
      : [
          ...selectedSpots,
          ...(isSpotCustom && customSpot.trim() ? [`직접 입력: ${customSpot.trim()}`] : []),
        ];

    const nearbyRestaurantsData = rawRestaurants.slice(0, 10).map((p) => ({
      name: p.name,
      category: p.lowerBizName || p.middleBizName || p.bizCategory || '식당',
      address: [p.upperAddrName, p.middleAddrName, p.lowerAddrName, p.detailAddrName].filter(Boolean).join(' ') || p.roadName || '',
    }));

    const nearbySpotsData = rawSpots.slice(0, 10).map((p) => ({
      name: p.name,
      category: p.lowerBizName || p.middleBizName || '관광지',
      address: [p.upperAddrName, p.middleAddrName, p.lowerAddrName, p.detailAddrName].filter(Boolean).join(' ') || p.roadName || '',
    }));

    const compiledData = {
      timestamp: new Date().toISOString(),
      routeSummary: {
        start: routePayload?.start,
        destination: routePayload?.destination,
        transportMode: routePayload?.transportMode,
        totalDistanceMeters: routePayload?.selectedRoute?.totalDistance || 0,
        totalTimeSeconds: routePayload?.selectedRoute?.totalTime || 0,
        tollFee: routePayload?.selectedRoute?.tollFee || 0,
      },
      userPreferences: {
        duration,
        foodPreferences: finalFoodPreferences,
        spotPreferences: finalSpotPreferences,
        startTime,
        endTime,
        cafePreference,
        extraRequirement: extraRequirement || '없음',
      },
      nearbyCandidates: {
        restaurants: nearbyRestaurantsData,
        spots: nearbySpotsData,
      },
    };

    setIsGenerating(true);

    try {
      const planResult = await generateTravelPlanWithGemini(compiledData);
      setGeneratedPlan(planResult);
      setViewMode('result');
    } catch (err) {
      console.error('플랜 생성 실패:', err);
      alert(`일정 생성 중 오류가 발생했습니다: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // --- [팀원 숙소 결제/예약창 이동 핸들러] ---
  const handleNavigateToBooking = () => {
    const targetLodging = routePayload?.lodging || {
      ...DEFAULT_LODGING_INFO,
      name: `${routePayload?.destination?.name || '목적지'} 인근 베스트 숙소`,
    };

    console.log('숙소 예약 창으로 넘길 데이터:', targetLodging);
    navigate('/booking', { state: { lodging: targetLodging, routePayload } });
  };

  if (!routePayload) {
    return (
      <div style={{ padding: '30px', textAlign: 'center' }}>
        <p>전달된 경로 데이터가 없습니다. 지도에서 경로를 먼저 검색해 주세요.</p>
        <button onClick={handleBack} style={{ padding: '8px 16px', cursor: 'pointer' }}>지도 화면으로</button>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: 완성된 여행 일정 결과 페이지 뷰
  // =========================================================================
  if (viewMode === 'result' && generatedPlan) {
    // 1. 박 수(Nights) 계산
    const nights = duration === '당일치기' ? 0 : duration === '1박 2일' ? 1 : duration === '2박 3일' ? 2 : 3;

    // 2. 숙소 정보 및 숙박비 계산
    const lodgingInfo = routePayload?.lodging || {
      ...DEFAULT_LODGING_INFO,
      name: `${routePayload?.destination?.name || '목적지'} 인근 베스트 숙소`,
    };
    const totalLodgingCost = nights * (lodgingInfo.pricePerNight || 0);

    // 3. 현지 활동/식사비 계산 (AI 산출)
    const localCost =
      generatedPlan.totalLocalActivityCost ||
      generatedPlan.schedule
        ?.flatMap((d) => d.activities || [])
        .reduce((acc, cur) => acc + (cur.estimatedCost || 0), 0) ||
      0;

    // 4. 이동수단 및 거리 기반 왕복 교통비 계산
    const { totalTransportCost, transportDetailLabel } = calculateTransportCost(routePayload);

    // 5. 종합 총 예상 경비
    const grandTotal = localCost + totalTransportCost + totalLodgingCost;

    return (
      <div style={{ padding: '24px', maxWidth: '640px', margin: '0 auto', textAlign: 'left', fontFamily: 'sans-serif' }}>
        {/* 상단 액션 바 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <button
            onClick={() => setViewMode('form')}
            style={{ padding: '8px 14px', cursor: 'pointer', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '13px' }}
          >
            ← 일정 다시 설정하기
          </button>
          <span style={{ fontSize: '12px', color: '#64748b' }}>생성 완료</span>
        </div>

        {/* 플랜 타이틀 */}
        <h2 style={{ margin: '0 0 6px 0', color: '#0f172a' }}>{generatedPlan.tripTitle}</h2>
        <p style={{ color: '#475569', fontSize: '14px', marginBottom: '20px', lineHeight: '1.5' }}>{generatedPlan.summary}</p>

        {/* 요약 대시보드 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '16px', padding: '16px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '12px', color: '#64748b', display: 'block' }}>여행 기간</span>
            <strong style={{ fontSize: '15px', color: '#1e293b' }}>{duration}</strong>
          </div>
          <div style={{ textAlign: 'center', borderLeft: '1px solid #e2e8f0', borderRight: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '12px', color: '#64748b', display: 'block' }}>편도 소요시간</span>
            <strong style={{ fontSize: '15px', color: '#1e293b' }}>
              {Math.round((routePayload.selectedRoute?.totalTime || 0) / 60)}분
            </strong>
          </div>
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '12px', color: '#64748b', display: 'block' }}>총 예상 경비</span>
            <strong style={{ fontSize: '15px', color: '#2563eb' }}>
              {grandTotal.toLocaleString()}원
            </strong>
          </div>
        </div>

        {/* 상세 비용 분석 브레이크다운 */}
        <div style={{ marginBottom: '24px', padding: '14px 16px', background: '#eff6ff', borderRadius: '8px', fontSize: '13px', color: '#1e3a8a', lineHeight: '1.7' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '6px' }}>📊 예상 경비 상세 내역</div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>• {transportDetailLabel}:</span>
            <strong>{totalTransportCost.toLocaleString()}원</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>• 현지 식사 및 활동비 ({duration}):</span>
            <strong>{localCost.toLocaleString()}원</strong>
          </div>
          {nights > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>• 숙소비 ({lodgingInfo.name} / {nights}박):</span>
              <strong>{totalLodgingCost.toLocaleString()}원</strong>
            </div>
          )}
        </div>

        {/* 일자별 타임라인 */}
        <div style={{ marginBottom: '28px' }}>
          {generatedPlan.schedule?.map((dayPlan) => (
            <div key={dayPlan.day} style={{ marginBottom: '18px', background: '#fff', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <h4 style={{ margin: '0 0 14px 0', color: '#0f172a', borderBottom: '1.5px solid #f1f5f9', paddingBottom: '6px' }}>
                📅 {dayPlan.dateLabel}
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {dayPlan.activities?.map((act, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '14px', fontSize: '13px' }}>
                    <span style={{ fontWeight: 'bold', color: '#2563eb', minWidth: '45px' }}>{act.time}</span>
                    <div>
                      <div>
                        <strong style={{ fontSize: '14px', color: '#1e293b' }}>{act.placeName}</strong>{' '}
                        <span style={{ color: '#64748b', fontSize: '12px' }}>({act.category})</span>
                      </div>
                      <div style={{ color: '#475569', marginTop: '4px', lineHeight: '1.4' }}>{act.description}</div>
                      {act.estimatedCost > 0 && (
                        <div style={{ color: '#059669', fontSize: '12px', marginTop: '3px', fontWeight: '500' }}>
                          예상 비용: {act.estimatedCost.toLocaleString()}원
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* 숙소 예약 이동 버튼 */}
        {nights > 0 && (
          <button
            onClick={handleNavigateToBooking}
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: '10px',
              background: '#1e293b',
              color: '#fff',
              fontSize: '16px',
              fontWeight: 'bold',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
          >
            🏨 숙소 예약하러 가기
          </button>
        )}
      </div>
    );
  }

  // =========================================================================
  // VIEW 1: 플래너 조건 설정 폼 뷰
  // =========================================================================
  return (
    <div style={{ padding: '24px', maxWidth: '640px', margin: '0 auto', textAlign: 'left', fontFamily: 'sans-serif', position: 'relative' }}>
      <button
        onClick={handleBack}
        style={{ padding: '8px 14px', cursor: 'pointer', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', marginBottom: '16px' }}
      >
        ← 지도 화면으로
      </button>

      <h2 style={{ marginBottom: '8px', color: '#0f172a' }}>여행 일정 생성</h2>
      <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>
        목적지 <strong>{routePayload.destination?.name}</strong> 주변 데이터를 바탕으로 최적의 동선을 구성합니다.
      </p>

      {/* Step 1: 여행 기간 */}
      <section style={{ marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #e2e8f0' }}>
        <h4 style={{ margin: '0 0 12px 0', color: '#1e293b' }}>1. 여행 기간을 선택해주세요.</h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {DURATION_OPTIONS.map((item) => (
            <button
              key={item}
              onClick={() => setDuration(item)}
              style={{
                padding: '8px 16px',
                borderRadius: '18px',
                cursor: 'pointer',
                border: duration === item ? '1.5px solid #2563eb' : '1.5px solid #cbd5e1',
                background: duration === item ? '#2563eb' : '#fff',
                color: duration === item ? '#fff' : '#334155',
                fontWeight: '600',
              }}
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      {/* Step 2: 식당 선택 */}
      {duration && (
        <section style={{ marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #e2e8f0' }}>
          <h4 style={{ margin: '0 0 12px 0', color: '#1e293b' }}>2. 꼭 포함하고 싶은 식당이나 메뉴가 있나요?</h4>
          {isLoadingPoi ? (
            <p style={{ fontSize: '13px', color: '#64748b' }}>주변 식당 정보를 불러오는 중...</p>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
              {restaurantList.map((item) => {
                const isSelected = selectedFoods.includes(item);
                return (
                  <button
                    key={item}
                    onClick={() => handleToggleFoodItem(item)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '18px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      border: isSelected ? '1.5px solid #2563eb' : '1.5px solid #cbd5e1',
                      background: isSelected ? '#2563eb' : '#fff',
                      color: isSelected ? '#fff' : '#334155',
                    }}
                  >
                    🍽️ {item}
                  </button>
                );
              })}
              <button
                onClick={handleToggleFoodCustom}
                style={{
                  padding: '8px 14px',
                  borderRadius: '18px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  border: isFoodCustom ? '1.5px solid #2563eb' : '1.5px solid #cbd5e1',
                  background: isFoodCustom ? '#2563eb' : '#fff',
                  color: isFoodCustom ? '#fff' : '#334155',
                }}
              >
                ✏️ 직접 입력
              </button>
              <button
                onClick={handleSelectFoodNone}
                style={{
                  padding: '8px 14px',
                  borderRadius: '18px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  border: isFoodNone ? '1.5px solid #64748b' : '1.5px solid #cbd5e1',
                  background: isFoodNone ? '#64748b' : '#fff',
                  color: isFoodNone ? '#fff' : '#334155',
                }}
              >
                딱히 없음
              </button>
            </div>
          )}
          {isFoodCustom && (
            <input
              type="text"
              placeholder="원하는 메뉴나 식당을 입력하세요"
              value={customFood}
              onChange={(e) => setCustomFood(e.target.value)}
              style={{ width: '100%', boxSizing: 'border-box', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', marginTop: '6px' }}
            />
          )}
        </section>
      )}

      {/* Step 3: 관광지 선택 */}
      {isFoodStepCompleted && (
        <section style={{ marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #e2e8f0' }}>
          <h4 style={{ margin: '0 0 12px 0', color: '#1e293b' }}>3. 꼭 포함하고 싶은 주변 관광지가 있나요?</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
            {spotList.map((item) => {
              const isSelected = selectedSpots.includes(item);
              return (
                <button
                  key={item}
                  onClick={() => handleToggleSpotItem(item)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '18px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    border: isSelected ? '1.5px solid #2563eb' : '1.5px solid #cbd5e1',
                    background: isSelected ? '#2563eb' : '#fff',
                    color: isSelected ? '#fff' : '#334155',
                  }}
                >
                  🎡 {item}
                </button>
              );
            })}
            <button
              onClick={handleToggleSpotCustom}
              style={{
                padding: '8px 14px',
                borderRadius: '18px',
                cursor: 'pointer',
                fontSize: '13px',
                border: isSpotCustom ? '1.5px solid #2563eb' : '1.5px solid #cbd5e1',
                background: isSpotCustom ? '#2563eb' : '#fff',
                color: isSpotCustom ? '#fff' : '#334155',
              }}
            >
              ✏️ 직접 입력
            </button>
            <button
              onClick={handleSelectSpotNone}
              style={{
                padding: '8px 14px',
                borderRadius: '18px',
                cursor: 'pointer',
                fontSize: '13px',
                border: isSpotNone ? '1.5px solid #64748b' : '1.5px solid #cbd5e1',
                background: isSpotNone ? '#64748b' : '#fff',
                color: isSpotNone ? '#fff' : '#334155',
              }}
            >
              딱히 없음
            </button>
          </div>
          {isSpotCustom && (
            <input
              type="text"
              placeholder="원하는 명소를 입력하세요"
              value={customSpot}
              onChange={(e) => setCustomSpot(e.target.value)}
              style={{ width: '100%', boxSizing: 'border-box', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', marginTop: '6px' }}
            />
          )}
        </section>
      )}

      {/* Step 4: 추가 요청사항 & 상세설정 & 생성 버튼 */}
      {isSpotStepCompleted && (
        <section style={{ marginBottom: '24px' }}>
          <h4 style={{ margin: '0 0 12px 0', color: '#1e293b' }}>4. 추가로 넣고 싶은 일정이 있다면 적어주세요. (선택)</h4>
          <textarea
            placeholder="예: 오후 3시쯤 카페에서 쉴 수 있는 시간을 꼭 넣어줘."
            value={extraRequirement}
            onChange={(e) => setExtraRequirement(e.target.value)}
            rows={3}
            style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', resize: 'vertical', marginBottom: '14px' }}
          />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', padding: '10px 14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '13px', color: '#475569' }}>
              <span>⏰ {startTime} ~ {endTime}</span>
              <span style={{ margin: '0 8px' }}>|</span>
              <span>☕ {cafePreference}</span>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                background: '#fff',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '600',
                color: '#1e293b',
              }}
            >
              ⚙️ 추가 설정
            </button>
          </div>

          <button
            onClick={handleGeneratePlan}
            disabled={isGenerating}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '8px',
              background: isGenerating ? '#94a3b8' : '#2563eb',
              color: '#fff',
              fontSize: '16px',
              fontWeight: 'bold',
              border: 'none',
              cursor: isGenerating ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.3)',
            }}
          >
            {isGenerating ? '맞춤 여행 일정을 생성하고 있습니다...' : '여행 일정 생성하기'}
          </button>
        </section>
      )}

      {/* 모달창 */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
          onClick={() => setIsModalOpen(false)}
        >
          <div
            style={{
              background: '#fff',
              padding: '24px',
              borderRadius: '12px',
              width: '90%',
              maxWidth: '400px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 16px 0', color: '#0f172a' }}>⚙️ 추가 상세 설정</h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', fontSize: '13px', color: '#334155' }}>
                  ⏰ 출발 시간
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', fontSize: '13px', color: '#334155' }}>
                  🏁 귀가/도착 시간
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '13px', color: '#334155' }}>
                ☕ 카페 방문 선호도
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {CAFE_PREFERENCES.map((pref) => (
                  <button
                    key={pref}
                    onClick={() => setCafePreference(pref)}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontSize: '13px',
                      border: cafePreference === pref ? '1.5px solid #2563eb' : '1.5px solid #e2e8f0',
                      background: cafePreference === pref ? '#eff6ff' : '#fff',
                      color: cafePreference === pref ? '#1d4ed8' : '#334155',
                      fontWeight: cafePreference === pref ? 'bold' : 'normal',
                    }}
                  >
                    {pref}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setIsModalOpen(false)}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '6px',
                background: '#2563eb',
                color: '#fff',
                fontWeight: 'bold',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              설정 완료
            </button>
          </div>
        </div>
      )}
    </div>
  );
}