import axiosInstance from "../../../api/axiosInstance";

// 숙소 리뷰 조회
export async function fetchAccommodationReviews(accommodationId, sort, page, size = 5) {
    try {
        const res = await axiosInstance.get(`/accommodations/${accommodationId}/reviews`, {
            params: {sort,page,size},
        });
        return res.data;
    } catch (error) {
        throw new Error(error.response?.data || "숙소 리뷰를 불러오지 못했습니다.", {cause:error});
    }
}

// 숙소 리뷰 단건 조회
export async function fetchOneAccommodationReview(accommodationId, reviewId) {
    try {
        const res = await axiosInstance.get(`/accommodations/${accommodationId}/reviews/${reviewId}`);
        return res.data;
    } catch (error) {
        throw new Error(error.response?.data || "숙소 리뷰를 불러오지 못했습니다.", {cause:error});
    }
}

// 숙소 리뷰 평점 및 개수 조회
export async function fetchAccommodationReviewSummary(accommodationId) {
    try {
        const res = await axiosInstance.get(`/accommodations/${accommodationId}/reviews/summary`);
        return res.data;
    } catch (error) {
        throw new Error(error.response?.data || "숙소 리뷰 평점 및 개수 정보를 불러오지 못했습니다.", {cause:error});
    }
}

// 숙소 리뷰 작성
export async function createReview(accomodationId, star, reviewContents, imageFiles){
    const formData = new FormData();
    const reviewBlob = new Blob([JSON.stringify({ star, reviewContents })], { type: 'application/json' });
    formData.append('review', reviewBlob);

    imageFiles.forEach((file) => {
        formData.append('images', file);
    });
    
    try {
        const res = await axiosInstance.post(`/accommodations/${accomodationId}/reviews`, formData, {
            headers: { 'Content-Type': 'multipart/form-data'},
        });
        return res.data;
    } catch (error) {
        throw new Error(error.response?.data || "리뷰 작성에 실패했습니다..", {cause:error});
    }
}

// 숙소 리뷰 수정
export async function updateReview(accommodationId, reviewId, star, reviewContents) {
    try {
        await axiosInstance.patch(`/accommodations/${accommodationId}/reviews/${reviewId}`, {star, reviewContents});
    } catch (error) {
        throw new Error(error.response?.data || "리뷰 수정에 실패했습니다.", {cause:error});
    }
}

// 숙소 리뷰 삭제 api 요청
export async function deleteReview(accommodationId, reviewId) {
    try {
        await axiosInstance.delete(`/accommodations/${accommodationId}/reviews/${reviewId}`);
    } catch (error) {
        throw new Error(error.response?.data || "리뷰 삭제에 실패했습니다.", {cause:error});
    }
}