import { useEffect, useState } from 'react';
import { fetchAccommodationReviews, fetchAccommodationReviewSummary } from '../api/accommodationReviewApi';
import AccommodationReviewSummary from './AccommodationReviewSummary';
import AccommodationReviewSortSelect from './AccommodationReviewSortSelect';
import AccommodationReviewCard from './AccommodationReviewCard';
import AccommodationPagination from './AccommodationPagination';
import { useNavigate } from 'react-router-dom';
import { checkBookingHistory } from '../api/bookingApi';

const AccommodationReviewSection = ({ accommodationId }) => {
    const [summary, setSummary] = useState(null);
    const [reviewsData, setReviewsData] = useState(null);
    const [sort, setSort] = useState("recommend");
    const [page, setPage] = useState(0);
    const navigate = useNavigate();
    const [hasBookingHistory, setHasBookingHistory] = useState(false);

    useEffect(() => {
        checkBookingHistory(accommodationId)
            .then(setHasBookingHistory)
            .catch(() => setHasBookingHistory(false)); // 비로그인이나 그 외 에러 시 권한 없음 처리
    }, [accommodationId]);

    useEffect(() => {
        fetchAccommodationReviewSummary(accommodationId).then(setSummary);
    }, [accommodationId]);

    useEffect(() => {
        fetchAccommodationReviews(accommodationId, sort, page).then(setReviewsData);
    }, [accommodationId, sort, page]);

    const handleSortChange = (newSort) => {
        setSort(newSort);
        setPage(0); // 정렬 바뀌면 1페이지로
    };

    const handleReviewDeleted = (deletedReviewId) => {
        setReviewsData((prev) => ({
            ...prev,
            reviews: prev.reviews.filter((review) => review.reviewId !== deletedReviewId),
        }));
        // 리뷰 삭제 후 summary도 갱신
        fetchAccommodationReviewSummary(accommodationId).then(setSummary);
        
    };
    
    if(!reviewsData || !summary) {
        return <div>리뷰 불러오는 중...</div>;
    }

    return (
        <section>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <AccommodationReviewSummary averageStar={summary.averageStar} reviewCount={summary.reviewCount} />
                <div className='d-flex align-items-center gap-2'>
                    <button className='btn btn-sm btn-primary' disabled={!hasBookingHistory} onClick={() => navigate(`/accommodation/${accommodationId}/review/new`)}>리뷰 작성</button>
                    <AccommodationReviewSortSelect value={sort} onChange={handleSortChange} />
                </div>
            </div>

            {reviewsData.reviews.map((review) => (
                <AccommodationReviewCard key={review.reviewId} review={review} accommodationId={accommodationId} onDelete={handleReviewDeleted} />
            ))}

            <AccommodationPagination
                currentPage={reviewsData.currentPage}
                totalPages={reviewsData.totalPages}
                onPageChange={setPage}
            />
        </section>
    );
};

export default AccommodationReviewSection;