const BASE_URL = "http://localhost:8080/api";

export async function fetchCart() {
    const res = await fetch(`${BASE_URL}/cart`);

    if(!res.ok) throw new Error("장바구니를 불러오지 못했습니다.");
    return res.json();
}

export async function addCartItem(roomId, checkInDate, checkOutDate, roomQuantity, guestCount) {
    const res = await fetch(`${BASE_URL}/cart/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json"},
        body: JSON.stringify({roomId, checkInDate, checkOutDate, roomQuantity, guestCount}),
    });
    if(!res.ok){
        const message = await res.text();
        throw new Error(message || "장바구니 담기에 실패했습니다.");
    }
}

export async function updateCartItem(cartItemId, checkInDate, checkOutDate, roomQuantity, guestCount){
    const res = await fetch(`${BASE_URL}/cart/items/${cartItemId}`, {
        method : "PATCH",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({checkInDate, checkOutDate, roomQuantity, guestCount}),
    });
    if(!res.ok){
        const message = await res.text();
        throw new Error(message || "장바구니 수정에 실패했습니다.");
    }
}

export async function deleteCartItem(cartItemId) {
    const res = await fetch (`${BASE_URL}/cart/items/${cartItemId}`, {
        method : "DELETE",
    });
    if(!res.ok){
        const message = await res.text();
        throw new Error(message || "장바구니 삭제에 실패했습니다.");
    }
}