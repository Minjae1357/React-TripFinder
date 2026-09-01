import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { cancelBooking, fetchBooking } from '../api/bookingApi';
import './BookingDetailPage.css';

const STATUS_LABEL = {
  PENDING: '결제 대기',
  CONFIRMED: '예약 확정',
  CANCELED: '예약 취소됨',
};

const BookingDetailPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBooking();
  }, [bookingId]);

  const loadBooking = () => {
    setLoading(true);
    fetchBooking(bookingId)
      .then(setBooking)
      .finally(() => setLoading(false));
  };

  const handleCancel = async () => {
    if (!window.confirm('예약을 취소하겠습니까?')) return;
    try {
      await cancelBooking(bookingId);
      loadBooking(); // 취소 후 상태 다시 불러오기
    } catch (error) {
      alert(error.message);
    }
  };

  if (loading) {
    return (
      <div className="booking-detail-page">
        <div className="booking-detail-state-card">
          <div className="booking-detail-spinner" />
          <p>예약 정보를 불러오는 중입니다...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="booking-detail-page">
        <div className="booking-detail-state-card">
          <span className="state-icon">⚠️</span>
          <p>예약 정보를 찾을 수 없습니다.</p>
          <button className="btn-back-action" onClick={() => navigate('/bookings')}>
            예약 목록으로
          </button>
        </div>
      </div>
    );
  }

  const isCanceled = booking.bookingStatus === 'CANCELED';

  return (
    <div className="booking-detail-page">
      <div className="booking-detail-inner">
        {/* 뒤로가기 내비게이션 */}
        <button className="btn-back-link" onClick={() => navigate('/bookings')}>
          ← 예약 목록으로
        </button>

        {/* 예약 완료 및 상태 카드 */}
        <div className="booking-detail-card">
          <div className="booking-status-header">
            <div className={`status-icon-circle ${isCanceled ? 'icon-canceled' : 'icon-confirmed'}`}>
              {isCanceled ? '✕' : '✓'}
            </div>
            <h2>{isCanceled ? '예약이 취소되었습니다' : '예약이 완료되었습니다'}</h2>
            <span className={`booking-status-badge ${isCanceled ? 'badge-canceled' : 'badge-confirmed'}`}>
              {STATUS_LABEL[booking.bookingStatus] ?? booking.bookingStatus}
            </span>
          </div>

          {/* 예약 상세 아이템 목록 */}
          <div className="booking-items-section">
            <h3 className="section-label">예약 숙소 및 객실 정보</h3>
            <div className="items-list">
              {booking.items?.map((item) => (
                <div key={item.bookingItemId} className="booking-item-card">
                  <div className="item-header">
                    <span className="item-hotel">{item.accommodationName}</span>
                    <strong className="item-room">{item.roomName}</strong>
                  </div>

                  <div className="item-details">
                    <div className="detail-row">
                      <span className="detail-title">이용 일정</span>
                      <span className="detail-val">{item.checkInDate} ~ {item.checkOutDate}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-title">투숙 인원 및 객실</span>
                      <span className="detail-val">인원 {item.guestCount}명 ㆍ 객실 {item.roomQuantity}개</span>
                    </div>
                  </div>

                  <div className="item-price-row">
                    <span>객실 금액</span>
                    <strong className="item-price">{(item.subtotal ?? 0).toLocaleString()}원</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 총 결제 금액 요약 */}
          <div className="booking-summary-section">
            <div className="summary-row">
              <span>총 결제 금액</span>
              <strong className="total-amount">
                {(booking.totalAmount ?? 0).toLocaleString()}원
              </strong>
            </div>
          </div>

          {/* 하단 제어 액션 버튼 */}
          <div className="booking-action-buttons">
            <button
              type="button"
              className="btn-list-go"
              onClick={() => navigate('/bookings')}
            >
              예약 목록
            </button>
            {!isCanceled && (
              <button
                type="button"
                className="btn-cancel-booking"
                onClick={handleCancel}
              >
                예약 취소
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailPage;