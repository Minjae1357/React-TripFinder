import { useState } from 'react';
import Carousel from 'react-bootstrap/Carousel';
import { formatDateTime } from '../utils/dateFormat';
import { TEMP_USER_ID } from '../constants/tempAuth';
import { deleteReview } from '../api/accommodationReviewApi';
import { useNavigate } from 'react-router-dom';

// 리뷰 카드 컴포넌트
const AccommodationReviewCard = ({ review, accommodationId, onDelete }) => {
    const [expanded, setExpanded] = useState(false);
    const isEdited = new Date(review.updatedAt) - new Date(review.createdAt) > 60000; // 1분 이상 차이나면 수정된 것으로 간주
    const isOwner = review.userId === TEMP_USER_ID; // 작성자 본인 리뷰인지 확인(임시 사용자 ID 사용)
    const navigate = useNavigate();

    // 줄바꿈 개수가 3줄을 넘는지 확인
    const lineCount = review.reviewContents.split('\n').length;
    const isLongContent = review.reviewContents.length > 100 || lineCount > 3;

    const handleEdit = () => {
        navigate(`/accommodation/${accommodationId}/review/${review.reviewId}/edit`);
    
    };
    const handleDelete = async () => {
        if (!window.confirm('정말로 이 리뷰를 삭제하시겠습니까?')) return; 
        await deleteReview(accommodationId, review.reviewId);
        onDelete(review.reviewId); // 삭제 후 부모 컴포넌트에 알려서 목록 갱신
    };

    return (
        <div className="border-bottom py-3">
            {/* 별점, 날짜 */}
            <div className="d-flex justify-content-between align-items-start mb-1">
                <div>
                    {[1, 2, 3, 4, 5].map((starNumber) => (
                    <i
                        key={starNumber}
                        className={starNumber <= review.star ? 'bi bi-star-fill' : 'bi bi-star'}
                        style={{ fontSize:'16px', color: starNumber <= review.star ? '#ffc107' : '#ccc', marginRight: '2px' }}
                    />
                ))}
                </div>
                <div className='text-end'>
                    <div>
                        <small className='text-muted'>{formatDateTime(review.createdAt)}</small>
                    </div>
                {isEdited &&(
                    <div>
                        <small className="text-muted">수정됨 : {formatDateTime(review.updatedAt)}</small>
                    </div>
                )}
                </div>
                
            </div>
            
            {/* 리뷰 본문 - 3줄만 보이고 더보기 */}
            <p className="mb-1" style={expanded ? {whiteSpace: 'pre-line', overflowWrap: 'break-word'} : {display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', whiteSpace: 'pre-line', overflowWrap: 'break-word'}}>
                {review.reviewContents}
            </p>
            {isLongContent && (
                <button className="btn btn-link btn-sm p-0 mb-2" onClick={() => setExpanded(!expanded)}>
                    {expanded ? "접기" : "더보기"}
                </button>
            )}
            {review.reviewImgUrls.length > 0 && (
                <Carousel
                    style={{width: '160px'}}
                    interval={null} // 자동 슬라이드 비활성화
                    indicators={review.reviewImgUrls.length > 1} // 이미지가 2개 이상일 때만 하단 점 표시
                    controls={review.reviewImgUrls.length > 1}  // 이미지가 2개 이상일 때만 좌우 컨트롤 표시
                >
                    {review.reviewImgUrls.map((url,idx) => (
                        <Carousel.Item key={idx}>
                            <img
                                src={url}
                                alt={`Review Image ${idx + 1}`}
                                className="w-100 rounded"
                                style={{objectFit: 'cover', height: '160px'}}
                            />
                        </Carousel.Item>
                    ))}
                </Carousel>
            )}
            {/* 수정/삭제 버튼 - 작성자 본인만 보이도록 */}
            {isOwner && (
                <div className="mt-2">
                    <button className="btn btn-outline-secondary btn-sm me-2" onClick={handleEdit}>수정</button>
                    <button className="btn btn-outline-danger btn-sm" onClick={handleDelete}>삭제</button>
                </div>
            )}
        </div>
    );
};

export default AccommodationReviewCard;