import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import axiosInstance from '@/api/axiosInstance';
import './LoginPage.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const [form, setForm] = useState({ loginEmail: '', loginPassword: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleNaverSignup = () => {
    window.location.href = 'http://localhost:8080/oauth2/authorization/naver';
  };
  const handleKakaoSignup = () => {
    window.location.href = 'http://localhost:8080/oauth2/authorization/kakao';
  };
  const handleGoogleSignup = () => {
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleLocalLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.loginEmail || !form.loginPassword) {
      setError('이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await axiosInstance.post('/auth/login', form);
      const { accessToken } = res.data;

      login(null, accessToken);

      const meRes = await axiosInstance.get('/auth/me');
      login(meRes.data, accessToken);

      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || '로그인에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-wide-card">
        {/* 상단 공통 타이틀 */}
        <div className="auth-header">
          <span className="auth-logo-icon">✈</span>
          <h1>TripFinder</h1>
          <p>여행의 모든 순간을 함께</p>
        </div>

        {/* 좌우 2분할 레이아웃 */}
        <div className="auth-split-grid">
          {/* [좌측] 일반 이메일 로그인 영역 */}
          <div className="auth-left-pane">
            <h3 className="auth-section-title">이메일 로그인</h3>
            <form className="auth-form" onSubmit={handleLocalLogin}>
              <div className="form-group">
                <label>이메일</label>
                <input
                  type="email"
                  name="loginEmail"
                  placeholder="example@email.com"
                  value={form.loginEmail}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>비밀번호</label>
                <input
                  type="password"
                  name="loginPassword"
                  placeholder="••••••••"
                  value={form.loginPassword}
                  onChange={handleChange}
                  required
                />
              </div>

              {error && <p className="form-error">{error}</p>}

              <button type="submit" className="auth-submit" disabled={submitting}>
                {submitting ? '로그인 중...' : '로그인'}
              </button>
            </form>

            <p className="auth-footer">
              계정이 없으신가요? <Link to="/signup">회원가입</Link>
            </p>
          </div>

          {/* 세로 구분선 */}
          <div className="auth-vertical-divider" />

          {/* [우측] 간편 소셜 로그인 영역 */}
          <div className="auth-right-pane">
            <h3 className="auth-section-title">소셜 로그인</h3>
            <p className="social-desc">소셜 계정으로 간편한 로그인</p>

            <div className="social-buttons">
              {/* 카카오 버튼 */}
              <button
                type="button"
                className="social-btn social-btn--kakao"
                onClick={handleKakaoSignup}
              >
                <svg className="social-svg-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 3C6.48 3 2 6.48 2 10.77c0 2.76 1.83 5.18 4.6 6.54l-1.17 4.29c-.1.37.31.67.64.47l5.12-3.41c.27.02.54.03.81.03 5.52 0 10-3.48 10-7.77C22 6.48 17.52 3 12 3z" />
                </svg>
                <span>카카오톡으로 계속하기</span>
              </button>

              {/* 네이버 버튼 */}
              <button
                type="button"
                className="social-btn social-btn--naver"
                onClick={handleNaverSignup}
              >
                <span className="naver-n-icon">N</span>
                <span>네이버로 계속하기</span>
              </button>

              {/* 구글 버튼 */}
              <button
                type="button"
                className="social-btn social-btn--google"
                onClick={handleGoogleSignup}
              >
                <svg className="social-svg-icon" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Google로 계속하기</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}