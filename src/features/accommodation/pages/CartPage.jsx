import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { deleteCartItem, fetchCart } from '../api/cartApi';
import { createBooking } from '../api/bookingApi';
import './CartPage.css';

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
        setSelectedIds(data?.items ? data.items.map((item) => item.cartItemId) : []); // 전체 선택 기본값
      })
      .catch((error) => {
        console.error(error.message);
        setError(error.message);
      })
      .finally(() => setLoading(false));
  };

  const handleDelete = async (cartItemId) => {
    if (!window.confirm('장바구니에서 삭제하시겠습니까?')) return;
    await deleteCartItem(cartItemId);
    loadCart(); // 삭제 후에 목록, 합계 재조회
  };

  const toggleSelect = (cartItemId) => {
    setSelectedIds((prev) =>
      prev.includes(cartItemId) ? prev.filter((id) => id !== cartItemId) : [...prev, cartItemId]
    );
  };

  // 선택된 항목들의 금액만 합산
  const selectedTotal = cart
    ? cart.items
        .filter((item) => selectedIds.includes(item.cartItemId))
        .reduce((sum, item) => sum + item.subtotal, 0)
    : 0;

  const handleBooking = async () => {
    if (selectedIds.length === 0) {
      alert('예약할 항목을 선택해주세요.');
      return;
    }
    if (!window.confirm(`선택한 ${selectedIds.length}개 항목을 예약하시겠습니까?`)) return;

    setBooking(true);
    try {
      const bookingId = await createBooking(selectedIds);
      navigate(`/bookings/${bookingId}`); // 예약 완료 후 상세 페이지로 이동
    } catch (error) {
      alert(error.message);
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="cart-page">
        <div className="cart-state-card">
          <div className="cart-spinner" />
          <p>장바구니를 불러오는 중입니다...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cart-page">
        <div className="cart-state-card">
          <span className="state-icon">⚠️</span>
          <p className="text-danger">{error}</p>
          <button className="btn-state-action" onClick={() => navigate('/accommodation')}>
            숙소 둘러보기
          </button>
        </div>
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="cart-page">
        <div className="cart-state-card">
          <span className="state-icon"></span>
          <p>장바구니가 비어있습니다.</p>
          <button className="btn-state-action" onClick={() => navigate('/recommend')}>
            숙소 둘러보기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-inner">
        {/* 헤더 & 내 예약 목록 링크 */}
        <div className="cart-header">
          <div>
            <h1>장바구니</h1>
            <p>선택하신 숙소 객실을 확인하고 예약을 진행해 보세요</p>
          </div>
          <button className="btn-booking-nav" onClick={() => navigate('/bookings')}>
            내 예약 목록 →
          </button>
        </div>

        {/* 장바구니 아이템 리스트 */}
        <div className="cart-items-wrapper">
          {cart.items.map((item) => {
            const isChecked = selectedIds.includes(item.cartItemId);

            return (
              <div
                key={item.cartItemId}
                className={`cart-item-card ${isChecked ? 'cart-item-selected' : ''}`}
              >
                <div className="cart-item-top">
                  <label className="checkbox-wrap">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleSelect(item.cartItemId)}
                    />
                    <div className="item-title-info">
                      <span className="item-hotel-title">{item.accommodationName}</span>
                      <strong className="item-room-title">{item.roomName}</strong>
                    </div>
                  </label>

                  <button
                    type="button"
                    className="btn-cart-item-del"
                    onClick={() => handleDelete(item.cartItemId)}
                  >
                    삭제
                  </button>
                </div>

                <div className="cart-item-details">
                  <span>
                    {item.checkInDate} ~ {item.checkOutDate} ㆍ 인원 {item.guestCount}명 ㆍ 객실 {item.roomQuantity}개
                  </span>
                </div>

                <div className="cart-item-price-row">
                  <span className="price-label">금액</span>
                  <strong className="price-val">{item.subtotal.toLocaleString()}원</strong>
                </div>
              </div>
            );
          })}
        </div>

        {/* 결제 요약 카드 */}
        <div className="cart-summary-card">
          <div className="summary-amount-line">
            <span className="summary-label">
              선택 항목 합계 (<strong>{selectedIds.length}</strong>개)
            </span>
            <strong className="summary-total">{selectedTotal.toLocaleString()}원</strong>
          </div>

          <button
            type="button"
            className="btn-checkout"
            onClick={handleBooking}
            disabled={booking || selectedIds.length === 0}
          >
            {booking ? '예약 처리 중...' : `선택 항목 예약하기 (${selectedIds.length}개)`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;