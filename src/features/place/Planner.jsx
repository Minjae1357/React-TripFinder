import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchPoiList } from './services/tmapApi';
import { generateTravelPlanWithGemini } from './services/geminiApi';
import './Planner.css';

const DURATION_OPTIONS = ['당일치기', '1박 2일', '2박 3일', '3박 이상'];
const CAFE_PREFERENCES = ['반드시 포함', '일정 여유 있을 때만', '카페 방문 불필요'];

const DEFAULT_LODGING_INFO = {
  id: 'default_hotel',
  name: '목적지 추천 베스트 호텔',
  address: '목적지 중심가 인근',
  pricePerNight: 150000,
};

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
    const fuelCostPerKm = 1650 / 12;
    const roundTripFuel = Math.round(oneWayDistanceKm * 2 * fuelCostPerKm);
    const roundTripToll = oneWayToll * 2;
    return {
      totalTransportCost: roundTripFuel + roundTripToll,
      transportDetailLabel: `왕복 자가용 (주유비 ${roundTripFuel.toLocaleString()}원 + 톨비 ${roundTripToll.toLocaleString()}원)`,
    };
  }

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

  const [viewMode, setViewMode] = useState('form');
  const [routePayload] = useState(() => {
    try {
      const saved = sessionStorage.getItem('tmap_next_payload');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error('데이터 파싱 실패:', e);
      return null;
    }
  });

  const [rawRestaurants, setRawRestaurants] = useState([]);
  const [rawSpots, setRawSpots] = useState([]);
  const [restaurantList, setRestaurantList] = useState([]);
  const [spotList, setSpotList] = useState([]);
  const [isLoadingPoi, setIsLoadingPoi] = useState(false);

  const [duration, setDuration] = useState('');
  const [selectedFoods, setSelectedFoods] = useState([]);
  const [isFoodCustom, setIsFoodCustom] = useState(false);
  const [customFood, setCustomFood] = useState('');
  const [isFoodNone, setIsFoodNone] = useState(false);

  const [selectedSpots, setSelectedSpots] = useState([]);
  const [isSpotCustom, setIsSpotCustom] = useState(false);
  const [customSpot, setCustomSpot] = useState('');
  const [isSpotNone, setIsSpotNone] = useState(false);

  const [extraRequirement, setExtraRequirement] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('20:00');
  const [cafePreference, setCafePreference] = useState('일정 여유 있을 때만');

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState(null);

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

  const isFoodStepCompleted =
    isFoodNone ||
    selectedFoods.length > 0 ||
    (isFoodCustom && customFood.trim().length > 0);

  const isSpotStepCompleted =
    isSpotNone ||
    selectedSpots.length > 0 ||
    (isSpotCustom && customSpot.trim().length > 0);

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
      <div className="planner-empty-box">
        <p>전달된 경로 데이터가 없습니다. 지도에서 경로를 먼저 검색해 주세요.</p>
        <button onClick={handleBack} className="planner-back-btn">지도 화면으로</button>
      </div>
    );
  }

