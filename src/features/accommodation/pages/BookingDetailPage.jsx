import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { cancelBooking, fetchBooking } from '../api/bookingApi';

const STATUS_LABEL = {
    PENDING: '결제 대기',
    CONFIRMED: '예약 확정',
    CANCELED: '예약 취소됨',
};

const BookingDetailPage = () => {
    const {bookingId} = useParams();
    const navigate = useNavigate();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadBooking();
    }, [bookingId]);

    const loadBooking = () => {
        setLoading(true);
        fetchBooking(bookingId).then(setBooking).finally(() => setLoading(false));
    };

    const handleCancel = async () => {
        if(!window.confirm('예약을 취소하겠습니까?')) return;
        try {
            await cancelBooking(bookingId);
            loadBooking(); // 취소 후 상태 다시 불러오기
        } catch (error) {
            alert(error.message);
        }
    };

    if(loading) return <p className='text-center py-4'>불러오는 중...</p>;
    if(!booking) return <p className='text-center py-4'>예약 정보를 찾을 수 없습니다.</p>;

    const isCanceled = booking.bookingStatus === 'CANCELED';

    return (
        <div className='container py-4' style={{maxWidth: '600px'}}>
            <div className='text-center mb-4'>
                <i className='bi bi-check-circle-fill text-success' style={{fontSize: '48px'}}></i>
                <h2 className='mt-3'>예약이 완료되었습니다.</h2>
                <span className={`badge ${isCanceled ? 'bg-secondary' : 'bg-primary'}`}>
                    {STATUS_LABEL[booking.bookingStatus] ?? booking.bookingStatus}
                </span>
            </div>

            {booking.items.map((item) => (
                <div key={item.bookingItemId} className='border rounded p-3 mb-3'>
                    <div className='text-muted small'>{item.accommodationName}</div>
                    <strong>{item.roomName}</strong>
                    <div className='mt-2 small text-muted'>
                        {item.checkInDate} ~ {item.checkOutDate} ㆍ 인원 {item.guestCount}명 ㆍ 객실 {item.roomQuantity}개
                    </div>
                    <div className='mt-2 text-end'>
                        {item.subtotal.toLocaleString()}원
                    </div>
                </div>
            ))}
            
            <div className='d-flex justify-content-between align-items-center border-top pt-3 mt-3'>
                <strong>총 결제 금액</strong>
                <strong className='fs-5'>{booking.totalAmount.toLocaleString()}원</strong>
            </div>
            
            <div className='d-flex gap-2 mt-4'>
                <button className='btn btn-outline-secondary flex-fill' onClick={() => navigate('/bookings')}>
                    예약 목록으로
                </button>
                {!isCanceled && (
                    <button className='btn btn-outline-danger flex-fill' onClick={handleCancel}>
                        예약 취소
                    </button>
                )}
            </div>
        </div>
    );
};

export default BookingDetailPage;