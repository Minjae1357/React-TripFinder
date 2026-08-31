const BASE_URL = "http://localhost:8080/api";

// 숙소 리뷰 조회 api 응답
export async function fetchAccommodationReviews(accommodationId, sort, page, size = 5) {
    const res = await fetch(`${BASE_URL}/accommodations/${accommodationId}/reviews?sort=${sort}&page=${page}&size=${size}`);
    if (!res.ok) {
        throw new Error("숙소 리뷰를 불러오지 못했습니다.");
    }
    return res.json();
}

// 숙소 리뷰 단건 조회 api 응답
export async function fetchOneAccommodationReview(accommodationId, reviewId) {
    const res = await fetch(`${BASE_URL}/accommodations/${accommodationId}/reviews/${reviewId}`);
    if (!res.ok) {
        throw new Error("숙소 리뷰를 불러오지 못했습니다.");
    }
    return res.json();
}

// 숙소 리뷰 평점 및 개수 조회 api 응답
export async function fetchAccommodationReviewSummary(accommodationId) {
    const res = await fetch(`${BASE_URL}/accommodations/${accommodationId}/reviews/summary`);
    if (!res.ok) {
        throw new Error("숙소 리뷰 평점 및 개수 정보를 불러오지 못했습니다.");
    }
    return res.json();
}

// 숙소 리뷰 작성 api 요청
export async function createReview(accomodationId, star, reviewContents, imageFiles){
    const formData = new FormData();

    const reviewBlob = new Blob([JSON.stringify({ star, reviewContents })], { type: 'application/json' });
    formData.append('review', reviewBlob);

    imageFiles.forEach((file) => {
        formData.append('images', file);
    });
    const res = await fetch(`${BASE_URL}/accommodations/${accomodationId}/reviews`, {
        method: 'POST',
        body: formData,
    });
    if (!res.ok) {
        throw new Error("리뷰 작성에 실패했습니다.");
    }
    return res.json();
}

// 숙소 리뷰 수정 api 요청
export async function updateReview(accommodationId, reviewId, star, reviewContents) {
    const res = await fetch(`${BASE_URL}/accommodations/${accommodationId}/reviews/${reviewId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ star, reviewContents }),
    });
    if (!res.ok) {
        const message = await res.text();
        throw new Error(message || "리뷰 수정에 실패했습니다.");
    }
}

// 숙소 리뷰 삭제 api 요청
export async function deleteReview(accommodationId, reviewId) {
    const res = await fetch(`${BASE_URL}/accommodations/${accommodationId}/reviews/${reviewId}`, {
        method: 'DELETE',
    });
    if (!res.ok) {
        throw new Error("리뷰 삭제에 실패했습니다.");
    }
}