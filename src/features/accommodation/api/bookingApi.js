import axiosInstance from "../../../api/axiosInstance";

export async function createBooking(cartItemIds){
    try{
        const res = await axiosInstance.post('/bookings', { cartItemIds});
        return res.data;
    }catch(error){
        throw new Error(error.response?.data || "예약에 실패했습니다.", {cause:error})
    }
}

export async function fetchMyBookings(){
    try {
        const res = await axiosInstance.get('/bookings');
        return res.data;
    } catch (error) {
        throw new Error(error.response?.data || "예약 목록을 불러오지 못했습니다.", {cause:error})
    }
}

export async function fetchBooking(bookingId){
    try {
        const res = await axiosInstance.get(`/bookings/${bookingId}`);
        return res.data;
    } catch (error) {
        throw new Error(error.response?.data || "예약 정보를 불러오지 못했습니다.", {cause:error})
    }
}

export async function cancelBooking(bookingId){
    try {
        await axiosInstance.patch(`/bookings/${bookingId}/cancel`);
    } catch (error) {
        throw new Error(error.response?.data || "예약 취소에 실패했습니다.", {cause:error})
    }
}

export async function deleteBooking(bookingId) {
    try {
        await axiosInstance.delete(`/bookings/${bookingId}`);
    } catch (error) {
        throw new Error(error.response?.data || "예약 목록 삭제에 실패했습니다.", {cause:error})
    }
}

export async function checkBookingHistory(accommodationId){
    try {
        const res = await axiosInstance.get('/bookings/check', {params: {accommodationId}});
        return res.data;
    } catch (error) {
        throw new Error(error.response?.data || "예약 이력 확인에 실패했습니다.", {cause:error})
    }
}