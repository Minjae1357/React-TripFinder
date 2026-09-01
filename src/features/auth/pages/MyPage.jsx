import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import axiosInstance from '@/api/axiosInstance';
import { MYPAGE_CONFIG } from '../constants/mypageConfig';
import './MyPage.css';

export default function MyPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { defaultTripImg, defaultStats, trips, providerBadge, ageGroupLabel } = MYPAGE_CONFIG;

  const handleLogout = async () => {
    try {
      await axiosInstance.post('/auth/logout');
    } catch (err) {
      console.error(err);
    } finally {
      logout();
      navigate('/');
    }
  };

  // '전체 보기' 및 카드 클릭 시 미구현 알림
  const handleNotImplemented = () => {
    alert('준비 중인 기능입니다.');
  };

  if (!user) {
    return (
      <div className="mypage-empty">
        <p>로그인 정보가 없습니다.</p>
        <button className="text-btn" onClick={() => navigate('/login')}>
          로그인 페이지로 이동 →
        </button>
      </div>
    );
  }

  const badge = providerBadge[user.provider] || providerBadge.local;

  return (
    <div className="mypage">
      <div className="mypage-inner">
        {/* 1. 상단 프로필 카드 */}
        <div className="mypage-profile">
          <div className="profile-avatar">
            {user.nickname?.charAt(0) || 'U'}
          </div>
          <div className="profile-info">
            <div className="profile-name-row">
              <h2>{user.nickname || '사용자'}</h2>
              <span className={`provider-badge ${badge.className}`}>
                {badge.label}
              </span>
            </div>
            <p className="profile-email">{user.loginEmail || '-'}</p>
          </div>
        </div>

        {/* 2. 유저 추가 세부 정보 (연령대, 성별, 거주지역) */}
        <div className="user-detail-card">
          <div className="detail-item">
            <span className="detail-label">거주 지역</span>
            <span className="detail-value">{user.location || '미입력'}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">연령대</span>
            <span className="detail-value">{ageGroupLabel[user.ageGroup] || '미입력'}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">성별</span>
            <span className="detail-value">
              {user.gender === 0 ? '남성' : user.gender === 1 ? '여성' : '미입력'}
            </span>
          </div>
        </div>

        {/* 3. 통계 요약 카드 */}
        <div className="mypage-stats">
          <div className="stat-card">
            <span className="stat-num">{defaultStats.tripCount}</span>
            <span className="stat-label">여행 기록</span>
          </div>
          <div className="stat-card">
            <span className="stat-num">{defaultStats.placeCount}</span>
            <span className="stat-label">방문 장소</span>
          </div>
          <div className="stat-card">
            <span className="stat-num">{defaultStats.postCount}</span>
            <span className="stat-label">작성 게시글</span>
          </div>
        </div>

        {/* 4. 나의 여행 기록 섹션 */}
        <section className="mypage-section">
          <div className="section-header">
            <h3>나의 여행 기록</h3>
            <button className="text-btn" onClick={handleNotImplemented}>
              전체 보기 →
            </button>
          </div>
          <div className="trips-grid">
            {trips.map((trip) => (
              <div key={trip.id} className="trip-card" onClick={handleNotImplemented}>
                <div className="trip-img">
                  <img
                    src={trip.img && trip.img.trim() !== '' ? trip.img : defaultTripImg}
                    alt={trip.title}
                  />
                </div>
                <div className="trip-info">
                  <h4>{trip.title}</h4>
                  <p>{trip.date}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 5. 로그아웃 버튼 */}
        <button className="logout-btn" onClick={handleLogout}>
          로그아웃
        </button>
      </div>
    </div>
  );
}