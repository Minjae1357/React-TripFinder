
const SORT_OPTIONS = [
  { value: 'recommend', label: '추천순' },
  { value: 'latest', label: '최신순' },
  { value: 'star_desc', label: '별점 높은순' },
  { value: 'star_asc', label: '별점 낮은순' },
];

const AccommodationReviewSortSelect = ({ value, onChange }) => {
  return (
    <>
      <style>{`
        .review-sort-select-wrap {
          position: relative;
          display: inline-block;
        }

        .review-sort-select {
          appearance: none;
          -webkit-appearance: none;
          background-color: var(--card, #FFFFFF);
          border: 1.5px solid var(--border, #E2E8F0);
          border-radius: 8px;
          padding: 8px 32px 8px 12px;
          font-size: 13.5px;
          font-weight: 500;
          color: var(--foreground, #0F172A);
          cursor: pointer;
          outline: none;
          transition: all 0.15s ease;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748B'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 8px center;
          background-size: 14px;
        }

        .review-sort-select:hover {
          border-color: #CBD5E1;
        }

        .review-sort-select:focus {
          border-color: var(--primary, #1D4ED8);
          box-shadow: 0 0 0 3px rgba(29, 78, 216, 0.08);
        }
      `}</style>

      <div className="review-sort-select-wrap">
        <select
          className="review-sort-select"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </>
  );
};

export default AccommodationReviewSortSelect;