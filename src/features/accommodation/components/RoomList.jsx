import React from 'react';
import AccommodationRoomCard from './AccommodationRoomCard';

const RoomList = ({ rooms }) => {
    if(rooms.length === 0) {
        return <div>객실이 없습니다.</div>;
    }
    return (
        <section>
            <h3 className='mb-3'>객실 목록</h3>
            {rooms.map((room) => (
                <AccommodationRoomCard key={room.roomId} room={room} />
            ))}
        </section>
    );
};

// 장바구니 이전 사용
// function RoomCard({ room }) {
//     return (
//         <div>
//             {room.imgUrls[0] && <img src={room.imgUrls[0]} alt={room.roomName} />}
//             <h4>{room.roomName}</h4>
//             <p>가격: {room.price.toLocaleString()}원 / 박</p>
//             <p>최대 인원: {room.maxGuest}명 | 남은 객실 : {room.totalRoomCount}개</p>
//             {room.hasSpa && <p>스파 보유</p>}
//         </div>
//     );
// }

export default RoomList;