import { Button, Container } from "react-bootstrap";


const LoginPage = () => {
    const handleNaverSignup = () => {
        window.location.href = 'http://localhost:8080/oauth2/authorization/naver';
    };
    const handleKakaoSignup = () => {
        window.location.href = 'http://localhost:8080/oauth2/authorization/kakao';
    };   
    const handleGoogleSignup = () => {
        window.location.href = 'http://localhost:8080/oauth2/authorization/google';
    };

    return (
        <Container>
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