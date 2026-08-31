import LoginPage from '@/features/auth/pages/LoginPage';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import HomePage from '@/features/community/pages/HomePage';
import SignupPage from '@/features/auth/pages/SignupPage';
import OAuthSuccessPage from '@/features/auth/pages/OAuthSuccessPage';
import Header from '@/components/Header';
import MyPage from '@/features/auth/pages/MyPage'; 

import Place from '@/features/place/Place';
import Planner from '@/features/place/Planner';
import BoardListPage from '@/features/community/pages/BoardListPage';
import BoardWritePage from '@/features/community/pages/BoardWritePage';


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
            <Route path="/board" element={<BoardListPage/>}/>
            <Route path="/board/write" element={<BoardWritePage/>}/>

            <Route path="/place" element={<Place />} />
            <Route path="/planner" element={<Planner />} />
            {/* <Route path="/placeinfo/:id" element={} /> */}
        </Routes>
       </BrowserRouter>
    );
};

export default AppRouter;