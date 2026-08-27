import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchAccommodationDetail } from '../api/accommodationApi';
import AccommodationInfo from '../components/AccommodationInfo';
import RoomList from '../components/RoomList';
import AccommodationReviewSection from '../components/AccommodationReviewSection';

const AccommodationDetailPage = () => {
    const {accommodationId} = useParams();
    const [accommodation, setAccommodation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
            <AccommodationInfo accommodation={accommodation} />
            <RoomList rooms={accommodation.rooms} />
            <AccommodationReviewSection accommodationId={accommodationId} />
            
        </div>
    );
};

export default AccommodationDetailPage;