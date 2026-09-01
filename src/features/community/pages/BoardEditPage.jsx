import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBoard, updateBoard } from '../api';
import './BoardEditPage.css';

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
      .catch((err) => {
        console.error(err);
        alert('게시글 정보를 불러오지 못했습니다.');
        navigate('/board');
      })
      .finally(() => setLoading(false));
  }, [boardId, navigate]);

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

  if (loading) {
    return (
      <div className="board-edit-page">
        <div className="board-edit-loading">
          <div className="board-edit-spinner" />
          <p>게시글 데이터를 불러오는 중입니다...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="board-edit-page">
      <div className="board-edit-inner">
        {/* 헤더 영역 */}
        <div className="board-edit-header">
          <div>
            <h1>게시글 수정</h1>
            <p>작성하신 여행 이야기나 정보를 수정해 보세요</p>
          </div>
        </div>

        {/* 폼 카드 */}
        <div className="board-edit-card">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="edit-title">제목</label>
              <input
                id="edit-title"
                type="text"
                placeholder="제목을 입력하세요"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="edit-contents">내용</label>
              <textarea
                id="edit-contents"
                rows={10}
                placeholder="여행의 생생한 후기와 정보를 상세히 적어주세요."
                value={contents}
                onChange={(e) => setContents(e.target.value)}
                required
              />
            </div>

            {/* 버튼 그룹 */}
            <div className="form-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => navigate(`/board/${boardId}`)}
                disabled={submitting}
              >
                취소
              </button>
              <button
                type="submit"
                className="btn-submit"
                disabled={submitting}
              >
                {submitting ? '수정 중...' : '수정 완료'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BoardEditPage;