import { useAuthStore } from '@/store/authStore';
import { Container, Card, Badge, Row, Col } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css'; 
// 가입 방식(provider)에 따라 뱃지 색상/문구를 다르게 보여줌
const providerBadge = {
    local: { label: '이메일 가입', variant: 'secondary' },
    kakao: { label: '카카오', variant: 'warning' },
    naver: { label: '네이버', variant: 'success' },
    google: { label: '구글', variant: 'light' },
};

const ageGroupLabel = {
    '10s': '10대', '20s': '20대', '30s': '30대', '40s': '40대', '50s': '50대 이상',
};

const MyPage = () => {
    const user = useAuthStore((state) => state.user);

    if (!user) {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                <p className="text-muted">로그인 정보가 없습니다.</p>
            </Container>
        );
    }

    const badge = providerBadge[user.provider] || providerBadge.local;

    return (
        <Container style={{ maxWidth: '480px', marginTop: '60px', marginBottom: '60px' }}>
            <Card className="shadow-sm border-0">
                <Card.Body className="p-4">
                    {/* 상단: 아바타 + 닉네임 + 가입방식 뱃지 */}
                    <div className="text-center mb-4">
                        <div
                            className="d-flex align-items-center justify-content-center mx-auto mb-3"
                            style={{
                                width: 72,
                                height: 72,
                                borderRadius: '50%',
                                backgroundColor: '#e9ecef',
                                fontSize: '1.75rem',
                                fontWeight: 600,
                                color: '#495057',
                            }}
                        >
                            {user.nickname?.charAt(0) || '?'}
                        </div>
                        <h4 className="mb-1">{user.nickname}</h4>
                        <Badge bg={badge.variant} text={badge.variant === 'light' ? 'dark' : undefined}>
                            {badge.label}
                        </Badge>
                    </div>

                    <hr />

                    {/* 정보 목록: 라벨-값 2열 배치 */}
                    <Row className="py-2 border-bottom">
                        <Col xs={4} className="text-muted">이메일</Col>
                        <Col xs={8}>{user.loginEmail || '-'}</Col>
                    </Row>
                    <Row className="py-2 border-bottom">
                        <Col xs={4} className="text-muted">거주 지역</Col>
                        <Col xs={8}>{user.location || '미입력'}</Col>
                    </Row>
                    <Row className="py-2 border-bottom">
                        <Col xs={4} className="text-muted">연령대</Col>
                        <Col xs={8}>{ageGroupLabel[user.ageGroup] || '미입력'}</Col>
                    </Row>
                    <Row className="py-2">
                        <Col xs={4} className="text-muted">성별</Col>
                        <Col xs={8}>{user.gender === 0 ? '남성' : user.gender === 1 ? '여성' : '미입력'}</Col>
                    </Row>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default MyPage;