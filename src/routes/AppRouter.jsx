import LoginPage from '@/features/auth/pages/LoginPage';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import HomePage from '@/features/community/pasges/HomePage';
import SignupPage from '@/features/auth/pages/SignupPage';
import AccommodationDetailPage from '../features/accommodation/pages/AccommodationDetailPage';
import AccommodationReviewCreatePage from '../features/accommodation/pages/AccommodationReviewCreatePage';

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
        </Routes>
       </BrowserRouter>
    );
};

export default AppRouter;