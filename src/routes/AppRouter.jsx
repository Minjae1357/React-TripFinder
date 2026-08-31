import LoginPage from '@/features/auth/pages/LoginPage';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import HomePage from '@/features/community/pages/HomePage';
import SignupPage from '@/features/auth/pages/SignupPage';
import AccommodationDetailPage from '../features/accommodation/pages/AccommodationDetailPage';
import AccommodationReviewCreatePage from '../features/accommodation/pages/AccommodationReviewCreatePage';
import CartPage from '../features/accommodation/pages/CartPage';
import BookingListPage from '../features/accommodation/pages/BookingListPage';
import BookingDetailPage from '../features/accommodation/pages/BookingDetailPage';
import AccommodationRecommendPage from '../features/accommodation/pages/AccommodationRecommendPage';
import OAuthSuccessPage from '@/features/auth/pages/OAuthSuccessPage';
import Header from '@/components/Header';
import MyPage from '@/features/auth/pages/MyPage'; 

import Place from '@/features/place/Place';
import Planner from '@/features/place/Planner';
import BoardListPage from '@/features/community/pages/BoardListPage';
import BoardWritePage from '@/features/community/pages/BoardWritePage';
import BoardDetailPage from '../features/community/pages/BoardDetailPage';


const AppRouter = () => {
    return (
       <BrowserRouter> 
       <Header/>
        <Routes>
            <Route path="/signup" element={<SignupPage/>}/>
            <Route path="/login" element={<LoginPage/>}/>
            <Route path="/" element={<HomePage/>}/>
        </Routes>
       </BrowserRouter>
    );
};

export default AppRouter;