import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
    return (
        <div>
        <h1>메인페이지</h1>
        <nav>
            <Link to="/signup">회원가입</Link>
            <Link to="/login">로그인</Link>   
            <Link to="/board">커뮤니티</Link>
            <Link to="/signup"> 회원가입 </Link>
            <Link to="/login"> 로그인 </Link>   
            <Link to="/accommodation/1"> 숙소 상세 페이지 </Link>
            <Link to="/accommodation/1/review/new"> 숙소 리뷰 작성 페이지 </Link>
            <Link to="/accommodation/1/review/1/edit"> 숙소 리뷰 수정 페이지 </Link>
            <Link to="/cart"> 장바구니 </Link>
            <Link to="/bookings"> 내 예약 목록 </Link>
            <Link to="/recommend"> 숙소 추천 </Link>
        </nav>
        </div>
    );
};

export default HomePage;