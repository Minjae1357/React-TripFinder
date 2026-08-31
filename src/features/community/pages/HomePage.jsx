import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HOME_CONFIG } from '../constants/homeConfig';
import './HomePage.css';

export default function HomePage() {
  const navigate = useNavigate();
  const { hero, featuresSection, placesSection, communitySection, ctaBanner } = HOME_CONFIG;

  // 배경 이미지 롤링 인덱스 상태
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (!hero.bgImages || hero.bgImages.length <= 1) return;

    // 5초(5000ms) 주기로 다음 이미지로 변경
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % hero.bgImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [hero.bgImages]);

  return (
    
    <div className="home-page">
            테스트용 네비 ▼
        <nav>
            <Link to="/signup">회원가입</Link>
            <Link to="/login">로그인</Link>   
            <Link to="/board">커뮤니티</Link>
            <Link to="/accommodation/1"> 숙소 상세 페이지 </Link>
            <Link to="/accommodation/1/review/new"> 숙소 리뷰 작성 페이지 </Link>
            <Link to="/accommodation/1/review/1/edit"> 숙소 리뷰 수정 페이지 </Link>
            <Link to="/cart"> 장바구니 </Link>
            <Link to="/bookings"> 내 예약 목록 </Link>
            <Link to="/recommend"> 숙소 추천 </Link>
        </nav>

      {/* 1. Hero 섹션 (이미지 슬라이드 트랜지션) */}
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
                <span className="feature-icon">{f.icon}</span>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
                <span className="feature-arrow">→</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. 인기 여행지 큐레이션 */}
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
              <div key={place.id} className="place-card" onClick={() => navigate('/place')}>
                <div className="place-img">
                  <img src={place.img} alt={place.name} />
                  <span className="place-tag">{place.tag}</span>
                </div>
                <div className="place-info">
                  <h4>{place.name}</h4>
                  <p>📍 {place.city}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. 커뮤니티 프리뷰 */}
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
            {communitySection.items.map((post) => (
              <div key={post.id} className="post-row" onClick={() => navigate('/board')}>
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
                  <span>❤ {post.likes}</span>
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