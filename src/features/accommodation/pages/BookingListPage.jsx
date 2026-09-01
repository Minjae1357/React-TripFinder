import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { deleteBooking, fetchMyBookings } from '../api/bookingApi';
import './BookingListPage.css';

const STATUS_LABEL = {
  PENDING: '결제 대기',
  CONFIRMED: '예약 확정',
  CANCELED: '예약 취소됨',
};

const BookingListPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = () => {
    setLoading(true);
    fetchMyBookings()
      .then((data) => setBookings(data || []))
      .catch((err) => {
        console.error(err);
        setBookings([]);
      })
      .finally(() => setLoading(false));
  };

  const handleDelete = async (e, bookingId) => {
    e.stopPropagation(); // 상세 이동 이벤트 전파 방지
    if (!window.confirm('예약 내역을 삭제하면 복구할 수 없습니다. 정말 예약 내역을 삭제하시겠습니까?')) return;
    try {
      await deleteBooking(bookingId);
      loadBookings();
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="booking-list-page">
      <div className="booking-list-inner">
        {/* 상단 헤더 */}
        <div className="booking-list-header">
          <h1>내 예약 목록</h1>
          <p>예약하신 숙소 및 결제 내역을 확인할 수 있습니다</p>
        </div>

        {/* 상태별 화면 */}
        {loading ? (
          <div className="booking-state-card">
            <div className="booking-spinner" />
            <p>예약 내역을 불러오는 중입니다...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="booking-state-card">
            <span className="state-icon">📋</span>
            <p>예약 내역이 없습니다.</p>
            <button className="btn-explore" onClick={() => navigate('/accommodation')}>
              숙소 둘러보기
            </button>
          </div>
        ) : (
          <div className="booking-cards-wrapper">
            {bookings.map((booking) => {
              const statusClass =
                booking.bookingStatus === 'CONFIRMED'
                  ? 'badge-confirmed'
                  : booking.bookingStatus === 'PENDING'
                  ? 'badge-pending'
                  : 'badge-canceled';

              return (
                <article
                  key={booking.bookingId}
                  className="booking-card"
                  onClick={() => navigate(`/bookings/${booking.bookingId}`)}
                >
                  <div className="booking-card-top">
                    <span className={`booking-status-badge ${statusClass}`}>
                      {STATUS_LABEL[booking.bookingStatus] ?? booking.bookingStatus}
                    </span>
                    <strong className="booking-amount">
                      {(booking.totalAmount ?? 0).toLocaleString()}원
                    </strong>
                  </div>

                  <div className="booking-card-bottom">
                    <div className="booking-meta">
                      <span className="booking-date">
                        예약일 {booking.createdAt ? new Date(booking.createdAt).toLocaleDateString() : '-'}
                      </span>
                    </div>

                    <button
                      type="button"
                      className="btn-booking-delete"
                      onClick={(e) => handleDelete(e, booking.bookingId)}
                    >
                      삭제
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingListPage;