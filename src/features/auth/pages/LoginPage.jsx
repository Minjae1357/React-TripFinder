import { Alert, Button, Container, Form } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useState } from "react";
import axiosInstance from "@/api/axiosInstance";


const LoginPage = () => {
    const navigate = useNavigate();
    const login = useAuthStore((state) => state.login);

    const [form,setForm] = useState({loginEmail:'', loginPassword:''});
    const [error,setError] = useState('');
    const [submitting,setSubmitting] = useState(false);


    const handleNaverSignup = () => {
        window.location.href = 'http://localhost:8080/oauth2/authorization/naver';
    };
    const handleKakaoSignup = () => {
        window.location.href = 'http://localhost:8080/oauth2/authorization/kakao';
    };   
    const handleGoogleSignup = () => {
        window.location.href = 'http://localhost:8080/oauth2/authorization/google';
    };

    const handleChange = (e) => {
        setForm((prev) => ({...prev,[e.target.name] : e.target.value}))
    }

    const handleLocalLogin = async (e) =>{
        e.preventDefault();
        setError('');
        if(!form.loginEmail || !form.loginPassword){
            setError('이메일과 비밀번호를 모두 입력해주세요.');
            return;
        }
        setSubmitting(true);
        try{
            const res = await axiosInstance.post('/auth/login',form);
            const{accessToken} = res.data;
            login({loginEmail:form.loginEmail},accessToken);
            navigate("/")
        } catch (err) {
            setError(err.response?.data?.error||'로그인에 실패했습니다.');
        } finally {
            setSubmitting(false);
        }
    }
    return (
        <Container style={{maxWidth:"420px" , marginTop:"60px"}}>
            <h3 className="mb-4">로그인</h3>

            {error && <Alert variant="danger">{error}</Alert>}

            <Form onSubmit={handleLocalLogin} className="mb-4">
                <Form.Group className="mb-3">
                    <Form.Label>이메일</Form.Label>
                    <Form.Control
                        type="email"
                        name="loginEmail"
                        value={form.loginEmail}
                        onChange={handleChange}
                        placeholder="이메일을 입력하세요"
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>비밀번호</Form.Label>
                    <Form.Control
                        type="password"
                        name="loginPassword"
                        value={form.loginPassword}
                        onChange={handleChange}
                        placeholder="비밀번호를 입력하세요"
                    />
                </Form.Group>
                <Button type="submit" variant="primary" className="w-100" disabled={submitting}>
                    {submitting ? '로그인 중...' : '로그인'}
                </Button>
            </Form>
            <div className="mb-3 text-center">
                <small>
                    계정이 없으신가요? <Link to="/signup">회원가입</Link>
                </small> 
            </div>
            <Button onClick={handleNaverSignup}>
                네이버로 로그인
            </Button>
            <Button onClick={handleKakaoSignup}>
                카카오로 로그인
            </Button>
            <Button onClick={handleGoogleSignup}>
                구글로 로그인
            </Button>
        </Container>
        
    );
};

export default LoginPage;