// =========================================================================
  // VIEW 2: 완성된 여행 일정 결과 페이지 뷰 (좌우 2분할)
  // =========================================================================
  if (viewMode === 'result' && generatedPlan) {
    const nights = duration === '당일치기' ? 0 : duration === '1박 2일' ? 1 : duration === '2박 3일' ? 2 : 3;

    const lodgingInfo = routePayload?.lodging || {
      ...DEFAULT_LODGING_INFO,
      name: `${routePayload?.destination?.name || '목적지'} 인근 베스트 숙소`,
    };
    const totalLodgingCost = nights * (lodgingInfo.pricePerNight || 0);

    const localCost =
      generatedPlan.totalLocalActivityCost ||
      generatedPlan.schedule
        ?.flatMap((d) => d.activities || [])
        .reduce((acc, cur) => acc + (cur.estimatedCost || 0), 0) ||
      0;

    const { totalTransportCost, transportDetailLabel } = calculateTransportCost(routePayload);
    const grandTotal = localCost + totalTransportCost + totalLodgingCost;

    return (
      <div className="planner-wide-container">
        {/* 상단 툴바 */}
        <div className="planner-top-actions">
          <button onClick={() => setViewMode('form')} className="planner-back-btn">
            ← 일정 다시 설정하기
          </button>
          <span className="planner-badge-complete">생성 완료</span>
        </div>

        {/* 🔥 좌우 2분할 래퍼 */}
        <div className="planner-split-layout">
          {/* [1] 좌측 패널: 요약 정보 & 경비 분석 & 숙소 예약 */}
          <aside className="planner-left-summary">
            <h2 className="planner-main-title">{generatedPlan.tripTitle}</h2>
            <p className="planner-summary-desc">{generatedPlan.summary}</p>

            <div className="planner-dashboard-grid">
              <div className="dashboard-col">
                <span className="col-label">여행 기간</span>
                <strong className="col-val">{duration}</strong>
              </div>
              <div className="dashboard-col col-divider">
                <span className="col-label">편도 시간</span>
                <strong className="col-val">
                  {Math.round((routePayload.selectedRoute?.totalTime || 0) / 60)}분
                </strong>
              </div>
              <div className="dashboard-col">
                <span className="col-label">총 예상 경비</span>
                <strong className="col-val col-accent">
                  {grandTotal.toLocaleString()}원
                </strong>
              </div>
            </div>

            <div className="planner-cost-box">
              <div className="cost-box-title">📊 예상 경비 상세 내역</div>
              <div className="cost-row">
                <span>• {transportDetailLabel}:</span>
                <strong>{totalTransportCost.toLocaleString()}원</strong>
              </div>
              <div className="cost-row">
                <span>• 현지 식사/활동비 ({duration}):</span>
                <strong>{localCost.toLocaleString()}원</strong>
              </div>
              {nights > 0 && (
                <div className="cost-row">
                  <span>• 숙소비 ({lodgingInfo.name} / {nights}박):</span>
                  <strong>{totalLodgingCost.toLocaleString()}원</strong>
                </div>
              )}
            </div>

            {nights > 0 && (
              <button onClick={handleNavigateToBooking} className="btn-booking-submit">
                🏨 숙소 예약하러 가기
              </button>
            )}
          </aside>

          {/* [2] 우측 패널: 일자별 타임라인 리스트 */}
          <main className="planner-right-timeline">
            {generatedPlan.schedule?.map((dayPlan) => (
              <div key={dayPlan.day} className="timeline-day-card">
                <h4 className="timeline-day-title">
                  📅 {dayPlan.dateLabel}
                </h4>
                <div className="timeline-activity-list">
                  {dayPlan.activities?.map((act, idx) => (
                    <div key={idx} className="timeline-activity-item">
                      <span className="activity-time-badge">{act.time}</span>
                      <div className="activity-info-box">
                        <div className="activity-header">
                          <strong className="activity-name">{act.placeName}</strong>
                          <span className="activity-cat">({act.category})</span>
                        </div>
                        <div className="activity-desc">{act.description}</div>
                        {act.estimatedCost > 0 && (
                          <div className="activity-cost">
                            예상 비용: {act.estimatedCost.toLocaleString()}원
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </main>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 1: 플래너 조건 설정 폼 뷰
  // =========================================================================
  return (
    <div className="planner-form-container">
      <button onClick={handleBack} className="planner-back-btn form-back-btn">
        ← 지도 화면으로
      </button>

      <h2 className="planner-main-title">여행 일정 생성</h2>
      <p className="planner-subtitle-desc">
        목적지 <strong>{routePayload.destination?.name}</strong> 주변 데이터를 바탕으로 최적의 동선을 구성합니다.
      </p>

      {/* Step 1: 여행 기간 */}
      <section className="planner-step-section">
        <h4 className="step-title">1. 여행 기간을 선택해주세요.</h4>
        <div className="step-chip-group">
          {DURATION_OPTIONS.map((item) => (
            <button
              key={item}
              onClick={() => setDuration(item)}
              className={`chip-btn ${duration === item ? 'active' : ''}`}
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      {/* Step 2: 식당 선택 */}
      {duration && (
        <section className="planner-step-section">
          <h4 className="step-title">2. 꼭 포함하고 싶은 식당이나 메뉴가 있나요?</h4>
          {isLoadingPoi ? (
            <p className="loading-poi-text">주변 식당 정보를 불러오는 중...</p>
          ) : (
            <div className="step-chip-group">
              {restaurantList.map((item) => {
                const isSelected = selectedFoods.includes(item);
                return (
                  <button
                    key={item}
                    onClick={() => handleToggleFoodItem(item)}
                    className={`chip-btn ${isSelected ? 'active' : ''}`}
                  >
                    🍽️ {item}
                  </button>
                );
              })}
              <button
                onClick={handleToggleFoodCustom}
                className={`chip-btn ${isFoodCustom ? 'active' : ''}`}
              >
                ✏️ 직접 입력
              </button>
              <button
                onClick={handleSelectFoodNone}
                className={`chip-btn chip-btn-none ${isFoodNone ? 'active' : ''}`}
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
              className="planner-input-field"
            />
          )}
        </section>
      )}

      {/* Step 3: 관광지 선택 */}
      {isFoodStepCompleted && (
        <section className="planner-step-section">
          <h4 className="step-title">3. 꼭 포함하고 싶은 주변 관광지가 있나요?</h4>
          <div className="step-chip-group">
            {spotList.map((item) => {
              const isSelected = selectedSpots.includes(item);
              return (
                <button
                  key={item}
                  onClick={() => handleToggleSpotItem(item)}
                  className={`chip-btn ${isSelected ? 'active' : ''}`}
                >
                  🎡 {item}
                </button>
              );
            })}
            <button
              onClick={handleToggleSpotCustom}
              className={`chip-btn ${isSpotCustom ? 'active' : ''}`}
            >
              ✏️ 직접 입력
            </button>
            <button
              onClick={handleSelectSpotNone}
              className={`chip-btn chip-btn-none ${isSpotNone ? 'active' : ''}`}
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
              className="planner-input-field"
            />
          )}
        </section>
      )}

      {/* Step 4: 추가 요청사항 & 상세설정 & 생성 버튼 */}
      {isSpotStepCompleted && (
        <section className="planner-step-section no-border">
          <h4 className="step-title">4. 추가로 넣고 싶은 일정이 있다면 적어주세요. (선택)</h4>
          <textarea
            placeholder="예: 오후 3시쯤 카페에서 쉴 수 있는 시간을 꼭 넣어줘."
            value={extraRequirement}
            onChange={(e) => setExtraRequirement(e.target.value)}
            rows={3}
            className="planner-textarea"
          />

          <div className="detail-preview-bar">
            <div className="preview-text">
              <span>⏰ {startTime} ~ {endTime}</span>
              <span className="divider">|</span>
              <span>☕ {cafePreference}</span>
            </div>
            <button onClick={() => setIsModalOpen(true)} className="btn-open-modal">
              ⚙️ 추가 설정
            </button>
          </div>

          <button
            onClick={handleGeneratePlan}
            disabled={isGenerating}
            className="btn-plan-generate"
          >
            {isGenerating ? '맞춤 여행 일정을 생성하고 있습니다...' : '여행 일정 생성하기'}
          </button>
        </section>
      )}

      {/* 모달창 */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">⚙️ 추가 상세 설정</h3>

            <div className="modal-time-grid">
              <div>
                <label className="modal-label">⏰ 출발 시간</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="modal-time-input"
                />
              </div>
              <div>
                <label className="modal-label">🏁 귀가/도착 시간</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="modal-time-input"
                />
              </div>
            </div>

            <div className="modal-pref-box">
              <label className="modal-label">☕ 카페 방문 선호도</label>
              <div className="modal-pref-list">
                {CAFE_PREFERENCES.map((pref) => (
                  <button
                    key={pref}
                    onClick={() => setCafePreference(pref)}
                    className={`modal-pref-btn ${cafePreference === pref ? 'active' : ''}`}
                  >
                    {pref}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={() => setIsModalOpen(false)} className="modal-submit-btn">
              설정 완료
            </button>
          </div>
        </div>
      )}
    </div>
  );
}