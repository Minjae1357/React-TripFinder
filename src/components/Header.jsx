import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import axiosInstance from '@/api/axiosInstance';
import myPageIcon from '@/assets/icons/myPageIcon.png';
import './Header.css';

export default function Header() {
  const navigate = useNavigate();
  const { isLoggedIn, user, logout } = useAuthStore();

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

  return (
    <header className="tripfinder-header">
      <div className="header-inner">
        {/* 좌측 로고 (텍스트만) */}
        <Link to="/" className="header-logo">
          <span className="logo-text">TripFinder</span>
        </Link>

        {/* 중앙 메뉴 */}
        <nav className="header-nav">
          <NavLink
            to="/"
            end
            className={({ isActive }) => (isActive ? 'nav-link nav-link--active' : 'nav-link')}
          >
            홈
          </NavLink>
          <NavLink
            to="/place"
            className={({ isActive }) => (isActive ? 'nav-link nav-link--active' : 'nav-link')}
          >
            장소 탐색
          </NavLink>
          <NavLink
            to="/recommend"
            className={({ isActive }) => (isActive ? 'nav-link nav-link--active' : 'nav-link')}
          >
            숙소 추천
          </NavLink>
          <NavLink
            to="/board"
            className={({ isActive }) => (isActive ? 'nav-link nav-link--active' : 'nav-link')}
          >
            커뮤니티
          </NavLink>
        </nav>

        {/* 우측 유저 액션 영역 */}
        <div className="header-actions">
          {isLoggedIn ? (
            <div className="user-profile-group">
              <span className="welcome-text">
                <strong>{user?.nickname || '사용자'}</strong>님 환영합니다
              </span>

              <button onClick={handleLogout} className="btn-ghost">
                로그아웃
              </button>

              <Link to="/mypage" className="mypage-btn" title="마이페이지">
                <img src={myPageIcon} alt="마이페이지" className="mypage-icon" />
              </Link>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn-primary">
                로그인
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}