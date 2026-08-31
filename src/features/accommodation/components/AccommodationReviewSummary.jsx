import React from 'react';

// 평균 별점, 리뷰 개수 표시
const AccommodationReviewSummary = ({ averageStar, reviewCount }) => {
    return (
        <div>
            <strong>* {averageStar.toFixed(1)}</strong>
            <span>({reviewCount}개의 후기)</span>
        </div>
    );
};

export default AccommodationReviewSummary;