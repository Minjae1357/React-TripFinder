import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Form, Button, Container, Alert, InputGroup, Row, Col } from 'react-bootstrap';
import axiosInstance from '../../../api/axiosInstance';

function SignupPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

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
  // (provider=local 범위에서만 이메일 유일해야 하므로, 소셜 유저는 이 함수 자체를 타지 않음)
  const handleSendEmail = async () => {
  if (!form.loginEmail) return setError('이메일을 입력해주세요.');
  try {
    setError('');
    // check-email은 예외가 아니라 true/false를 응답으로 줌
    const res = await axiosInstance.post('auth/email-check', { email: form.loginEmail , provider: 'local' });
    const isDuplicate = res.data; // boolean

    if (isDuplicate) {
      setError('이미 사용 중인 이메일입니다.');
      return; // 중복이면 여기서 멈추고 인증번호 발송 안 함
    }

    // 중복 아니면 인증번호 발송
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

  // 클라이언트 단 1차 검증 (로컬 가입일 때만 비밀번호/닉네임 등 검증)
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
      // passwordConfirm은 서버로 보낼 필요 없는 클라이언트 전용 값이라 제외하고 전송
      const { passwordConfirm, ...payload } = form;
      await axiosInstance.post('auth/signup', payload);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || '회원가입 실패');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container style={{ maxWidth: '480px', marginTop: '60px', marginBottom: '60px' }}>
      <h3 className="mb-4">{isSocial ? '소셜 추가 정보 입력' : '회원가입'}</h3>
      {error && <Alert variant="danger">{error}</Alert>}
      {successMsg && <Alert variant="success">{successMsg}</Alert>}

      <Form onSubmit={handleSubmit}>
        {/* 이메일 입력 영역 */}
        <Form.Group className="mb-3">
          <Form.Label>ID (이메일)</Form.Label>
          <InputGroup>
            <Form.Control
              type="email"
              name="loginEmail"
              value={form.loginEmail}
              onChange={handleChange}
              disabled={isEmailVerified && !isSocial}
              placeholder="이메일을 입력해주세요"
              required
            />
            {/* 로컬 가입일 때만 중복확인+인증번호 전송 버튼 표시 */}
            {!isSocial && (
              <Button
                variant="outline-primary"
                onClick={handleSendEmail}
                disabled={isEmailVerified}
              >
                {isEmailSent ? '재전송' : '중복확인 및 인증번호 전송'}
              </Button>
            )}
          </InputGroup>
        </Form.Group>

        {/* 로컬 가입 이메일 인증번호 입력 영역 */}
        {!isSocial && isEmailSent && !isEmailVerified && (
          <Form.Group className="mb-3">
            <Form.Label>인증번호 6자리</Form.Label>
            <InputGroup>
              <Form.Control
                type="text"
                value={emailCode}
                onChange={(e) => setEmailCode(e.target.value)}
                placeholder="인증번호 입력"
              />
              <Button variant="outline-success" onClick={handleVerifyEmail}>
                인증 확인
              </Button>
            </InputGroup>
          </Form.Group>
        )}

        {/* 비밀번호: 소셜 가입은 우리 서비스 비밀번호가 필요 없으므로 필드 자체를 숨김 */}
        {!isSocial && (
          <>
            <Form.Group className="mb-3">
              <Form.Label>비밀번호</Form.Label>
              <Form.Control
                type="password"
                name="loginPassword"
                value={form.loginPassword}
                onChange={handleChange}
                isInvalid={!!fieldErrors.loginPassword}
                placeholder="8자 이상 입력해주세요"
                required
              />
              <Form.Control.Feedback type="invalid">{fieldErrors.loginPassword}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>비밀번호 확인</Form.Label>
              <Form.Control
                type="password"
                name="passwordConfirm"
                value={form.passwordConfirm}
                onChange={handleChange}
                isInvalid={!!fieldErrors.passwordConfirm}
                required
              />
              <Form.Control.Feedback type="invalid">{fieldErrors.passwordConfirm}</Form.Control.Feedback>
            </Form.Group>
          </>
        )}

        {/* 닉네임 */}
        <Form.Group className="mb-3">
          <Form.Label>닉네임</Form.Label>
          <Form.Control
            type="text"
            name="nickname"
            value={form.nickname}
            onChange={handleChange}
            isInvalid={!!fieldErrors.nickname}
            placeholder="다른 사용자에게 보여질 이름"
            required
          />
          <Form.Control.Feedback type="invalid">{fieldErrors.nickname}</Form.Control.Feedback>
        </Form.Group>

        {/* 연령대 / 성별: 테마별 추천 기능에 사용 */}
        <Row className="mb-3">
          <Col>
            <Form.Group>
              <Form.Label>연령대</Form.Label>
              <Form.Select
                name="ageGroup"
                value={form.ageGroup}
                onChange={handleChange}
                isInvalid={!!fieldErrors.ageGroup}
              >
                <option value="">선택</option>
                <option value="10s">10대</option>
                <option value="20s">20대</option>
                <option value="30s">30대</option>
                <option value="40s">40대</option>
                <option value="50s">50대 이상</option>
              </Form.Select>
              <Form.Control.Feedback type="invalid">{fieldErrors.ageGroup}</Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col>
            <Form.Group>
              <Form.Label>성별</Form.Label>
              <Form.Select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                isInvalid={!!fieldErrors.gender}
              >
                <option value="">선택</option>
                <option value="0">남성</option>
                <option value="1">여성</option>
              </Form.Select>
              <Form.Control.Feedback type="invalid">{fieldErrors.gender}</Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Row>

        {/* 거주 지역 (선택 입력) */}
        <Form.Group className="mb-4">
          <Form.Label>거주 지역 (선택)</Form.Label>
          <Form.Control
            type="text"
            name="location"
            value={form.location}
            onChange={handleChange}
            placeholder="예: 서울특별시"
          />
        </Form.Group>

        <Button
          type="submit"
          variant="primary"
          className="w-100"
          disabled={!isEmailVerified || submitting}
        >
          {submitting ? '가입 처리 중...' : '가입하기'}
        </Button>
      </Form>

      {!isSocial && (
        <div className="text-center mt-3">
          <small>
            이미 계정이 있으신가요? <Link to="/login">로그인</Link>
          </small>
        </div>
      )}
    </Container>
  );
}

export default SignupPage;