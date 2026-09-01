import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBoardList } from '../api';
import { useAuthStore } from '@/store/authStore';
import './BoardListPage.css';

const BoardListPage = () => {
  const { isLoggedIn } = useAuthStore();
  const [category, setCategory] = useState(null); // null=전체, 'NOTICE', 'REVIEW'
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const handleWriteClick = () => {
    if (!isLoggedIn) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }
    navigate('/board/write');
  };

  useEffect(() => {
    setLoading(true);
    getBoardList(category)
      .then((res) => setBoards(res.data))
      .catch(() => setBoards([]))
      .finally(() => setLoading(false));
  }, [category]); // category 바뀔 때마다 다시 조회

  // 클라이언트 검색 필터 (제목 또는 본문 내용 검색)
  const filteredBoards = boards.filter((board) => {
    if (!search.trim()) return true;
    const titleMatch = board.title?.toLowerCase().includes(search.toLowerCase());
    const contentMatch = board.contents?.toLowerCase().includes(search.toLowerCase());
    return titleMatch || contentMatch;
  });

  return (
    <div className="board-page">
      <div className="board-inner">
        {/* 상단 헤더 */}
        <div className="board-header">
          <div>
            <h1>커뮤니티</h1>
            <p>여행자들의 생생한 이야기와 최신 여행 정보를 나눠보세요</p>
          </div>
          <button className="write-btn" onClick={handleWriteClick}>
            글쓰기
          </button>
        </div>

        {/* 카테고리 칩 및 검색 바 */}
        <div className="board-toolbar">
          <div className="category-chips">
            <button
              className={`chip ${category === null ? 'chip--active' : ''}`}
              onClick={() => setCategory(null)}
            >
              전체
            </button>
            <button
              className={`chip ${category === 'NOTICE' ? 'chip--active' : ''}`}
              onClick={() => setCategory('NOTICE')}
            >
              공지
            </button>
            <button
              className={`chip ${category === 'REVIEW' ? 'chip--active' : ''}`}
              onClick={() => setCategory('REVIEW')}
            >
              후기
            </button>
          </div>

          <input
            className="search-input"
            type="text"
            placeholder="게시글 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* 게시글 목록 */}
        <div className="board-list">
          {loading ? (
            <div className="board-loading">
              <div className="board-spinner" />
              <p>게시글을 불러오는 중입니다...</p>
            </div>
          ) : filteredBoards.length === 0 ? (
            <div className="board-empty">
              <span>🔍</span>
              <p>등록된 게시글이 없거나 검색 결과가 없습니다.</p>
            </div>
          ) : (
            filteredBoards.map((board) => (
              <article
                key={board.id}
                className="board-post"
                onClick={() => navigate(`/board/${board.id}`)}
              >
                <div className="post-top">
                  <span className={`post-category ${board.category === 'NOTICE' ? 'cat-notice' : 'cat-review'}`}>
                    {board.category === 'NOTICE' ? '공지사항' : '여행 후기'}
                  </span>
                  <div className="post-stats-row">
                    <span>조회수 {board.hit ?? 0}</span>
                  </div>
                </div>

                <h3>{board.title}</h3>
                {board.contents && (
                  <p className="post-excerpt">{board.contents}</p>
                )}

                <div className="post-footer">
                  <span className="post-author">
                    {board.user?.nickname || board.user?.loginEmail || '익명'}
                  </span>
                  <span className="post-date">
                    {board.createdAt
                      ? board.createdAt.substring(0, 10).replace(/-/g, '.')
                      : '2026.09.01'}
                  </span>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default BoardListPage;