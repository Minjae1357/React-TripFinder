import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Container, Badge, Button, Spinner, Image } from 'react-bootstrap';
import { getBoard, deleteBoard, toggleLike, getLikeInfo, SERVER_BASE_URL } from '../api';
import { useAuthStore } from '@/store/authStore';
import CommentSection from '../components/CommentSection';

const BoardDetailPage = () => {
    const { boardId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuthStore();

    const [board, setBoard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [likeInfo, setLikeInfo] = useState({ count: 0, liked: false });

    const isWriter = user && board && user.id === board.user?.id;
    const isAdmin = user?.role === 'ADMIN';

    useEffect(() => {
        setLoading(true);
        getBoard(boardId)
            .then((res) => setBoard(res.data))
            .finally(() => setLoading(false));

        getLikeInfo(boardId)
            .then((res) => setLikeInfo(res.data))
            .catch(() => {});
    }, [boardId]);

    const handleDelete = async () => {
        if (!window.confirm('정말 삭제하시겠습니까?')) return;
        try {
            await deleteBoard(boardId);
            navigate('/board');
        } catch (err) {
            alert(err.response?.data?.message || '삭제 권한이 없습니다.');
        }
    };

    const handleLike = async () => {
        try {
            await toggleLike(boardId);
            const res = await getLikeInfo(boardId);
            setLikeInfo(res.data);
        } catch (err) {
            alert('로그인이 필요합니다.');
        }
    };

    if (loading) return <Spinner animation="border" className="m-4" />;
    if (!board) return <Container className="mt-4">게시글을 찾을 수 없습니다.</Container>;

    return (
        <Container style={{ maxWidth: '720px', marginTop: '40px' }}>
            {board.category === 'NOTICE' && <Badge bg="danger" className="mb-2">공지</Badge>}
            <h3>{board.title}</h3>
            <div className="text-muted mb-3" style={{ fontSize: '0.9em' }}>
                {board.user?.nickname} · 조회 {board.hit}
            </div>

            <p style={{ whiteSpace: 'pre-wrap' }}>{board.contents}</p>

            {board.boardImgs?.map((img) => (
                <Image key={img.id} src={`${SERVER_BASE_URL}${img.imgUrl}`} fluid className="mb-2 d-block" />
            ))}

            <div className="d-flex align-items-center gap-2 my-3">
                <Button variant={likeInfo.liked ? 'danger' : 'outline-danger'} size="sm" onClick={handleLike}>
                    ♥ {likeInfo.count}
                </Button>
            </div>

            {(isWriter || isAdmin) && (
                <div className="d-flex gap-2 mb-4">
                    <Link to={`/board/${boardId}/edit`}>
                        <Button variant="outline-secondary" size="sm">수정</Button>
                    </Link>
                    <Button variant="outline-danger" size="sm" onClick={handleDelete}>삭제</Button>
                </div>
            )}
            <CommentSection boardId={boardId} />
        </Container>
    );
};

export default BoardDetailPage;