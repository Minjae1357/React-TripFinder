import { useState } from 'react';
import { addCartItem } from '../api/cartApi';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Carousel from 'react-bootstrap/Carousel';

const AccommodationRoomCard = ({room}) => {
    const [showForm, setShowForm] = useState(false);
    // 달력 사용 이전
    // const [checkInDate, setCheckInDate] = useState('');
    // const [checkOutDate, setCheckOutDate] = useState('');
    const [guestCount, setGuestCount] = useState(1);
    const [roomQuantity, setRoomQuntity] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [dateRange, setDateRange] = useState([null,null]);
    const [checkInDate, checkOutDate] = dateRange;

    const formatDate = (date) => {
        if(!date) return null;
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    }

    const handleAddToCart = async () => {
        
        if(!checkInDate || !checkOutDate){
            setError('체크인/체크아웃 날짜를 선택해주세요.');
            return;
        }
        if(checkInDate >= checkOutDate){
            setError('체크아웃 날짜는 체크인 날짜보다 뒤여야 합니다.');
            return;
        }
        if(guestCount > room.maxGuest){
            setError(`최대 인원은 ${room.maxGuest}명 입니다.`);
            return;
        }
        if(guestCount< 1){
            setError('인원은 1명 이상이어야 합니다.');
            return;
        }
        if(roomQuantity > room.totalRoomCount){
            setError(`남은 객실은 ${room.totalRoomCount}개 입니다.`);
            return;
        }
        setSubmitting(true);
        setError(null);
        try {
            await addCartItem(room.roomId, formatDate(checkInDate), formatDate(checkOutDate), roomQuantity, guestCount);
            alert('장바구니에 담았습니다.');
            setShowForm(false);
        } catch (error) {
            setError(error.message);
        }finally{
            setSubmitting(false);
        }
    };


    return (
        <div className='border rounded p-3 mb-3'>
            {room.imgUrls && room.imgUrls.length > 0 &&(
                <Carousel className='mb-2' interval={null} indicators={room.imgUrls.length>1} controls={room.imgUrls.length>1} style={{maxWidth: '300px', margin: '0 auto'}}>
                    {room.imgUrls.map((url, idx) => (
                        <Carousel.Item key={idx}>
                            <img src={url} alt={`${room.roomName} 이미지 ${idx + 1}`} className='w-100 mx-auto rounded d-block' style={{height: '200px', objectFit: 'cover'}}/>
                        </Carousel.Item>
                    ))}
                </Carousel>
            )}
            <h5>{room.roomName}</h5>
            <p className='mb-1'>{room.price.toLocaleString()}원 / 박</p>
            <p className='mb-1 text-muted'>최대 인원: {room.maxGuest}명 | 남은 객실: {room.totalRoomCount}개</p>
            {room.hasSpa && <span className='badge bg-info text-dark mb-2'>스파보유</span>}

            {!showForm ? (
                <button className='btn btn-primary btn-sm d-block mt-2' onClick={() => setShowForm(true)}>
                    장바구니에 담기
                </button>
            ) : (
                <div className='mt-2 p-2 border rounded bg-light'>
                    <label className='form-label form-label-sm mb-1'>체크인 - 체크아웃</label>
                    <div className='mb-2'>
                        <DatePicker
                            selectsRange
                            startDate={checkInDate}
                            endDate={checkOutDate}
                            onChange={(update) => setDateRange(update)}
                            minDate={new Date()}
                            dateFormat="yyyy-MM-dd"
                            placeholderText="날짜를 선택하세요."
                            className='form-control form-control-sm w-100'
                            wrapperClassName='w-100'
                            isClearable
                        />
                    </div>
                    {/* 달력 이전 방식 */}
                    {/* <div className='row g-2 mb-2'>
                        <div className='col'>
                            <label className='form-label form-label-sm mb-0'>체크인</label>
                            <input type='date' className='form-control form-control-sm' value={checkInDate} onChange={(e) => setCheckInDate(e.target.value)}/>
                        </div>
                        <div className='col'>
                            <label className='form-label form-label-sm mb-0'>체크아웃</label>
                            <input type='date' className='form-control form-control-sm' value={checkOutDate} onChange={(e) => setCheckOutDate(e.target.value)}/>
                        </div>
                    </div> */}
                    <div className='row g-2 mb-2'>
                        <div className='col'>
                            <label className='form-label form-label-sm mb-0'>인원</label>
                            <input type='number' min={1} max={room.maxGuest} className='form-control form-control-sm' value={guestCount} onChange={(e) => setGuestCount(Number(e.target.value))}/>
                        </div>
                        <div className='col'>
                            <label className='form-label form-label-sm mb-0'>객실 수</label>
                            <input type='number' min={1} max={room.totalRoomCount} className='form-control form-control-sm' value={roomQuantity} onChange={(e) => setRoomQuntity(Number(e.target.value))}/>
                        </div>
                    </div>
                    {error && <p className='text-danger small mb-2'>{error}</p>}
                    <button className='btn btn-primary btn-sm me-2' onClick={handleAddToCart} disabled={submitting}>
                        {submitting ? '담는 중...' : '담기'}
                    </button>
                    <button className='btn btn-outline-secondary btn-sm' onClick={() => setShowForm(false)}>
                        취소
                    </button>
                </div>
            )}
        </div>
    );
};

export default AccommodationRoomCard;