import { useState } from 'react';
import Carousel from 'react-bootstrap/Carousel';
import { formatDateTime } from '../utils/dateFormat';
import { deleteReview } from '../api/accommodationReviewApi';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

// 리뷰 카드 컴포넌트
const AccommodationReviewCard = ({ review, accommodationId, onDelete }) => {
  const [expanded, setExpanded] = useState(false);
  const isEdited = new Date(review.updatedAt) - new Date(review.createdAt) > 60000; // 1분 이상 차이나면 수정된 것으로 간주
  const currentUserId = useAuthStore((state) => state.user?.id);
  const isOwner = review.userId === currentUserId; // 작성자 본인 리뷰인지 확인
  const navigate = useNavigate();

  // 줄바꿈 개수가 3줄을 넘는지 확인
  const lineCount = review.reviewContents.split('\n').length;
  const isLongContent = review.reviewContents.length > 100 || lineCount > 3;

  const handleEdit = () => {
    navigate(`/accommodation/${accommodationId}/review/${review.reviewId}/edit`);
  };

  const handleDelete = async () => {
    if (!window.confirm('정말로 이 리뷰를 삭제하시겠습니까?')) return;
    await deleteReview(accommodationId, review.reviewId);
    onDelete(review.reviewId); // 삭제 후 부모 컴포넌트에 알려서 목록 갱신
  };

  return (
    <>
      <style>{`
        .review-card-item {
          padding: 20px 0;
          border-bottom: 1px solid var(--border, #E2E8F0);
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .review-card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
        }

        .review-stars {
          display: flex;
          align-items: center;
          gap: 2px;
        }

        .review-meta-dates {
          text-align: right;
          font-size: 12px;
          color: var(--muted-foreground, #64748B);
          line-height: 1.4;
        }

        .review-text-body {
          font-size: 14.5px;
          line-height: 1.6;
          color: var(--foreground, #1E293B);
          margin: 0;
          word-break: break-word;
        }

        .review-text-body.collapsed {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
          white-space: pre-line;
        }

        .review-text-body.expanded {
          white-space: pre-line;
        }

        .btn-toggle-expand {
          align-self: flex-start;
          background: none;
          border: none;
          font-size: 13px;
          font-weight: 600;
          color: var(--primary, #1D4ED8);
          cursor: pointer;
          padding: 0;
        }

        .btn-toggle-expand:hover {
          text-decoration: underline;
        }

        .review-carousel-wrap {
          width: 180px;
          border-radius: 10px;
          overflow: hidden;
          border: 1px solid var(--border, #E2E8F0);
        }

        .review-owner-actions {
          display: flex;
          gap: 8px;
          margin-top: 4px;
        }

        .btn-rev-edit {
          padding: 4px 10px;
          background: var(--card, #FFFFFF);
          border: 1px solid var(--border, #E2E8F0);
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          color: var(--foreground, #0F172A);
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .btn-rev-edit:hover {
          background: var(--muted, #F8FAFC);
        }

        .btn-rev-del {
          padding: 4px 10px;
          background: #FEE2E2;
          border: 1px solid #FECACA;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          color: #DC2626;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .btn-rev-del:hover {
          background: #FCA5A5;
          color: #B91C1C;
        }
      `}</style>

      <div className="review-card-item">
        {/* 별점 & 등록일시 */}
        <div className="review-card-header">
          <div className="review-stars">
            {[1, 2, 3, 4, 5].map((starNumber) => (
              <i
                key={starNumber}
                className={starNumber <= review.star ? 'bi bi-star-fill' : 'bi bi-star'}
                style={{
                  fontSize: '15px',
                  color: starNumber <= review.star ? '#F59E0B' : '#E2E8F0',
                }}
              />
            ))}
          </div>

          <div className="review-meta-dates">
            <div>{formatDateTime(review.createdAt)}</div>
            {isEdited && (
              <div>수정됨 : {formatDateTime(review.updatedAt)}</div>
            )}
          </div>
        </div>

        {/* 리뷰 본문 */}
        <p className={`review-text-body ${expanded ? 'expanded' : 'collapsed'}`}>
          {review.reviewContents}
        </p>

        {isLongContent && (
          <button
            type="button"
            className="btn-toggle-expand"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? '접기' : '더보기'}
          </button>
        )}

        {/* 이미지 캐러셀 */}
        {review.reviewImgUrls.length > 0 && (
          <div className="review-carousel-wrap">
            <Carousel
              interval={null} // 자동 슬라이드 비활성화
              indicators={review.reviewImgUrls.length > 1} // 2개 이상일 때만 하단 점 표시
              controls={review.reviewImgUrls.length > 1} // 2개 이상일 때만 좌우 컨트롤 표시
            >
              {review.reviewImgUrls.map((url, idx) => (
                <Carousel.Item key={idx}>
                  <img
                    src={url}
                    alt={`Review Image ${idx + 1}`}
                    className="w-100"
                    style={{ objectFit: 'cover', height: '140px', display: 'block' }}
                  />
                </Carousel.Item>
              ))}
            </Carousel>
          </div>
        )}

        {/* 수정/삭제 버튼 - 본인만 표시 */}
        {isOwner && (
          <div className="review-owner-actions">
            <button type="button" className="btn-rev-edit" onClick={handleEdit}>
              수정
            </button>
            <button type="button" className="btn-rev-del" onClick={handleDelete}>
              삭제
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default AccommodationReviewCard;