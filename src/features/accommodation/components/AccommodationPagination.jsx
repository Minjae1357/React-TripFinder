

// 숫자 페이징 컴포넌트 
const AccommodationPagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null; // 페이지가 1개 이하이면 렌더링하지 않음

  return (
    <>
      <style>{`
        .acc-pagination-wrap {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 6px;
          margin-top: 28px;
        }

        .acc-page-btn {
          min-width: 36px;
          height: 36px;
          padding: 0 6px;
          border-radius: 8px;
          border: 1.5px solid var(--border, #E2E8F0);
          background: var(--card, #FFFFFF);
          color: var(--muted-foreground, #64748B);
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s ease;
        }

        .acc-page-btn:hover:not(.acc-page-btn--active) {
          border-color: var(--primary, #1D4ED8);
          color: var(--primary, #1D4ED8);
          background: var(--secondary, #EFF6FF);
        }

        .acc-page-btn--active {
          background: var(--primary, #1D4ED8);
          border-color: var(--primary, #1D4ED8);
          color: #FFFFFF;
          font-weight: 700;
          box-shadow: 0 2px 8px rgba(29, 78, 216, 0.25);
        }
      `}</style>

      <div className="acc-pagination-wrap">
        {Array.from({ length: totalPages }, (_, i) => {
          const isActive = i === currentPage;
          return (
            <button
              key={i}
              type="button"
              className={`acc-page-btn ${isActive ? 'acc-page-btn--active' : ''}`}
              onClick={() => onPageChange(i)}
            >
              {i + 1}
            </button>
          );
        })}
      </div>
    </>
  );
};

export default AccommodationPagination;