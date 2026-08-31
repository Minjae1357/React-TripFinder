import axiosInstance from "../../../api/axiosInstance";

export async function fetchCart() {
    try {
        const res = await axiosInstance.get('/cart');
        return res.data;
    } catch (error) {
        const data = error.response?.data;
        const message = typeof data === 'string' ? data : (data?.message || "장바구니를 불러오지 못했습니다.");
        throw new Error(message , {cause:error});
    }
}

export async function addCartItem(roomId, checkInDate, checkOutDate, roomQuantity, guestCount) {
    try {
        await axiosInstance.post('/cart/items', {roomId, checkInDate, checkOutDate, roomQuantity, guestCount});
    } catch (error) {
        const data = error.response?.data;
        const message = typeof data === 'string' ? data : (data?.message || "장바구니 담기에 실패했습니다.");
        throw new Error(message, {cause: error});
    }
}

export async function updateCartItem(cartItemId, checkInDate, checkOutDate, roomQuantity, guestCount){
    try {
        await axiosInstance.patch(`/cart/items/${cartItemId}`, {checkInDate, checkOutDate, roomQuantity, guestCount});
    } catch (error) {
        throw new Error(error.response?.data || "장바구니 수정에 실패했습니다.", {cause:error});
    }
}

export async function deleteCartItem(cartItemId) {
    try {
        await axiosInstance.delete(`/cart/items/${cartItemId}`);
    } catch (error) {
         throw new Error(error.response?.data || "장바구니 삭제에 실패했습니다.", {cause:error})
    }
}