import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { deleteCartItem, fetchCart } from '../api/cartApi';
import { createBooking } from '../api/bookingApi';

const CartPage = () => {
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState([]); // 예약 대상으로 선택된 cartItemId 목록
    const [booking, setBooking] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        loadCart();
    }, []);

    const loadCart = () => {
        setLoading(true);
        fetchCart()
            .then((data) => {
                setCart(data);
                setSelectedIds(data.items.map((item) => item.cartItemId)); // 전체 선택이 기본값
            })
            .catch((error) => {
                console.error(error.message);
                setError(error.message);
            })
            .finally(() => setLoading(false));
    };

    const handleDelete = async (cartItemId) => {
        if(!window.confirm('장바구니에서 삭제하시겠습니까?')) return;
        await deleteCartItem(cartItemId);
        loadCart(); // 삭제 후에 목록, 합계 재조회
    };

    const toggleSelect = (cartItemId) => {
        setSelectedIds((prev) => prev.includes(cartItemId) ? prev.filter((id) => id !== cartItemId) : [...prev, cartItemId]);
    };

    // 선택된 항목들의 금액만 합산
    const selectedTotal = cart ? cart.items.filter((item) => selectedIds.includes(item.cartItemId)).reduce((sum, item) => sum + item.subtotal, 0) : 0;

    const handleBooking = async () => {
        if(selectedIds.length === 0){
            alert('예약할 항목을 선택해주세요.');
            return;
        }
        if(!window.confirm(`선택한 ${selectedIds.length}개 항목을 예약하시겠습니까?`)) return;

        setBooking(true);
        try {
            const bookingId = await createBooking(selectedIds);
            navigate(`/bookings/${bookingId}`); // 예약 완료 후 상세 페이지로 이동
        } catch (error) {
            alert(error.message);
        }finally{
            setBooking(false);
        }
    };

    if(loading) return <p className='text-center py-4'>불러오는 중...</p>;
    if (error) return <p className='text-center py-4 text-danger'>{error}</p>
    if(!cart || !cart.items || cart.items.length === 0){
        return <p className='text-center py-4'>장바구니가 비어있습니다.</p>
    }

    return (
        <div className='d-flex justify-content-between align-items-center mb-4'>
            
            <div className='container py-4' style={{maxWidth:'600px'}}>
                <h2 className='mb-4'>장바구니</h2>
                <button className='btn btn-outline-secondary btn-sm mb-4' onClick={()=>navigate('/bookings')}>
                내 예약 목록
                </button>
                {cart.items.map((item) => (
                    <div key={item.cartItemId} className='border rounded p-3 mb-3'>
                        <div className='d-flex justify-content-between align-items-start'>
                            <div className='form-check d-flex align-items-start'>
                                <input type='checkbox' className='form-check-input me-2 mt-1' checked={selectedIds.includes(item.cartItemId)} onChange={() => toggleSelect(item.cartItemId)}/>
                                <div>
                                    <div className='text-muted small'>{item.accommodationName}</div>
                                    <strong>{item.roomName}</strong>
                            </div>
                        </div>
                            <button className='btn btn-sm btn-outline-danger' onClick={() => handleDelete(item.cartItemId)}>삭제</button>
                        </div>
                        <div className='mt-2 small text-muted'>
                            {item.checkInDate} ~ {item.checkOutDate} ㆍ 인원 {item.guestCount}명 ㆍ 객실 {item.roomQuantity}개
                        </div>
                        <div className='mt-2 text-end'>
                            <strong>{item.subtotal.toLocaleString()}원</strong>
                        </div>
                    </div>
                ))}

                <div className='d-felx justify-content-between align-items-center border-top pt-3 mt-3'>
                    <strong>선택 항목 합계 ({selectedIds.length}개)</strong>
                    <strong className='fs-5'>{selectedTotal.toLocaleString()}원</strong>
                </div>

                <button className='btn btn-primary w-100 mt-4' onClick={handleBooking} disabled={booking || selectedIds.length === 0}>
                    {booking ? '예약 처리 중...' : `선택 항목 예약하기 (${selectedIds.length}개)`}
                </button>
            </div>
        </div>
    );
};

export default CartPage;