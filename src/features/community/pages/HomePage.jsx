import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '@/api/axiosInstance';
import { HOME_CONFIG } from '../constants/homeConfig';
import './HomePage.css';

export default function HomePage() {
  const navigate = useNavigate();
  const { hero, featuresSection, placesSection, communitySection, ctaBanner } = HOME_CONFIG;

  // 배경 이미지 롤링 인덱스
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // 실제 게시판 데이터 상태 (초기값은 config의 mock items)
  const [boardList, setBoardList] = useState(communitySection.items);

  // 1. 배경 슬라이더
  useEffect(() => {
    if (!hero.bgImages || hero.bgImages.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % hero.bgImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [hero.bgImages]);

  // 2. 실제 게시판 최신글 목록 API 연동
  useEffect(() => {
    const fetchRecentBoards = async () => {
      try {
        const res = await axiosInstance.get('/board');
        if (Array.isArray(res.data) && res.data.length > 0) {
          // 최신순 정렬 후 상위 3개만 추출하여 화면 규격에 맞게 매핑
          const recentThree = [...res.data]
            .reverse()
            .slice(0, 3)
            .map((item) => ({
              id: item.id,
              title: item.title,
              author: item.user?.nickname || item.user?.loginEmail || '익명',
              date: item.createdAt ? item.createdAt.substring(0, 10).replace(/-/g, '.') : '2026.09.01',
              views: item.hit ?? 0,
            }));
          setBoardList(recentThree);
        }
      } catch (err) {
        console.warn('게시글 목록 조회 실패 (Mock 데이터 유지):', err);
      }
    };

    fetchRecentBoards();
  }, []);

  return (
    <div className="home-page">
      {/* 1. Hero 섹션 */}
      <section className="hero">
        <div className="hero-bg-slider">
          {hero.bgImages.map((imgUrl, index) => (
            <img
              key={imgUrl}
              src={imgUrl}
              alt={`여행 배경 ${index + 1}`}
              className={`hero-bg-img ${index === currentImageIndex ? 'active' : ''}`}
            />
          ))}
          <div className="hero-overlay" />
        </div>

        <div className="hero-content">
          <span className="hero-badge">{hero.badge}</span>
          <h1>
            {hero.titleMain}
            <br />
            {hero.titleSub}
          </h1>
          <p>{hero.description}</p>
          <div className="hero-actions">
            <button className="hero-cta" onClick={() => navigate(hero.ctaPrimary.path)}>
              {hero.ctaPrimary.label}
            </button>
            <button className="hero-cta-outline" onClick={() => navigate(hero.ctaSecondary.path)}>
              {hero.ctaSecondary.label}
            </button>
          </div>
        </div>
      </section>

      {/* 2. 핵심 기능 섹션 */}
      <section className="features-section">
        <div className="section-wrap">
          <div className="section-label">{featuresSection.label}</div>
          <h2>{featuresSection.title}</h2>
          <div className="features-grid">
            {featuresSection.items.map((f) => (
              <div key={f.title} className="feature-card" onClick={() => navigate(f.link)}>
                <div className="feature-icon-wrap">
                  <img src={f.icon} alt={f.title} className="feature-icon-img" />
                </div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
                <span className="feature-arrow">→</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. 인기 여행지 큐레이션 (클릭 시 해당 장소명으로 검색 이동) */}
      <section className="places-section">
        <div className="section-wrap">
          <div className="places-header">
            <div>
              <div className="section-label">{placesSection.label}</div>
              <h2>{placesSection.title}</h2>
            </div>
            <button className="more-btn" onClick={() => navigate('/place')}>
              전체 보기 →
            </button>
          </div>
          <div className="places-grid">
            {placesSection.items.map((place) => (
              <div
                key={place.id}
                className="place-card"
                onClick={() => navigate(`/place?mode=search&q=${encodeURIComponent(place.name)}`)}
              >
                <div className="place-img">
                  <img src={place.img} alt={place.name} />
                  <span className="place-tag">{place.tag}</span>
                </div>
                <div className="place-info">
                  <h4>{place.name}</h4>
                  <p>{place.city}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. 커뮤니티 프리뷰 (실제 API 데이터 연동) */}
      <section className="community-section">
        <div className="section-wrap">
          <div className="places-header">
            <div>
              <div className="section-label">{communitySection.label}</div>
              <h2>{communitySection.title}</h2>
            </div>
            <button className="more-btn" onClick={() => navigate('/board')}>
              전체 보기 →
            </button>
          </div>
          <div className="posts-list">
            {boardList.map((post) => (
              <div
                key={post.id}
                className="post-row"
                onClick={() => navigate(`/board/${post.id}`)}
              >
                <div className="post-main">
                  <h4>{post.title}</h4>
                  <div className="post-meta">
                    <span>{post.author}</span>
                    <span>·</span>
                    <span>{post.date}</span>
                  </div>
                </div>
                <div className="post-stats">
                  <span>👁 {post.views}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. 하단 CTA 배너 */}
      <section className="cta-section">
        <div className="cta-inner">
          <h2>{ctaBanner.title}</h2>
          <p>{ctaBanner.description}</p>
          <button className="cta-btn" onClick={() => navigate(ctaBanner.btnPath)}>
            {ctaBanner.btnLabel}
          </button>
        </div>
      </section>
    </div>
  );
}