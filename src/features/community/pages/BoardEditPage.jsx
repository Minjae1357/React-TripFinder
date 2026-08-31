import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Spinner } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { getBoard, updateBoard } from '../api';

const BoardEditPage = () => {
    const { boardId } = useParams();
    const navigate = useNavigate();

    const [title, setTitle] = useState('');
    const [contents, setContents] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        getBoard(boardId)
            .then((res) => {
                setTitle(res.data.title);
                setContents(res.data.contents);
            })
            .finally(() => setLoading(false));
    }, [boardId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim() || !contents.trim()) {
            alert('제목과 내용을 입력해주세요.');
            return;
        }
        setSubmitting(true);
        try {
            await updateBoard(boardId, { title, contents });
            navigate(`/board/${boardId}`);
        } catch (err) {
            alert(err.response?.data?.message || '수정 권한이 없습니다.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <Spinner animation="border" className="m-4" />;

    return (
        <Container style={{ maxWidth: '720px', marginTop: '40px' }}>
            <h3 className="mb-4">글 수정</h3>
            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                    <Form.Label>제목</Form.Label>
                    <Form.Control
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>내용</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={8}
                        value={contents}
                        onChange={(e) => setContents(e.target.value)}
                        style={{ resize: 'none' }}
                    />
                </Form.Group>

                <Button type="submit" variant="primary" disabled={submitting}>
                    {submitting ? '수정 중...' : '수정 완료'}
                </Button>
            </Form>
        </Container>
    );
};

export default BoardEditPage;