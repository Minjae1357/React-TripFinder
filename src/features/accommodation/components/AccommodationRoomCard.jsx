import { useState } from 'react';
import { addCartItem } from '../api/cartApi';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Carousel from 'react-bootstrap/Carousel';
import { useNavigate } from 'react-router-dom';

const AccommodationRoomCard = ({ room }) => {
  const [showForm, setShowForm] = useState(false);
  const [guestCount, setGuestCount] = useState(1);
  const [roomQuantity, setRoomQuntity] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState([null, null]);
  const [checkInDate, checkOutDate] = dateRange;
  const navigate = useNavigate();

  const formatDate = (date) => {
    if (!date) return null;
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const handleAddToCart = async () => {
    if (!checkInDate || !checkOutDate) {
      setError('체크인/체크아웃 날짜를 선택해주세요.');
      return;
    }
    if (checkInDate >= checkOutDate) {
      setError('체크아웃 날짜는 체크인 날짜보다 뒤여야 합니다.');
      return;
    }
    if (guestCount > room.maxGuest) {
      setError(`최대 인원은 ${room.maxGuest}명 입니다.`);
      return;
    }
    if (guestCount < 1) {
      setError('인원은 1명 이상이어야 합니다.');
      return;
    }
    if (roomQuantity > room.totalRoomCount) {
      setError(`남은 객실은 ${room.totalRoomCount}개 입니다.`);
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await addCartItem(room.roomId, formatDate(checkInDate), formatDate(checkOutDate), roomQuantity, guestCount);
      alert('장바구니에 담았습니다.');
      setShowForm(false);
    } catch (error) {
      if (error.message.includes('로그인')) {
        if (window.confirm('로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?')) {
          navigate('/login');
        }
      } else {
        setError(error.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <style>{`
        .room-card-box {
          background: var(--card, #FFFFFF);
          border: 1px solid var(--border, #E2E8F0);
          border-radius: 14px;
          padding: 20px;
          margin-bottom: 16px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
          transition: border-color 0.15s ease;
        }

        .room-card-box:hover {
          border-color: #CBD5E1;
        }

        .room-carousel-container {
          border-radius: 12px;
          overflow: hidden;
          margin-bottom: 14px;
          max-width: 320px;
          margin-left: auto;
          margin-right: auto;
          border: 1px solid var(--border, #E2E8F0);
        }

        .room-carousel-img {
          width: 100%;
          height: 180px;
          object-fit: cover;
          display: block;
        }

        .room-title-area {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
        }

        .room-name-title {
          font-family: 'Outfit', sans-serif;
          font-size: 18px;
          font-weight: 800;
          color: var(--foreground, #0F172A);
          margin: 0;
        }

        .room-spa-badge {
          font-size: 11.5px;
          font-weight: 700;
          padding: 3px 8px;
          background: #E0F2FE;
          color: #0369A1;
          border-radius: 6px;
        }

        .room-price-info {
          font-size: 17px;
          font-weight: 800;
          color: var(--primary, #1D4ED8);
          margin-bottom: 6px;
        }

        .room-price-info span {
          font-size: 13px;
          font-weight: 500;
          color: var(--muted-foreground, #64748B);
        }

        .room-meta-desc {
          font-size: 13px;
          color: var(--muted-foreground, #64748B);
          margin-bottom: 14px;
        }

        .btn-open-cart {
          padding: 9px 16px;
          background: var(--primary, #1D4ED8);
          color: #FFFFFF;
          border: none;
          border-radius: 8px;
          font-size: 13.5px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.15s ease;
        }

        .btn-open-cart:hover {
          background: #1A44B8;
        }

        /* ── 예약/담기 서브 폼 ── */
        .room-reserve-form-panel {
          margin-top: 14px;
          padding: 16px;
          background: var(--muted, #F8FAFC);
          border: 1px solid var(--border, #E2E8F0);
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .form-field-label {
          font-size: 12.5px;
          font-weight: 700;
          color: var(--foreground, #0F172A);
          margin-bottom: 4px;
          display: block;
        }

        .room-grid-inputs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .room-input-control {
          width: 100%;
          padding: 8px 12px;
          border: 1.5px solid var(--border, #E2E8F0);
          border-radius: 8px;
          font-size: 13.5px;
          background: var(--card, #FFFFFF);
          color: var(--foreground, #0F172A);
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.15s ease;
        }

        .room-input-control:focus {
          border-color: var(--primary, #1D4ED8);
        }

        .room-reserve-error {
          font-size: 12.5px;
          color: #DC2626;
          margin: 0;
        }

        .room-form-btn-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .btn-form-submit {
          padding: 8px 16px;
          background: var(--primary, #1D4ED8);
          color: #FFFFFF;
          border: none;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
        }

        .btn-form-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-form-cancel {
          padding: 8px 14px;
          background: var(--card, #FFFFFF);
          border: 1px solid var(--border, #E2E8F0);
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          color: var(--muted-foreground, #64748B);
          cursor: pointer;
        }

        .btn-form-cancel:hover {
          background: #F1F5F9;
        }
      `}</style>

      <div className="room-card-box">
        {/* 객실 이미지 슬라이더 */}
        {room.imgUrls && room.imgUrls.length > 0 && (
          <div className="room-carousel-container">
            <Carousel
              interval={null}
              indicators={room.imgUrls.length > 1}
              controls={room.imgUrls.length > 1}
            >
              {room.imgUrls.map((url, idx) => (
                <Carousel.Item key={idx}>
                  <img
                    src={url}
                    alt={`${room.roomName} 이미지 ${idx + 1}`}
                    className="room-carousel-img"
                  />
                </Carousel.Item>
              ))}
            </Carousel>
          </div>
        )}

        {/* 객실 정보 헤더 */}
        <div className="room-title-area">
          <h5 className="room-name-title">{room.roomName}</h5>
          {room.hasSpa && <span className="room-spa-badge">스파 보유</span>}
        </div>

        <div className="room-price-info">
          {room.price.toLocaleString()}원 <span>/ 1박</span>
        </div>

        <div className="room-meta-desc">
          최대 인원 {room.maxGuest}명 ㆍ 남은 객실 {room.totalRoomCount}개
        </div>

        {/* 장바구니 담기 토글 버튼 / 예약 입력 폼 */}
        {!showForm ? (
          <button
            type="button"
            className="btn-open-cart"
            onClick={() => setShowForm(true)}
          >
            장바구니에 담기
          </button>
        ) : (
          <div className="room-reserve-form-panel">
            <div>
              <label className="form-field-label">체크인 - 체크아웃 날짜</label>
              <DatePicker
                selectsRange
                startDate={checkInDate}
                endDate={checkOutDate}
                onChange={(update) => setDateRange(update)}
                minDate={new Date()}
                dateFormat="yyyy-MM-dd"
                placeholderText="날짜 범위를 선택하세요"
                className="room-input-control"
                wrapperClassName="w-100"
                isClearable
              />
            </div>

            <div className="room-grid-inputs">
              <div>
                <label className="form-field-label">투숙 인원</label>
                <input
                  type="number"
                  min={1}
                  max={room.maxGuest}
                  className="room-input-control"
                  value={guestCount}
                  onChange={(e) => setGuestCount(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="form-field-label">객실 수</label>
                <input
                  type="number"
                  min={1}
                  max={room.totalRoomCount}
                  className="room-input-control"
                  value={roomQuantity}
                  onChange={(e) => setRoomQuntity(Number(e.target.value))}
                />
              </div>
            </div>

            {error && <p className="room-reserve-error">{error}</p>}

            <div className="room-form-btn-group">
              <button
                type="button"
                className="btn-form-submit"
                onClick={handleAddToCart}
                disabled={submitting}
              >
                {submitting ? '담는 중...' : '장바구니 담기'}
              </button>
              <button
                type="button"
                className="btn-form-cancel"
                onClick={() => setShowForm(false)}
              >
                취소
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AccommodationRoomCard;