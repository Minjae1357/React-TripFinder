const BASE_URL = "http://localhost:8080/api";

export async function createBooking(cartItemIds){
    const res = await fetch(`${BASE_URL}/bookings`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({cartItemIds}),
    });
    if(!res.ok){
        const message = await res.text();
        throw new Error(message || "예약에 실패했습니다.");
    }
    return res.json();
}

export async function fetchMyBookings(){
    const res = await fetch(`${BASE_URL}/bookings`);
    if(!res.ok) throw new Error("예약 목록을 불러오지 못했습니다.");
    return res.json();
}

export async function fetchBooking(bookingId){
    const res = await fetch(`${BASE_URL}/bookings/${bookingId}`);
    if(!res.ok) throw new Error("예약 정보를 불러오지 못했습니다.");
    return res.json();
}

export async function cancelBooking(bookingId){
    const res = await fetch(`${BASE_URL}/bookings/${bookingId}/cancel`, {
        method: "PATCH",
    });
    if(!res.ok){
        const message = await res.text();
        throw new Error(message || "예약 취소에 실패했습니다.");
    }
}

export async function deleteBooking(bookingId) {
    const res = await fetch(`${BASE_URL}/bookings/${bookingId}`,{
        method: "DELETE",
    });
    if(!res.ok){
        const message = await res.text();
        throw new Error(message || "예약 목록 삭제에 실패했습니다.");
    } 
}

export async function checkBookingHistory(accommodationId){
    const res = await fetch(`${BASE_URL}/bookings/check?accommodationId=${accommodationId}`);
    if (!res.ok) throw new Error("예약 이력 확인에 실패했습니다.");
    return res.json();
}