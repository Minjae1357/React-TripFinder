import React, { useState, useEffect } from 'react';
import { getComments, createComment, deleteComment, updateComment } from '../api';
import { useAuthStore } from '@/store/authStore';
import './CommentSection.css';

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
      <div
        key={comment.id}
        className={`comment-item ${isReply ? 'comment-reply' : ''}`}
      >
        {editingId === comment.id ? (
          // ── 수정 모드 ──
          <div className="comment-edit-box">
            <input
              type="text"
              className="comment-edit-input"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              autoFocus
            />
            <div className="comment-edit-actions">
              <button
                type="button"
                className="btn-comment-save"
                onClick={() => handleEditSubmit(comment.id)}
              >
                완료
              </button>
              <button
                type="button"
                className="btn-comment-cancel"
                onClick={() => setEditingId(null)}
              >
                취소
              </button>
            </div>
          </div>
        ) : (
          // ── 일반 표시 모드 ──
          <div className="comment-body">
            <div className="comment-main-line">
              <div className="comment-user-box">
                <span className="comment-avatar">👤</span>
                <span className="comment-author">
                  {comment.user?.nickname || comment.user?.loginEmail || '익명'}
                </span>
                <span className="comment-text">{comment.contents}</span>
              </div>

              <div className="comment-btn-group">
                {!isReply && (
                  <button
                    type="button"
                    className="btn-text"
                    onClick={() => setReplyTo(comment.id)}
                  >
                    답글
                  </button>
                )}
                {(isWriter || isAdmin) && (
                  <>
                    <button
                      type="button"
                      className="btn-text"
                      onClick={() => {
                        setEditingId(comment.id);
                        setEditText(comment.contents);
                      }}
                    >
                      수정
                    </button>
                    <button
                      type="button"
                      className="btn-text text-danger"
                      onClick={() => handleDelete(comment.id)}
                    >
                      삭제
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* 대댓글 재귀 렌더링 */}
            {getReplies(comment.id).map((reply) => renderComment(reply, true))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="comment-section-wrap">
      <div className="comment-section-header">
        <h4>댓글 <span className="comment-count">{comments.length}</span></h4>
      </div>

      {/* 댓글 목록 리스트 */}
      <div className="comment-list">
        {topLevelComments.length === 0 ? (
          <div className="comment-empty">
            <p>첫 댓글을 남겨 이야기를 이어가 보세요!</p>
          </div>
        ) : (
          topLevelComments.map((c) => renderComment(c))
        )}
      </div>

      {/* 대댓글 작성 알림 바 */}
      {replyTo && (
        <div className="reply-indicator">
          <span>↳ 선택한 댓글에 답글 작성 중</span>
          <button type="button" className="btn-reply-cancel" onClick={() => setReplyTo(null)}>
            취소 ✕
          </button>
        </div>
      )}

      {/* 댓글 작성 폼 */}
      <form onSubmit={handleSubmit} className="comment-form">
        <input
          type="text"
          className="comment-input"
          placeholder={isLoggedIn ? '댓글을 입력하세요...' : '댓글을 작성하려면 로그인이 필요합니다.'}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          disabled={!isLoggedIn}
        />
        <button
          type="submit"
          className="btn-comment-submit"
          disabled={!isLoggedIn || !newComment.trim()}
        >
          등록
        </button>
      </form>
    </div>
  );
};

export default CommentSection;