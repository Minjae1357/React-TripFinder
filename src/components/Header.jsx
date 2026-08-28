import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import axiosInstance from '@/api/axiosInstance';
import myPageIcon from '@/assets/icons/myPageIcon.png';// 마이페이지 아이콘 이미지 경로
import homeIcon from '@/assets/icons/homeIcon.png'; // 홈 아이콘 이미지 경로
const Header = () => {
    const navigate = useNavigate();
    const {isLoggedIn, user, logout} = useAuthStore();

    const handleLogout = async() => {
        try{
            await axiosInstance.post('/auth/logout');
        }catch(err){
            console.error(err);
        } finally{
            logout();
            navigate('/');
        }
    }

    return (
       <header>
            {isLoggedIn ? (
                <>
                <Link to="/">
                <img
                    src={homeIcon}
                    alt="홈"
                    style={{ width: 40, height: 40 }}
                />
                </Link>
                <span>{user?.nickname}님 환영합니다</span>
                <button onClick={handleLogout}>로그아웃</button>
                <Link to="/mypage">
                <img
                    src={myPageIcon}
                    alt="마이페이지"
                    style={{ width: 24, height: 24 }}
                    />
                </Link>
                </>
            ) : (
                <Link to="/login">로그인</Link>
            )
            }
       </header>
    );
};

export default Header;