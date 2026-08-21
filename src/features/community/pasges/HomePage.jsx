import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
    return (
        <div>
        <h1>메인페이지</h1>
        <nav>
            <Link to="/signup">회원가입</Link>
            <Link to="/login">로그인</Link>   
        </nav>
        </div>
    );
};

export default HomePage;