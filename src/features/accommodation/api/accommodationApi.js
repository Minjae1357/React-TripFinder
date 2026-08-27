const BASE_URL = "http://localhost:8080/api";

// 상세 조회 api 응답
export async function fetchAccommodationDetail(accommodationId) {
    const res = await fetch(`${BASE_URL}/accommodations/${accommodationId}`);
    if (!res.ok) {
        throw new Error("숙소 정보를 불러오지 못했습니다.");
    }
    return res.json();
}
// 지도 마커용 숙소 간략 조회 api 응답
export async function fetchAccommodationList(){
    const res = await fetch(`${BASE_URL}/accommodations`);
    if (!res.ok) {
        throw new Error("숙소 목록을 불러오지 못했습니다.");
    }
    return res.json();
}