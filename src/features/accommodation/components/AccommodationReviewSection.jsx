import { useEffect, useState } from 'react';
import { fetchAccommodationReviews, fetchAccommodationReviewSummary } from '../api/accommodationReviewApi';
import AccommodationReviewSummary from './AccommodationReviewSummary';
import AccommodationReviewSortSelect from './AccommodationReviewSortSelect';
import AccommodationReviewCard from './AccommodationReviewCard';
import AccommodationPagination from './AccommodationPagination';
import { useNavigate } from 'react-router-dom';
import { checkBookingHistory } from '../api/bookingApi';

const AccommodationReviewSection = ({ accommodationId }) => {
  const [summary, setSummary] = useState(null);
  const [reviewsData, setReviewsData] = useState(null);
  const [sort, setSort] = useState("recommend");
  const [page, setPage] = useState(0);
  const navigate = useNavigate();
  const [hasBookingHistory, setHasBookingHistory] = useState(false);

  useEffect(() => {
    checkBookingHistory(accommodationId)
      .then(setHasBookingHistory)
      .catch(() => setHasBookingHistory(false)); // 비로그인이나 그 외 에러 시 권한 없음 처리
  }, [accommodationId]);

  useEffect(() => {
    fetchAccommodationReviewSummary(accommodationId).then(setSummary);
  }, [accommodationId]);

  useEffect(() => {
    fetchAccommodationReviews(accommodationId, sort, page).then(setReviewsData);
  }, [accommodationId, sort, page]);

  const handleSortChange = (newSort) => {
    setSort(newSort);
    setPage(0); // 정렬 바뀌면 1페이지로
  };

  const handleReviewDeleted = (deletedReviewId) => {
    setReviewsData((prev) => ({
      ...prev,
      reviews: prev.reviews.filter((review) => review.reviewId !== deletedReviewId),
    }));
    // 리뷰 삭제 후 summary도 갱신
    fetchAccommodationReviewSummary(accommodationId).then(setSummary);
  };

  if (!reviewsData || !summary) {
    return (
      <div className="review-section-loading">
        <div className="review-section-spinner" />
        <p>리뷰를 불러오는 중입니다...</p>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .acc-review-section {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .review-section-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
          padding-bottom: 20px;
          border-bottom: 1.5px solid var(--border, #E2E8F0);
        }

        .review-top-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .btn-write-review {
          padding: 8px 16px;
          background: var(--primary, #1D4ED8);
          border: none;
          border-radius: 8px;
          font-size: 13.5px;
          font-weight: 600;
          color: #FFFFFF;
          cursor: pointer;
          transition: background-color 0.15s ease, opacity 0.15s ease;
          white-space: nowrap;
        }

        .btn-write-review:hover:not(:disabled) {
          background: #1A44B8;
        }

        .btn-write-review:disabled {
          background: var(--muted, #E2E8F0);
          color: var(--muted-foreground, #94A3B8);
          cursor: not-allowed;
        }

        .reviews-empty-box {
          padding: 48px 20px;
          text-align: center;
          color: var(--muted-foreground, #64748B);
          font-size: 14.5px;
          border-bottom: 1px solid var(--border, #E2E8F0);
        }

        .review-section-loading {
          padding: 48px 20px;
          text-align: center;
          color: var(--muted-foreground, #64748B);
          font-size: 14px;
        }

        .review-section-spinner {
          width: 28px;
          height: 28px;
          border: 3px solid #E2E8F0;
          border-top-color: var(--primary, #1D4ED8);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin: 0 auto 10px;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>

      <section className="acc-review-section">
        {/* 상단 요약 & 액션 바 */}
        <div className="review-section-top">
          <AccommodationReviewSummary
            averageStar={summary.averageStar}
            reviewCount={summary.reviewCount}
          />
          <div className="review-top-actions">
            <button
              type="button"
              className="btn-write-review"
              disabled={!hasBookingHistory}
              title={!hasBookingHistory ? '이용 완료한 고객만 작성이 가능합니다' : ''}
              onClick={() => navigate(`/accommodation/${accommodationId}/review/new`)}
            >
              리뷰 작성
            </button>
            <AccommodationReviewSortSelect value={sort} onChange={handleSortChange} />
          </div>
        </div>

        {/* 리뷰 리스트 */}
        <div className="reviews-list-container">
          {reviewsData.reviews.length === 0 ? (
            <div className="reviews-empty-box">
              <p>작성된 리뷰가 없습니다. 첫 리뷰를 작성해 보세요!</p>
            </div>
          ) : (
            reviewsData.reviews.map((review) => (
              <AccommodationReviewCard
                key={review.reviewId}
                review={review}
                accommodationId={accommodationId}
                onDelete={handleReviewDeleted}
              />
            ))
          )}
        </div>

        {/* 페이지네이션 */}
        <AccommodationPagination
          currentPage={reviewsData.currentPage}
          totalPages={reviewsData.totalPages}
          onPageChange={setPage}
        />
      </section>
    </>
  );
};

export default AccommodationReviewSection;