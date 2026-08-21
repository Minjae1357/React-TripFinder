import LoginPage from '@/features/auth/pages/LoginPage';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import HomePage from '@/features/community/pasges/HomePage';
import SignupPage from '@/features/auth/pages/SignupPage';

const AppRouter = () => {
    return (
       <BrowserRouter>
        <Routes>
            <Route path="/signup" element={<SignupPage/>}/>
            <Route path="/login" element={<LoginPage/>}/>
            <Route path="/" element={<HomePage/>}/>
        </Routes>
       </BrowserRouter>
    );
};

export default AppRouter;