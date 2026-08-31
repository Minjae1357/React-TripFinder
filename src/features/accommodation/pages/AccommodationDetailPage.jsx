import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchAccommodationDetail } from '../api/accommodationApi';
import AccommodationInfo from '../components/AccommodationInfo';
import RoomList from '../components/RoomList';
import AccommodationReviewSection from '../components/AccommodationReviewSection';

const AccommodationDetailPage = () => {
    const {accommodationId} = useParams();
    const [accommodation, setAccommodation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAccommodation = async () => {
            try {
                const data = await fetchAccommodationDetail(accommodationId);
                setAccommodation(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchAccommodation();
    }, [accommodationId]);

    if (loading) return <div>로딩 중...</div>;
    if (error) return <div>오류: {error}</div>;
    if (!accommodation) return <div>숙소를 찾을 수 없습니다.</div>;

    return (
        <div>
            <div className='d-flex justify-content-end mb-2'>
                <button className='btn btn-outline-primary btn-sm' onClick={()=>navigate('/cart')}>
                    <i className='bi bi-cart'></i> 내 장바구니
                </button>
            </div>
            <AccommodationInfo accommodation={accommodation} />
            <RoomList rooms={accommodation.rooms} />
            <AccommodationReviewSection accommodationId={accommodationId} />
            
        </div>
    );
};

export default AccommodationDetailPage;