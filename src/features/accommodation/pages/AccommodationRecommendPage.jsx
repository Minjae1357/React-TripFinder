import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchRecommendations } from '../api/accommodationApi';
import hotelIcon from '@/assets/icons/hotelIcon.jpeg';
import './AccommodationRecommendPage.css';

const REGIONS = ['서울', '부산', '제주', '강원', '경기', '대전', '대구', '광주', '충북', '충남', '경북', '경남', '전북', '전남'];

const AccommodationRecommendPage = () => {
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSelectRegion = async (region) => {
    setSelectedRegion(region);
    setLoading(true);
    try {
      const data = await fetchRecommendations(region);
      setResults(data || []);
    } catch (err) {
      console.error(err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="recommend-page">
      <div className="recommend-inner">
        {/* 상단 헤더 */}
        <div className="recommend-header">
          <h1>여행 숙소 추천</h1>
          <p>지역을 선택하시면 평점과 리뷰가 검증된 인기 숙소를 추천해 드려요</p>
        </div>

        {/* 지역 선택 칩 리스트 */}
        <div className="region-chips-wrapper">
          <div className="region-chips">
            {REGIONS.map((region) => (
              <button
                key={region}
                className={`region-chip ${selectedRegion === region ? 'region-chip--active' : ''}`}
                onClick={() => handleSelectRegion(region)}
              >
                {region}
              </button>
            ))}
          </div>
        </div>

        {/* 결과 리스트 영역 */}
        <div className="recommend-content">
          {/* 초기 진입 안내 */}
          {!selectedRegion && !loading && (
            <div className="recommend-placeholder">
              <div className="placeholder-icon-wrap">
                <img src={hotelIcon} alt="호텔 아이콘" className="placeholder-hotel-img" />
              </div>
              <p>원하시는 여행 지역을 선택해 보세요!</p>
            </div>
          )}

          {/* 로딩 인디케이터 */}
          {loading && (
            <div className="recommend-loading">
              <div className="recommend-spinner" />
              <p>{selectedRegion} 지역의 추천 숙소를 찾는 중입니다...</p>
            </div>
          )}

          {/* 데이터 없음 */}
          {!loading && selectedRegion && results.length === 0 && (
            <div className="recommend-empty">
              <span>🔍</span>
              <p><strong>{selectedRegion}</strong> 지역에 등록된 숙소가 없습니다.</p>
            </div>
          )}

          {/* 숙소 추천 카드 리스트 */}
          {!loading && results.length > 0 && (
            <div className="recommend-list">
              {results.map((item) => (
                <div
                  key={item.accommodationId}
                  className="hotel-card"
                  onClick={() => navigate(`/accommodation/${item.accommodationId}`)}
                >
                  <div className="hotel-card-body">
                    <div className="hotel-left">
                      <div className="hotel-icon-wrap">
                        <img src={hotelIcon} alt="숙소 아이콘" className="hotel-card-icon" />
                      </div>
                      <div className="hotel-info">
                        <div className="hotel-badges">
                          <span className="hotel-type-badge">{item.accommodationType || '숙소'}</span>
                          <span className="hotel-region-badge">{item.region}</span>
                        </div>
                        <h3 className="hotel-name">{item.accommodationName}</h3>
                      </div>
                    </div>

                    <div className="hotel-rating-box">
                      <div className="star-rating">
                        <span className="star-icon">⭐</span>
                        <span className="star-score">{(item.averageStar ?? 0).toFixed(1)}</span>
                      </div>
                      <span className="review-count">리뷰 {item.reviewCount ?? 0}개</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccommodationRecommendPage;