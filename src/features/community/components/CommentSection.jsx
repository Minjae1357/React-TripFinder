import React, { useState, useEffect } from 'react';
import { Form, Button, ListGroup } from 'react-bootstrap';
import { getComments, createComment, deleteComment, updateComment } from '../api';
import { useAuthStore } from '@/store/authStore';

const CommentSection = ({ boardId }) => {
    const { user, isLoggedIn } = useAuthStore();
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [replyTo, setReplyTo] = useState(null); // 대댓글 대상 댓글 id (null이면 일반 댓글)
    const [editingId, setEditingId] = useState(null); // 지금 수정 중인 댓글 id
    const [editText, setEditText] = useState('');

    const loadComments = () => {
        getComments(boardId).then((res) => setComments(res.data));
    };

    useEffect(() => {
        loadComments();
    }, [boardId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isLoggedIn) {
            alert('로그인이 필요합니다.');
            return;
        }
        if (!newComment.trim()) return;

        try {
            await createComment(boardId, { contents: newComment, parentId: replyTo });
            setNewComment('');
            setReplyTo(null);
            loadComments(); // 작성 후 목록 새로고침
        } catch (err) {
            alert('댓글 작성에 실패했습니다.');
        }
    };

    const handleDelete = async (commentId) => {
        if (!window.confirm('댓글을 삭제하시겠습니까?')) return;
        try {
            await deleteComment(commentId);
            loadComments();
        } catch (err) {
            alert(err.response?.data?.message || '삭제 권한이 없습니다.');
        }
    };

    const handleEditSubmit = async (commentId) => {
        try {
            await updateComment(commentId, { contents: editText });
            setEditingId(null);
            loadComments();
        } catch (err) {
            alert(err.response?.data?.message || '수정 권한이 없습니다.');
        }
    };

    // 일반 댓글(parent 없는 것)만 최상단에 먼저 뽑고, 대댓글은 그 밑에 findAll로 붙임
    const topLevelComments = comments.filter((c) => !c.parent);
    const getReplies = (parentId) => comments.filter((c) => c.parent?.id === parentId);

    const renderComment = (comment, isReply = false) => {
        const isWriter = user && user.id === comment.user?.id;
        const isAdmin = user?.role === 'ADMIN';

        return (
            <ListGroup.Item key={comment.id} style={{ marginLeft: isReply ? '30px' : '0' }}>
                {editingId === comment.id ? (
                    // 수정 모드
                    <div className="d-flex gap-2">
                        <Form.Control
                            size="sm"
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                        />
                        <Button size="sm" onClick={() => handleEditSubmit(comment.id)}>완료</Button>
                        <Button size="sm" variant="secondary" onClick={() => setEditingId(null)}>취소</Button>
                    </div>
                ) : (
                    // 일반 표시 모드
                    <>
                        <div className="d-flex justify-content-between">
                            <span>
                                <strong>{comment.user?.nickname}</strong> {comment.contents}
                            </span>
                            <div className="d-flex gap-2">
                                {!isReply && (
                                    <Button size="sm" variant="link" onClick={() => setReplyTo(comment.id)}>
                                        답글
                                    </Button>
                                )}
                                {(isWriter || isAdmin) && (
                                    <>
                                        <Button
                                            size="sm"
                                            variant="link"
                                            onClick={() => {
                                                setEditingId(comment.id);
                                                setEditText(comment.contents);
                                            }}
                                        >
                                            수정
                                        </Button>
                                        <Button size="sm" variant="link" className="text-danger" onClick={() => handleDelete(comment.id)}>
                                            삭제
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                        {/* 대댓글들 재귀적으로 렌더링 */}
                        {getReplies(comment.id).map((reply) => renderComment(reply, true))}
                    </>
                )}
            </ListGroup.Item>
        );
    };

    return (
        <div className="mt-4">
            <h5>댓글 {comments.length}</h5>
            <ListGroup className="mb-3">
                {topLevelComments.length === 0 && <ListGroup.Item>첫 댓글을 남겨보세요.</ListGroup.Item>}
                {topLevelComments.map((c) => renderComment(c))}
            </ListGroup>

            {replyTo && (
                <div className="text-muted mb-2" style={{ fontSize: '0.85em' }}>
                    답글 작성 중...{' '}
                    <Button size="sm" variant="link" onClick={() => setReplyTo(null)}>취소</Button>
                </div>
            )}

            <Form onSubmit={handleSubmit} className="d-flex gap-2">
                <Form.Control
                    placeholder={isLoggedIn ? '댓글을 입력하세요' : '로그인이 필요합니다'}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    disabled={!isLoggedIn}
                />
                <Button type="submit" disabled={!isLoggedIn}>등록</Button>
            </Form>
        </div>
    );
};

export default CommentSection;