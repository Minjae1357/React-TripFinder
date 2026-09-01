import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../../../api/axiosInstance';
import { useAuthStore } from "@/store/authStore";
import './SignupPage.css';

function SignupPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login); 
  
  // URL 파라미터에서 소셜 정보 추출 (예: /signup?email=test@kakao.com&social=true&provider=KAKAO&socialUid=xxx)
  const socialEmail = searchParams.get('email');
  const isSocial = searchParams.get('social') === 'true';
  const socialUid = searchParams.get('socialUid');

  const [form, setForm] = useState({
    loginEmail: '',
    loginPassword: '',
    passwordConfirm: '',
    nickname: '',
    location: '',
    ageGroup: '',
    gender: '',
    provider: 'local',
    socialUid: '',
  });

  const [emailCode, setEmailCode] = useState('');
  const [isEmailSent, setIsEmailSent] = useState(false);
  // 소셜 유저라면 처음부터 이메일 인증 완료 상태(true)로 세팅
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  const [fieldErrors, setFieldErrors] = useState({}); // 클라이언트 단 필드별 검증 에러
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // 컴포넌트 마운트 시 소셜 정보가 있으면 폼에 채워넣기
  useEffect(() => {
    if (isSocial && socialEmail) {
      setForm((prev) => ({
        ...prev,
        loginEmail: socialEmail,
        provider: searchParams.get('provider') || 'SOCIAL', // KAKAO, NAVER 등
        socialUid: socialUid || '',
      }));
      setIsEmailVerified(true); // 소셜은 이메일 인증 자동 패스 (중복확인도 불필요)
    }
  }, [isSocial, socialEmail, socialUid]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: '' }));
  };

  // 로컬 가입 전용: 이메일 중복확인 → 통과하면 인증번호 발송까지 이어서 처리
  const handleSendEmail = async () => {
    if (!form.loginEmail) return setError('이메일을 입력해주세요.');
    try {
      setError('');
      const res = await axiosInstance.post('auth/email-check', { email: form.loginEmail, provider: 'local' });
      const isDuplicate = res.data;

      if (isDuplicate) {
        setError('이미 사용 중인 이메일입니다.');
        return;
      }

      await axiosInstance.post('auth/email-send', { email: form.loginEmail });
      setIsEmailSent(true);
      setSuccessMsg('인증번호가 발송되었습니다.');
    } catch (err) {
      setError(err.response?.data?.error || '처리 중 오류가 발생했습니다.');
    }
  };

  // 일반 이메일 인증번호 확인
  const handleVerifyEmail = async () => {
    try {
      setError('');
      await axiosInstance.post('auth/email-verify', {
        email: form.loginEmail,
        code: emailCode,
      });
      setIsEmailVerified(true);
      setSuccessMsg('이메일 인증이 완료되었습니다.');
    } catch (err) {
      setError(err.response?.data?.error || '인증번호 불일치');
    }
  };

  // 클라이언트 단 1차 검증
  const validate = () => {
    const next = {};

    if (!isSocial) {
      if (form.loginPassword.length < 8) next.loginPassword = '비밀번호는 8자 이상이어야 합니다.';
      if (form.loginPassword !== form.passwordConfirm) next.passwordConfirm = '비밀번호가 일치하지 않습니다.';
    }

    if (!form.nickname.trim()) next.nickname = '닉네임을 입력해주세요.';
    else if (form.nickname.trim().length > 12) next.nickname = '닉네임은 12자 이하로 입력해주세요.';

    if (!form.ageGroup) next.ageGroup = '연령대를 선택해주세요.';
    if (!form.gender) next.gender = '성별을 선택해주세요.';

    setFieldErrors(next);
    return Object.keys(next).length === 0;
  };

  // 회원가입 제출
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isEmailVerified) {
      setError('이메일 인증을 먼저 완료해주세요.');
      return;
    }
    if (!validate()) return;

    setSubmitting(true);
    try {
      const { passwordConfirm, ...payload } = form;
      const res = await axiosInstance.post('auth/signup', payload);
      if (isSocial) {
        const [accessToken] = res.data;
        login({ loginEmail: form.loginEmail }, accessToken);
        alert("소셜 회원가입이 완료되었습니다. 소셜 로그인을 이용해주세요.");
      } 
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || '회원가입 실패');
    } finally {
      setSubmitting(false);
    }
  };

  // -------------------------------------------------------------
  // UI 렌더링 (TripFinder 디자인 시스템 적용)
  // -------------------------------------------------------------
  return (
    <div className="auth-page">
      <div className="signup-card">
        {/* 상단 헤더 */}
        <div className="auth-header">
          <span className="auth-logo-icon">✈</span>
          <h1>TripFinder</h1>
          <p>{isSocial ? '추가 정보 입력 후 가입 완료' : 'TripFinder와 함께 여행을 시작하세요'}</p>
        </div>

        {/* 전역 알림 메시지 */}
        {error && <div className="auth-alert alert-danger">{error}</div>}
        {successMsg && <div className="auth-alert alert-success">{successMsg}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          {/* 1. 이메일 (ID) & 인증 발송 */}
          <div className="form-group">
            <label>이메일 계정</label>
            <div className="input-with-action">
              <input
                type="email"
                name="loginEmail"
                value={form.loginEmail}
                onChange={handleChange}
                disabled={isEmailVerified && !isSocial}
                placeholder="example@email.com"
                required
              />
              {!isSocial && (
                <button
                  type="button"
                  className="btn-form-action"
                  onClick={handleSendEmail}
                  disabled={isEmailVerified}
                >
                  {isEmailSent ? '재전송' : '인증 요청'}
                </button>
              )}
            </div>
          </div>

          {/* 2. 이메일 인증번호 확인 */}
          {!isSocial && isEmailSent && !isEmailVerified && (
            <div className="form-group verify-group">
              <label>인증번호 6자리</label>
              <div className="input-with-action">
                <input
                  type="text"
                  value={emailCode}
                  onChange={(e) => setEmailCode(e.target.value)}
                  placeholder="인증번호 입력"
                />
                <button
                  type="button"
                  className="btn-form-action btn-action-success"
                  onClick={handleVerifyEmail}
                >
                  인증 확인
                </button>
              </div>
            </div>
          )}

          {/* 3. 비밀번호 (소셜 가입 시 숨김) */}
          {!isSocial && (
            <>
              <div className="form-group">
                <label>비밀번호</label>
                <input
                  type="password"
                  name="loginPassword"
                  value={form.loginPassword}
                  onChange={handleChange}
                  placeholder="8자 이상 입력해주세요"
                  className={fieldErrors.loginPassword ? 'input-error' : ''}
                  required
                />
                {fieldErrors.loginPassword && (
                  <span className="field-error-text">{fieldErrors.loginPassword}</span>
                )}
              </div>

              <div className="form-group">
                <label>비밀번호 확인</label>
                <input
                  type="password"
                  name="passwordConfirm"
                  value={form.passwordConfirm}
                  onChange={handleChange}
                  placeholder="비밀번호를 한 번 더 입력해주세요"
                  className={fieldErrors.passwordConfirm ? 'input-error' : ''}
                  required
                />
                {fieldErrors.passwordConfirm && (
                  <span className="field-error-text">{fieldErrors.passwordConfirm}</span>
                )}
              </div>
            </>
          )}

          {/* 4. 닉네임 */}
          <div className="form-group">
            <label>닉네임</label>
            <input
              type="text"
              name="nickname"
              value={form.nickname}
              onChange={handleChange}
              placeholder="서비스 내 표시될 이름 (12자 이하)"
              className={fieldErrors.nickname ? 'input-error' : ''}
              required
            />
            {fieldErrors.nickname && (
              <span className="field-error-text">{fieldErrors.nickname}</span>
            )}
          </div>

          {/* 5. 연령대 & 성별 2열 그리드 */}
          <div className="form-row-grid">
            <div className="form-group">
              <label>연령대</label>
              <select
                name="ageGroup"
                value={form.ageGroup}
                onChange={handleChange}
                className={fieldErrors.ageGroup ? 'input-error' : ''}
              >
                <option value="">선택</option>
                <option value="10s">10대</option>
                <option value="20s">20대</option>
                <option value="30s">30대</option>
                <option value="40s">40대</option>
                <option value="50s">50대 이상</option>
              </select>
              {fieldErrors.ageGroup && (
                <span className="field-error-text">{fieldErrors.ageGroup}</span>
              )}
            </div>

            <div className="form-group">
              <label>성별</label>
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className={fieldErrors.gender ? 'input-error' : ''}
              >
                <option value="">선택</option>
                <option value="0">남성</option>
                <option value="1">여성</option>
              </select>
              {fieldErrors.gender && (
                <span className="field-error-text">{fieldErrors.gender}</span>
              )}
            </div>
          </div>

          {/* 6. 거주 지역 (선택) */}
          <div className="form-group">
            <label>거주 지역 (선택)</label>
            <input
              type="text"
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="예: 서울특별시 마포구"
            />
          </div>

          {/* 가입 완료 버튼 */}
          <button
            type="submit"
            className="auth-submit"
            disabled={!isEmailVerified || submitting}
          >
            {submitting ? '가입 처리 중...' : (isSocial ? '소셜 가입 완료하기' : '회원가입 완료')}
          </button>
        </form>

        {/* 하단 로그인 링크 */}
        {!isSocial && (
          <p className="auth-footer">
            이미 계정이 있으신가요? <Link to="/login">로그인</Link>
          </p>
        )}
      </div>
    </div>
  );
}

export default SignupPage;