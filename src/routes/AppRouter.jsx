import LoginPage from '@/features/auth/pages/LoginPage';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import HomePage from '@/features/community/pasges/HomePage';
import SignupPage from '@/features/auth/pages/SignupPage';
import OAuthSuccessPage from '../features/auth/pages/OAuthSuccessPage';

const AppRouter = () => {
    return (
       <BrowserRouter>
        <Routes>
            <Route path="/signup" element={<SignupPage/>}/>
            <Route path="/login" element={<LoginPage/>}/>
            <Route path="/" element={<HomePage/>}/>
            <Route path="/oauth2/success" element={<OAuthSuccessPage/>}/>
        </Routes>
       </BrowserRouter>
    );
};

export default AppRouter;