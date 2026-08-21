// features/auth/pages/OAuthSuccessPage.jsx
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

function OAuthSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      login(null, token);   // 유저 정보는 나중에 /mypage API로 따로 조회
      navigate('/');
    } else {
      navigate('/login');
    }
  }, []);

  return <p>로그인 처리 중...</p>;
}

export default OAuthSuccessPage;