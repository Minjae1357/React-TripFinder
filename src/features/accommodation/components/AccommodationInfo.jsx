
import './AccommodationInfo.css';

const AccommodationInfo = ({ accommodation }) => {
  if (!accommodation) return null;

  return (
    <div className="acc-info-card">
      {/* 상단 뱃지 및 분류 */}
      <div className="acc-meta-top">
        <span className="acc-type-badge">{accommodation.accommodationType || '숙소'}</span>
        {accommodation.rating && (
          <div className="acc-rating-badge">
            <span className="star-icon">⭐</span>
            <span className="rating-text">{accommodation.rating}</span>
          </div>
        )}
      </div>

      {/* 숙소 이름 */}
      <h1 className="acc-name">{accommodation.name || accommodation.accommodationName}</h1>

      {/* 주소 및 위치 정보 */}
      <div className="acc-address-box">
        <span className="location-icon"></span>
        <span className="address-text">{accommodation.address || '주소 정보 없음'}</span>
      </div>
    </div>
  );
};

export default AccommodationInfo;