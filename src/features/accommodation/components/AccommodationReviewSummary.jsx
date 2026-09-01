

// 평균 별점, 리뷰 개수 표시
const AccommodationReviewSummary = ({ averageStar, reviewCount }) => {
  return (
    <>
      <style>{`
        .acc-review-summary-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .summary-score-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: #FEF3C7;
          padding: 4px 10px;
          border-radius: 8px;
        }

        .summary-star-icon {
          font-size: 15px;
          color: #F59E0B;
        }

        .summary-score-val {
          font-family: 'Outfit', sans-serif;
          font-size: 16px;
          font-weight: 800;
          color: #B45309;
        }

        .summary-count-text {
          font-size: 14px;
          font-weight: 500;
          color: var(--muted-foreground, #64748B);
        }
      `}</style>

      <div className="acc-review-summary-wrap">
        <div className="summary-score-badge">
          <span className="summary-star-icon">⭐</span>
          <strong className="summary-score-val">{(averageStar ?? 0).toFixed(1)}</strong>
        </div>
        <span className="summary-count-text">({reviewCount ?? 0}개의 후기)</span>
      </div>
    </>
  );
};

export default AccommodationReviewSummary;