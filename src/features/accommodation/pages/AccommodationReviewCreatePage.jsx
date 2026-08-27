import {useEffect, useState} from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createReview, fetchOneAccommodationReview, updateReview } from '../api/accommodationReviewApi';
import StarRatingInput from '../components/StarRatingInput';

const AccommodationReviewCreatePage = () => {
    const {accommodationId, reviewId} = useParams(); // reviewId가 있으면 수정 모드, 없으면 작성 모드
    const navigate = useNavigate();
    const isEditMode = !!reviewId; // reviewId가 존재하면 수정 모드로 간주

    const [star, setStar] = useState(5);
    const [reviewContents, setReviewContents] = useState('');
    const [imageFiles, setImageFiles] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(isEditMode); // 수정 모드일 때 기존 리뷰 데이터를 불러오기 위해 로딩 상태를 추가
    const [error, setError] = useState(null);

    useEffect(() => {
        if(!isEditMode) return; // 작성 모드이면 기존 리뷰 데이터를 불러올 필요 없음
        fetchOneAccommodationReview(accommodationId, reviewId).then((data) => {
            setStar(data.star);
            setReviewContents(data.reviewContents);
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }, [accommodationId, reviewId, isEditMode]);

    const handleFileChange = (e) => {
        setImageFiles(Array.from(e.target.files));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        try {
            if (isEditMode) {
                // 수정 모드일 때는 updateReview API 호출
                await updateReview(accommodationId, reviewId, star, reviewContents);
            } else {
                // 작성 모드일 때는 createReview API 호출
                await createReview(accommodationId, star, reviewContents, imageFiles);
            }
            navigate(`/accommodation/${accommodationId}`);
        }catch (err) {
            setError(err.message);
        }finally {
            setSubmitting(false);
        }
    };

    if(loading) {
        return <div className="container py-4">리뷰 데이터를 불러오는 중...</div>;
    }

    return (
        <form onSubmit={handleSubmit} className="container py-4" style={{ maxWidth: '480px' }}>
            <h2 className="mb-3">{isEditMode ? '리뷰 수정' : '리뷰 작성'}</h2>
            <div className="mb-3">
                <label className="form-label d-block">별점</label>
                <StarRatingInput value={star} onChange={setStar} />
            </div>
            <div className="mb-3">
                <label className="form-label">리뷰 내용</label>
                <textarea
                    className="form-control"
                    value={reviewContents}
                    onChange={(e) => setReviewContents(e.target.value)}
                    rows="4"
                    required
                />
            </div>
            {/* 이미지 추가는 신규 작성만 지원( 수정 이미지 변경은 추후 구현 예정) */}
            {!isEditMode && (
                <div className="mb-3">
                    <label className="form-label">사진 첨부 (선택, 여러 장 가능)</label>
                    <input
                        type="file"
                        className="form-control"
                        accept="image/*"
                        multiple onChange={handleFileChange}
                    />
            </div>
            )}
            {error && <div className="text-danger">{error}</div>}
            <button
                type="submit"
                className="btn btn-primary w-100"
                disabled={submitting}
            >
                {submitting ? '등록 중...' : isEditMode ? '수정 완료' : '리뷰 등록'}
            </button>
        </form>
    );
};

export default AccommodationReviewCreatePage;