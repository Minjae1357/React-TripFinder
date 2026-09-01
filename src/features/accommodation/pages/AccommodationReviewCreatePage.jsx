import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createReview, fetchOneAccommodationReview, updateReview } from '../api/accommodationReviewApi';
import StarRatingInput from '../components/StarRatingInput';
import './AccommodationReviewCreatePage.css';

const AccommodationReviewCreatePage = () => {
  const { accommodationId, reviewId } = useParams(); // reviewId가 있으면 수정 모드, 없으면 작성 모드
  const navigate = useNavigate();
  const isEditMode = !!reviewId; // reviewId가 존재하면 수정 모드로 간주

  const [star, setStar] = useState(5);
  const [reviewContents, setReviewContents] = useState('');
  const [imageFiles, setImageFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(isEditMode); // 수정 모드일 때 기존 리뷰 데이터를 불러오기 위해 로딩 상태를 추가
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isEditMode) return; // 작성 모드이면 기존 리뷰 데이터를 불러올 필요 없음
    fetchOneAccommodationReview(accommodationId, reviewId)
      .then((data) => {
        setStar(data.star);
        setReviewContents(data.reviewContents);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [accommodationId, reviewId, isEditMode]);

  const handleFileChange = (e) => {
    setImageFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (isEditMode) {
        // 수정 모드일 때는 updateReview API 호출
        await updateReview(accommodationId, reviewId, star, reviewContents);
      } else {
        // 작성 모드일 때는 createReview API 호출
        await createReview(accommodationId, star, reviewContents, imageFiles);
      }
      navigate(`/accommodation/${accommodationId}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="review-create-page">
        <div className="review-state-card">
          <div className="review-spinner" />
          <p>리뷰 데이터를 불러오는 중입니다...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="review-create-page">
      <div className="review-create-inner">
        {/* 상단 헤더 */}
        <div className="review-create-header">
          <button className="btn-back-link" onClick={() => navigate(-1)}>
            ← 뒤로가기
          </button>
          <h1>{isEditMode ? '리뷰 수정' : '리뷰 작성'}</h1>
          <p>숙소에서의 솔직한 경험과 소중한 후기를 남겨주세요</p>
        </div>

        {/* 리뷰 작성 폼 카드 */}
        <div className="review-create-card">
          <form onSubmit={handleSubmit}>
            {/* 별점 선택 */}
            <div className="form-group rating-group">
              <label>숙소 만족도 (별점)</label>
              <div className="rating-picker-box">
                <StarRatingInput value={star} onChange={setStar} />
                <span className="rating-score-text">{star}점</span>
              </div>
            </div>

            {/* 리뷰 내용 */}
            <div className="form-group">
              <label htmlFor="review-contents">리뷰 내용</label>
              <textarea
                id="review-contents"
                rows="6"
                placeholder="숙소의 청결도, 위치, 서비스 등 만족스러웠던 점이나 아쉬웠던 점을 자세히 적어주세요."
                value={reviewContents}
                onChange={(e) => setReviewContents(e.target.value)}
                required
              />
            </div>

            {/* 사진 첨부 (신규 작성 시에만 표시) */}
            {!isEditMode && (
              <div className="form-group">
                <label htmlFor="review-files">사진 첨부 (선택)</label>
                <div className="file-upload-box">
                  <input
                    id="review-files"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                  />
                  <label htmlFor="review-files" className="file-upload-btn">
                    사진 선택 ({imageFiles.length}개 선택됨)
                  </label>
                  {imageFiles.length > 0 && (
                    <div className="file-name-list">
                      {imageFiles.map((file, idx) => (
                        <span key={idx} className="file-tag">
                          {file.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 에러 메시지 */}
            {error && <div className="review-error-box">{error}</div>}

            {/* 하단 버튼 그룹 */}
            <div className="form-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => navigate(-1)}
                disabled={submitting}
              >
                취소
              </button>
              <button
                type="submit"
                className="btn-submit"
                disabled={submitting}
              >
                {submitting ? '처리 중...' : isEditMode ? '수정 완료' : '리뷰 등록'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AccommodationReviewCreatePage;