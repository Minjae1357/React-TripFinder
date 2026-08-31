import LoginPage from '@/features/auth/pages/LoginPage';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import HomePage from '@/features/community/pasges/HomePage';
import SignupPage from '@/features/auth/pages/SignupPage';
import AccommodationDetailPage from '../features/accommodation/pages/AccommodationDetailPage';
import AccommodationReviewCreatePage from '../features/accommodation/pages/AccommodationReviewCreatePage';
import CartPage from '../features/accommodation/pages/CartPage';
import BookingListPage from '../features/accommodation/pages/BookingListPage';
import BookingDetailPage from '../features/accommodation/pages/BookingDetailPage';
import AccommodationRecommendPage from '../features/accommodation/pages/AccommodationRecommendPage';

const AppRouter = () => {
    return (
       <BrowserRouter>
        <Routes>
            <Route path="/signup" element={<SignupPage/>}/>
            <Route path="/login" element={<LoginPage/>}/>
            <Route path="/" element={<HomePage/>}/>
            <Route path="/accommodation/:accommodationId" element={<AccommodationDetailPage/>}/>
            <Route path="/accommodation/:accommodationId/review/new" element={<AccommodationReviewCreatePage/>}/>
            <Route path="/accommodation/:accommodationId/review/:reviewId/edit" element={<AccommodationReviewCreatePage/>}/>
            <Route path="/cart" element={<CartPage/>}/>
            <Route path="/bookings" element={<BookingListPage/>}/>
            <Route path="/bookings/:bookingId" element={<BookingDetailPage/>}/>
            <Route path="recommend" element={<AccommodationRecommendPage/>}/>
        </Routes>
       </BrowserRouter>
    );
};

export default AppRouter;