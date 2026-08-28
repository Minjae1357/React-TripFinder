// features/auth/pages/OAuthSuccessPage.jsx
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import axiosInstance from '../../../api/axiosInstance';

function OAuthSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
     navigate('/login');
     return;
    } 
    login(null, token); // 토큰 저장하고
    axiosInstance.get('/auth/me') // 유저정보 받아서 저장
      .then((res) => {
        login(res.data,token);
        navigate('/'); // 홈으로 이동
      })
  }, []);

  return <p>로그인 처리 중...</p>;
}

export default OAuthSuccessPage;