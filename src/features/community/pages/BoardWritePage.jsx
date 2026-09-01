import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { createBoard, uploadImages } from '../api';
import './BoardWritePage.css';

const BoardWritePage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore(); // 로그인한 유저 정보 (ROLE 확인용)
  const isAdmin = user?.role === 'ADMIN'; // 관리자만 공지 카테고리 선택 가능

  const [category, setCategory] = useState('REVIEW'); // 기본값
  const [title, setTtile] = useState('');
  const [contents, setContents] = useState('');
  const [files, setFiles] = useState([]); // 선택된 이미지 파일들
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !contents.trim()) {
      alert('제목과 내용을 입력해주세요.');
      return;
    }
    setSubmitting(true);

    try {
      let imgUrls = [];
      if (files.length > 0) {
        const uploadRes = await uploadImages(files); // 이미지 먼저 업로드
        imgUrls = uploadRes.data; // 업로드된 url 목록
      }

      const res = await createBoard({ category, title, contents, imgUrls });
      const newBoardId = res.data; // 백엔드가 생성된 게시글 id를 리턴받음
      navigate(`/board/${newBoardId}`); // 작성완료후 상세페이지로 이동
    } catch (err) {
      alert(err.response?.data?.message || '작성 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  return (
    <div className="board-write-page">
      <div className="board-write-inner">
        {/* 상단 헤더 */}
        <div className="board-write-header">
          <div>
            <h1>글쓰기</h1>
            <p>여행의 생생한 후기와 나만의 장소 꿀팁을 공유해보세요</p>
          </div>
        </div>

        {/* 작성 폼 카드 */}
        <div className="board-write-card">
          <form onSubmit={handleSubmit}>
            {/* 카테고리 선택 */}
            <div className="form-group">
              <label htmlFor="write-category">카테고리</label>
              <div className="select-wrapper">
                <select
                  id="write-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="REVIEW">여행 후기</option>
                  {isAdmin && <option value="NOTICE">공지사항</option>}
                </select>
              </div>
            </div>

            {/* 제목 입력 */}
            <div className="form-group">
              <label htmlFor="write-title">제목</label>
              <input
                id="write-title"
                type="text"
                value={title}
                onChange={(e) => setTtile(e.target.value)}
                placeholder="제목을 입력하세요"
                maxLength={100}
                required
              />
            </div>

            {/* 내용 입력 */}
            <div className="form-group">
              <label htmlFor="write-contents">내용</label>
              <textarea
                id="write-contents"
                rows={10}
                value={contents}
                onChange={(e) => setContents(e.target.value)}
                placeholder="어떤 여행이었나요? 코스, 숙소, 맛집 정보를 자유롭게 적어주세요."
                required
              />
            </div>

            {/* 사진 첨부 */}
            <div className="form-group">
              <label htmlFor="write-files">사진 첨부</label>
              <div className="file-upload-box">
                <input
                  id="write-files"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                />
                <label htmlFor="write-files" className="file-upload-btn">
                  사진 선택 ({files.length}개 선택됨)
                </label>
                {files.length > 0 && (
                  <div className="file-name-list">
                    {files.map((file, idx) => (
                      <span key={idx} className="file-tag">
                        {file.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 하단 액션 버튼 */}
            <div className="form-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => navigate('/board')}
                disabled={submitting}
              >
                취소
              </button>
              <button
                type="submit"
                className="btn-submit"
                disabled={submitting}
              >
                {submitting ? '등록 중...' : '등록하기'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BoardWritePage;