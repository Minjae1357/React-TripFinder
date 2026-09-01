import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchAccommodationDetail } from '../api/accommodationApi';
import AccommodationInfo from '../components/AccommodationInfo';
import RoomList from '../components/RoomList';
import AccommodationReviewSection from '../components/AccommodationReviewSection';
import { useAuthStore } from '../../../store/authStore';
import './AccommodationDetailPage.css';

const AccommodationDetailPage = () => {
  const { accommodationId } = useParams();
  const [accommodation, setAccommodation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  const handleCartClick = () => {
    if (!isLoggedIn) {
      if (window.confirm('로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?')) {
        navigate('/login');
      }
      return;
    }
    navigate('/cart');
  };

  useEffect(() => {
    const fetchAccommodation = async () => {
      try {
        const data = await fetchAccommodationDetail(accommodationId);
        setAccommodation(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAccommodation();
  }, [accommodationId]);

  if (loading) {
    return (
      <div className="accommodation-detail-page">
        <div className="detail-state-card">
          <div className="detail-spinner" />
          <p>숙소 상세 정보를 불러오는 중입니다...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="accommodation-detail-page">
        <div className="detail-state-card">
          <span className="state-icon">⚠️</span>
          <p>오류가 발생했습니다: {error}</p>
          <button className="btn-back-action" onClick={() => navigate(-1)}>
            이전으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  if (!accommodation) {
    return (
      <div className="accommodation-detail-page">
        <div className="detail-state-card">
          <span className="state-icon">🏨</span>
          <p>숙소를 찾을 수 없습니다.</p>
          <button className="btn-back-action" onClick={() => navigate('/accommodation')}>
            숙소 목록으로
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="accommodation-detail-page">
      <div className="accommodation-detail-inner">
        {/* 상단 액션 바 (뒤로가기 & 장바구니 버튼) */}
        <div className="detail-nav-bar">
          <button className="btn-back-link" onClick={() => navigate(-1)}>
            ← 뒤로가기
          </button>
          <button className="btn-cart-link" onClick={handleCartClick}>
            내 장바구니
          </button>
        </div>

        {/* 1. 숙소 기본 정보 섹션 */}
        <section className="detail-section-card">
          <AccommodationInfo accommodation={accommodation} />
        </section>

        {/* 2. 객실 목록 섹션 */}
        <section className="detail-section-card">
          <div className="section-title-wrap">
            <h2>객실 선택</h2>
            <p>원하시는 객실 타입을 확인하고 예약해 보세요</p>
          </div>
          <RoomList rooms={accommodation.rooms} />
        </section>

        {/* 3. 리뷰 & 평점 섹션 */}
        <section className="detail-section-card">
          <AccommodationReviewSection accommodationId={accommodationId} />
        </section>
      </div>
    </div>
  );
};

export default AccommodationDetailPage;