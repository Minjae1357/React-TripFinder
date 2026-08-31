import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { deleteBooking, fetchMyBookings } from '../api/bookingApi';

const STATUS_LABEL = {
    PENDING: '결제 대기',
    CONFIRMED: '예약 확정',
    CANCELED: '예약 취소됨',
};

const BookingListPage = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() =>{
        loadBookings();
    }, []);

    const loadBookings = () => {
        setLoading(true);
        fetchMyBookings().then(setBookings).finally(() => setLoading(false));
    }

    const handleDelete = async (e, bookingId) => {
        e.stopPropagation(); // 상세 이동 이벤트로 안번지게 막기
        if(!window.confirm('예약 내역을 삭제하면 복구할 수 없습니다. 정말 예약 내역을 삭제하시겠습니까?')) return;
        try {
            await deleteBooking(bookingId);
            loadBookings();
        } catch (error) {
            alert(error.message);
        }
    }

    if(loading) return <p className='text-center py-4'>불러오는 중...</p>;
    if(!bookings.length === 0 ) return <p className='text-center py-4'>예약 내역이 없습니다.</p>;

    return (
        <div className='container py-4' style={{maxWidth: '600px'}}>
            <h2 className='mb-4'>내 예약 목록</h2>

            {bookings.map((bookings) => (
                <div key={bookings.bookingId} className='border rounded p-3 mb-3' style={{cursor: 'pointer'}} onClick={() => navigate(`/bookings/${bookings.bookingId}`)}>
                    <div className='d-flex justify-content-between align-items-center'>
                        <span className={`badge ${bookings.bookingStatus === 'CANCELED' ? 'bg-secondary' : 'bg-primary'}`}>
                            {STATUS_LABEL[bookings.bookingStatus] ?? bookings.bookingStatus}
                        </span>
                        <strong>{bookings.totalAmount.toLocaleString()}원</strong>
                    </div>
                    <div className='d-flex justify-content-between align-items-center mt-2'>
                        <span className='text-muted small'>
                            예약일 {new Date(bookings.createdAt).toLocaleDateString()}
                        </span>
                        <button className='btn btn-sm btn-outline-danger' onClick={(e) => handleDelete(e, bookings.bookingId)}>
                            삭제
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default BookingListPage;