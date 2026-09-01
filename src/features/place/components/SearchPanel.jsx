import { useEffect, useRef } from 'react';

// 나중에 쓸 코드
// const [placeReviews, setPlaceReviews] = useState({});

//   useEffect(() => {
//     if (!selectedPoiId) return;
//     // 이미 불러온 적 있는 장소 ID라면 API 재호출 방지 (캐싱)
//     if (placeReviews[selectedPoiId]) return;

//     const loadReviews = async () => {
//       try {
//         const res = await fetch(`/api/reviews?place_id=${selectedPoiId}`);
//         if (!res.ok) return;
//         const data = await res.json();
//         setPlaceReviews((prev) => ({ ...prev, [selectedPoiId]: data }));
//       } catch (err) {
//         console.log("리뷰 불러오기 실패:", err);
//       }
//     };

//     loadReviews();
//   }, [selectedPoiId, placeReviews]);
// ==========================================

// 4점 이상 리뷰 우선으로 무작위 최대 count(3)개 뽑는 함수
const getRandomReviews = (reviews, count = 3) => {
  if (!reviews || reviews.length === 0) return [];
  if (reviews.length <= count) return reviews;

  // 1. 4점 이상과 그 외 리뷰 분리
  const highRated = reviews.filter((r) => r.star >= 4);
  const lowRated = reviews.filter((r) => r.star < 4);

  // 2. 무작위 셔플
  const shuffledHigh = [...highRated].sort(() => Math.random() - 0.5);
  const shuffledLow = [...lowRated].sort(() => Math.random() - 0.5);

  // 3. 4점 이상 우선 채우고 모자라면 나머지 리뷰로 채워서 최대 3개 반환
  const combined = [...shuffledHigh, ...shuffledLow];
  return combined.slice(0, count);
};

