import LoginPage from '@/features/auth/pages/LoginPage';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import HomePage from '@/features/community/pages/HomePage';
import SignupPage from '@/features/auth/pages/SignupPage';
import OAuthSuccessPage from '../features/auth/pages/OAuthSuccessPage';
import Header from '../components/Header';
import MyPage from '@/features/auth/pages/MyPage'; 



const AppRouter = () => {
    return (
       <BrowserRouter>
       <Header/>
        <Routes>
            <Route path="/signup" element={<SignupPage/>}/>
            <Route path="/login" element={<LoginPage/>}/>
            <Route path="/" element={<HomePage/>}/>
            <Route path="/oauth2/success" element={<OAuthSuccessPage/>}/>
            <Route path="/mypage" element={<MyPage/>}/>
        </Routes>
       </BrowserRouter>
    );
};

export default AppRouter;