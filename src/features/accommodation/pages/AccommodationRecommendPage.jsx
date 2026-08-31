import { useState } from 'react';
import { fetchRecommendations } from '../api/accommodationApi';
import { useNavigate } from 'react-router-dom';

const REGIONS = ['서울', '부산', '제주', '강원', '경기', '대전', '대구', '광주', '충북', '충남', '경북', '경남', '전북', '전남']

const AccommodationRecommendPage = () => {
    const [selectedRegion, setSelectedRegion] = useState(null);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSelectRegion = async (region) => {
        setSelectedRegion(region);
        setLoading(true);
        try{
            const data = await fetchRecommendations(region);
            setResults(data);
        }finally{
            setLoading(false);
        }
    };

    return (
        <div className='container py-4' style={{maxWidth: '600px'}}>
            <h2 className='mb-3'>여행 숙소 추천</h2>
            <p className='text-muted'>지역을 선택하면 평점 좋은 숙소를 추천해드려요.</p>
            <div className='d-flex flex-wrap gap-2 mb-4'>
                {REGIONS.map((region) => (
                    <button key={region} className={`btn btn-sm ${selectedRegion === region ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => handleSelectRegion(region)}>
                        {region}
                    </button>
                ))}
            </div>
            
            {loading && <p>추천 숙소를 찾는 중입니다...</p>}

            {!loading && selectedRegion && results.length === 0 && (
                <p className='text-muted'>{selectedRegion} 지역에 등록된 숙소가 없습니다.</p>
            )}

            {results.map((item) => (
                <div key={item.accommodationId} className='border rounded p-3 mb-3' style={{cursor: 'pointer'}} onClick={() => navigate(`/accommodation/${item.accommodationId}`)}>
                    <div className='d-flex hustify-content-between align-items-start'>
                        <div>
                            <div className='text-muted small'>{item.accommodationType}ㆍ{item.region}</div>
                            <strong>{item.accommodationName}</strong>
                        </div>
                        <div className='text-end'>
                            <div>⭐ {(item.averageStar ?? 0).toFixed(1)}</div>
                            <div className='text-uted small'>후기 {item.reviewCount ?? 0}개</div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default AccommodationRecommendPage;