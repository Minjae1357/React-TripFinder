// 별점 입력 컴포넌트 - 재사용 가능성으로 컴포넌트 별도 구현
const StarRatingInput = ({ value, onChange }) => {
  return (
    <>
      <style>{`
        .star-rating-input-wrap {
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        .star-input-icon {
          font-size: 28px;
          cursor: pointer;
          transition: transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1), color 0.15s ease;
          user-select: none;
        }

        .star-input-icon:hover {
          transform: scale(1.2);
        }

        .star-input-icon.active {
          color: #F59E0B;
        }

        .star-input-icon.inactive {
          color: #E2E8F0;
        }

        .star-input-icon.inactive:hover {
          color: #FDE68A;
        }
      `}</style>

      <div className="star-rating-input-wrap">
        {[1, 2, 3, 4, 5].map((starNumber) => {
          const isActive = starNumber <= value;
          return (
            <i
              key={starNumber}
              className={`star-input-icon ${isActive ? 'bi bi-star-fill active' : 'bi bi-star inactive'}`}
              onClick={() => onChange(starNumber)}
            />
          );
        })}
      </div>
    </>
  );
};

export default StarRatingInput;