export default function SearchPanel({
  keyword,
  setKeyword,
  isSearchingRef,
  searchWrapperRef,
  autoCompleteList,
  searchResults,
  selectedPoiId,
  onSearch,
  onFocusPoi,
  onSetStart,
  onSetEnd,
  onPlaceInfo,
}) {
  const itemRefs = useRef({});

  // TMAP ID 우선 추출
  const getPoiKey = (poi) => poi?.id || poi?.poiId;

  // 핀 선택됐을때 컨테이너 찾아 스크롤 (브라우저 window 스크롤 방지: block: 'nearest')
  useEffect(() => {
    if (selectedPoiId && itemRefs.current[selectedPoiId]) {
      itemRefs.current[selectedPoiId].scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest',
      });
    }
  }, [selectedPoiId]);

  // 검색창 입력 후 엔터 누를시 검색
  const handleKeyDown = (e) => {
    if (e.nativeEvent.isComposing) return;
    if (e.key === 'Enter') onSearch();
  };

  // 거리(m)를 거리에 따라 m 유지 혹은 km로 변환
  const formatDistance = (meters) => {
    if (!meters && meters !== 0) return '';
    const num = parseFloat(meters);
    if (isNaN(num)) return '';
    if (num < 1000) return `${Math.round(num)}m`;
    return `${(num / 1000).toFixed(1)}km`;
  };

  return (
    <>
      <div className="search-wrapper" ref={searchWrapperRef}>
        <input
          type="text"
          placeholder="장소, 주소 검색"
          className="search-input"
          value={keyword}
          onChange={(e) => {
            isSearchingRef.current = false;
            setKeyword(e.target.value);
          }}
          onKeyDown={handleKeyDown}
        />

        <button className="search-btn" onClick={() => onSearch()}>
          ➔
        </button>

        {autoCompleteList.length > 0 && (
          <div className="autocomplete-list">
            {autoCompleteList.map((item, index) => (
              <div key={index} className="autocomplete-item" onClick={() => onSearch(item)}>
                <span className="autocomplete-icon">🔍</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {searchResults.length > 0 && (
        <div className="search-results">
          {searchResults.map((poi, index) => {
            const poiKey = getPoiKey(poi);
            const isSelected = selectedPoiId === poiKey;

            const fullAddress = [
              poi.upperAddrName,
              poi.middleAddrName,
              poi.lowerAddrName,
              poi.detailAddrName || (poi.firstNo ? `${poi.firstNo}${poi.secondNo ? '-' + poi.secondNo : ''}` : ''),
            ]
              .filter(Boolean)
              .join(' ');

            const dist = poi.radius ? parseFloat(poi.radius) * 1000 : null;
            const category = poi.bizCategory || poi.bizName || poi.middleBizName || '';

            // const rawReviews = placeReviews[poiKey] || [];
            // 테스트용 더미 리뷰 목록 (4점 이상 및 이하 혼합)
            const dummyReviews = [
              {
                review_id: 101,
                star: 5,
                user_id: 1,
                review_contents: '시설이 아주 깔끔하고 음식도 맛있습니다. 강추합니다!',
                review_img: null,
                tag_id: 1,
                place_id: poiKey,
              },
              {
                review_id: 102,
                star: 4,
                user_id: 2,
                review_contents: '직원분들이 정말 친절하셔서 기분 좋게 이용했어요.',
                review_img: null,
                tag_id: 2,
                place_id: poiKey,
              },
              {
                review_id: 103,
                star: 5,
                user_id: 3,
                review_contents: '분위기도 좋고 주차하기도 편하네요. 재방문 의사 100%!',
                review_img: null,
                tag_id: 1,
                place_id: poiKey,
              },
              {
                review_id: 104,
                star: 3,
                user_id: 4,
                review_contents: '주말이라 사람이 너무 많아서 대기가 좀 길었네요.',
                review_img: null,
                tag_id: 3,
                place_id: poiKey,
              },
              {
                review_id: 105,
                star: 2,
                user_id: 5,
                review_contents: '가격 대비 양이 조금 아쉬웠습니다.',
                review_img: null,
                tag_id: 2,
                place_id: poiKey,
              },
            ];

            // const totalStar = rawReviews.reduce((acc, cur) => acc + cur.star, 0);
            // const avgRating = rawReviews.length > 0 ? (totalStar / rawReviews.length).toFixed(1) : '0.0';
            // const reviewCount = rawReviews.length;
            const totalStar = dummyReviews.reduce((acc, cur) => acc + cur.star, 0);
            const avgRating = dummyReviews.length > 0 ? (totalStar / dummyReviews.length).toFixed(1) : '0.0';
            const reviewCount = dummyReviews.length;

            return (
              <div
                key={`${poiKey}_${index}`}
                ref={(el) => {
                  if (el) itemRefs.current[poiKey] = el;
                  else delete itemRefs.current[poiKey];
                }}
                className={`search-item ${isSelected ? 'active' : ''}`}
                onClick={() => {
                  if (isSelected) {
                    onPlaceInfo(poi);
                  } else {
                    onFocusPoi(poi);
                  }
                }}
              >
                <div className="search-item-header">
                  <span className="search-item-name" title={poi.name}>
                    {poi.name}
                  </span>
                  {category && <span className="search-item-biz">{category}</span>}
                </div>

                <div className="search-item-addr" title={fullAddress || poi.roadName || poi.fullAddress || ''}>
                  {fullAddress || poi.roadName || poi.fullAddress || '주소 정보 없음'}
                </div>

                {(dist || poi.telNo) && (
                  <div className="search-item-subinfo">
                    {dist && <span className="item-dist">{formatDistance(dist)}</span>}
                    {dist && poi.telNo && <span className="item-divider">|</span>}
                    {poi.telNo && <span className="item-tel">{poi.telNo}</span>}
                  </div>
                )}

                {isSelected && (
                  <div className="search-item-detail">
                    <div className="search-item-score">
                      <span>⭐ {avgRating}</span>
                      <span>리뷰 {reviewCount}개</span>
                    </div>

                    {/* 무작위 선별 리뷰 최대 3개 목록 출력 */}
                    <div className="search-item-reviews">
                      {getRandomReviews(dummyReviews, 3).map((review) => (
                        <div key={review.review_id} className="search-item-review">
                          <span className="review-rating">⭐ {review.star}</span>
                          <span className="review-text">{review.review_contents}</span>
                        </div>
                      ))}
                    </div>

                    <div className="search-item-actions">
                      <button
                        className="action-btn-start"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSetStart(poi);
                        }}
                      >
                        출발
                      </button>

                      <button
                        className="action-btn-end"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSetEnd(poi);
                        }}
                      >
                        도착
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}