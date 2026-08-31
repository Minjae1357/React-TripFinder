import axiosInstance from "../../../api/axiosInstance";

// 상세 조회
export async function fetchAccommodationDetail(accommodationId) {
    try {
        const res = await axiosInstance.get(`/accommodations/${accommodationId}`);
        return res.data;
    } catch (error) {
        throw new Error(error.response?.data || "숙소 정보를 불러오지 못했습니다.", {cause:error});
    }
}
// 지도 마커용 숙소 간략 조회
export async function fetchAccommodationList(){
    try {
        const res = await axiosInstance.get('/accommodations');
        return res.data;
    } catch (error) {
        throw new Error(error.response?.data || "숙소 목록을 불러오지 못했습니다.", {cause:error});
    }
}
// 숙소 추천
export async function fetchRecommendations(region){
    try {
        const res = await axiosInstance.get('/accommodations/recommend', {params: { region}});
        return res.data;
    } catch (error) {
        throw new Error(error.response?.data || "숙소 추천을 불러오지 못했습니다.", {cause:error});
    }
}