import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Form, Button, Container, Alert, InputGroup } from 'react-bootstrap';
import axiosInstance from '../../../api/axiosInstance';

function SignupPage() {
  const [searchParams] = useSearchParams();

  // URL 파라미터에서 소셜 정보 추출 (예: /signup?email=test@kakao.com&social=true)
  const socialEmail = searchParams.get('email');
  const isSocial = searchParams.get('social') === 'true';

  const [form, setForm] = useState({
    loginEmail: '',
    loginPassword: '',
    nickname: '',
    location: '',
    ageGroup: '',
    gender: '',
    provider: 'LOCAL', // 기본값: 일반 가입
  });

  const [emailCode, setEmailCode] = useState('');
  const [isEmailSent, setIsEmailSent] = useState(false);
  // 소셜 유저라면 처음부터 이메일 인증 완료 상태(true)로 세팅
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // 컴포넌트 마운트 시 소셜 정보가 있으면 폼에 채워넣기
  useEffect(() => {
    if (isSocial && socialEmail) {
      setForm((prev) => ({
        ...prev,
        loginEmail: socialEmail,
        provider: searchParams.get('provider') || 'SOCIAL', // KAKAO, GOOGLE 등
      }));
      setIsEmailVerified(true); // 소셜은 이메일 인증 자동 패스
    }
  }, [isSocial, socialEmail]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });  
  };

  // 일반 이메일 인증번호 발송
  const handleSendEmail = async () => {
    if (!form.loginEmail) return setError('이메일을 입력해주세요.');
    try {
      setError('');
      await axiosInstance.post('auth/email-send', { email: form.loginEmail });
      setIsEmailSent(true);
      setSuccessMsg('인증번호가 발송되었습니다.');
    } catch (err) {
      setError(err.response?.data?.error || '발송 실패');
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

  // 회원가입 제출
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isEmailVerified) {
      setError('이메일 인증을 먼저 완료해주세요.');
      return;
    }

    try {
      setError('');
      await axiosInstance.post('auth/signup', form);
      alert('회원가입 성공! 로그인해주세요.');
    } catch (err) {
      setError(err.response?.data?.error || '회원가입 실패');
    }
  };

  return (
    <Container style={{ maxWidth: '480px', marginTop: '60px' }}>
      <h3 className="mb-4">{isSocial ? '소셜 추가 정보 입력' : '회원가입'}</h3>
      {error && <Alert variant="danger">{error}</Alert>}
      {successMsg && <Alert variant="success">{successMsg}</Alert>}

      <Form onSubmit={handleSubmit}>
        {/* 이메일 입력 영역 */}
        <Form.Group className="mb-3">
          <Form.Label>이메일</Form.Label>
          <InputGroup>
            <Form.Control
              type="email"
              name="loginEmail"
              value={form.loginEmail}
              onChange={handleChange}
              readOnly={isSocial} // 소셜 계정은 이메일 수정 불가
              disabled={isEmailVerified && !isSocial}
              required
            />
            {/* 일반 가입일 때만 인증번호 전송 버튼 표시 */}
            {!isSocial && (
              <Button
                variant="outline-primary"
                onClick={handleSendEmail}
                disabled={isEmailVerified}
              >
                {isEmailSent ? '재전송' : '인증번호 전송'}
              </Button>
            )}
          </InputGroup>
        </Form.Group>

        {/* 일반 가입 이메일 인증번호 입력 영역 */}
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

        {/* 비밀번호 (소셜 가입은 임의값 지정 또는 숨김 가능) */}
        <Form.Group className="mb-3">
          <Form.Label>비밀번호</Form.Label>
          <Form.Control
            type="password"
            name="loginPassword"
            value={form.loginPassword}
            onChange={handleChange}
            required
          />
        </Form.Group>

        {/* 나머지 직접 입력 항목들 */}
        <Form.Group className="mb-3">
          <Form.Label>닉네임</Form.Label>
          <Form.Control
            type="text"
            name="nickname"
            value={form.nickname}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>거주 지역 (선택)</Form.Label>
          <Form.Control
            type="text"
            name="location"
            value={form.location}
            onChange={handleChange}
          />
        </Form.Group>

        <Button
          type="submit"
          variant="primary"
          className="w-100"
          disabled={!isEmailVerified}
        >
          가입하기
        </Button>
      </Form>
    </Container>
  );
}

export default SignupPage;