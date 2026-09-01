import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getBoard, deleteBoard, toggleLike, getLikeInfo, SERVER_BASE_URL } from '../api';
import { useAuthStore } from '@/store/authStore';
import CommentSection from '../components/CommentSection';
import './BoardDetailPage.css';

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
      .catch((err) => console.error(err))
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

  if (loading) {
    return (
      <div className="board-detail-page">
        <div className="board-detail-loading">
          <div className="board-detail-spinner" />
          <p>게시글을 불러오는 중입니다...</p>
        </div>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="board-detail-page">
        <div className="board-detail-empty">
          <span>⚠️</span>
          <p>게시글을 찾을 수 없습니다.</p>
          <button className="btn-back-list" onClick={() => navigate('/board')}>
            목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="board-detail-page">
      <div className="board-detail-inner">
        {/* 상단 네비게이션 액션 */}
        <div className="detail-top-nav">
          <button className="btn-back" onClick={() => navigate('/board')}>
            ← 목록으로
          </button>

          {(isWriter || isAdmin) && (
            <div className="writer-actions">
              <Link to={`/board/${boardId}/edit`} className="btn-edit">
                수정
              </Link>
              <button className="btn-delete" onClick={handleDelete}>
                삭제
              </button>
            </div>
          )}
        </div>

        {/* 게시글 메인 카드 */}
        <article className="board-detail-card">
          {/* 헤더: 카테고리, 제목, 작성자 메타 */}
          <header className="detail-header">
            <div className="detail-meta-top">
              <span className={`post-category ${board.category === 'NOTICE' ? 'cat-notice' : 'cat-review'}`}>
                {board.category === 'NOTICE' ? '공지사항' : '여행 후기'}
              </span>
              <div className="detail-stats">
                <span>조회수 {board.hit ?? 0} </span>
                <span>좋아요 {likeInfo.count}</span>
              </div>
            </div>

            <h1 className="detail-title">{board.title}</h1>

            <div className="detail-author-info">
              <div className="author-profile">
                <span className="author-avatar">👤</span>
                <div>
                  <span className="author-name">
                    {board.user?.nickname || board.user?.loginEmail || '익명'}
                  </span>
                  <span className="post-date">
                    {board.createdAt ? board.createdAt.substring(0, 10).replace(/-/g, '.') : '2026.09.01'}
                  </span>
                </div>
              </div>
            </div>
          </header>

          {/* 본문 내용 */}
          <div className="detail-content">
            <p className="detail-text">{board.contents}</p>

            {/* 첨부 이미지 갤러리 */}
            {board.boardImgs && board.boardImgs.length > 0 && (
              <div className="detail-gallery">
                {board.boardImgs.map((img) => (
                  <div key={img.id} className="gallery-item">
                    <img
                      src={`${SERVER_BASE_URL}${img.imgUrl}`}
                      alt="첨부 이미지"
                      className="detail-img"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 좋아요 버튼 영역 */}
          <div className="detail-reaction-area">
            <button
              className={`like-btn ${likeInfo.liked ? 'liked' : ''}`}
              onClick={handleLike}
            >
              <span className="heart-icon">{likeInfo.liked ? '❤️' : '🤍'}</span>
              <span className="like-text">좋아요</span>
              <span className="like-count">{likeInfo.count}</span>
            </button>
          </div>
        </article>

        {/* 댓글 섹션 */}
        <section className="detail-comment-card">
          <CommentSection boardId={boardId} />
        </section>
      </div>
    </div>
  );
};

export default BoardDetailPage;