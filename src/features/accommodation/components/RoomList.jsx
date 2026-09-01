
import AccommodationRoomCard from './AccommodationRoomCard';

const RoomList = ({ rooms }) => {
  if (!rooms || rooms.length === 0) {
    return (
      <>
        <style>{`
          .room-list-empty {
            padding: 40px 20px;
            text-align: center;
            background: var(--muted, #F8FAFC);
            border: 1px dashed var(--border, #E2E8F0);
            border-radius: 12px;
            color: var(--muted-foreground, #64748B);
            font-size: 14.5px;
          }
        `}</style>
        <div className="room-list-empty">
          <p>등록된 객실 정보가 없습니다.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{`
        .room-list-container {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .room-list-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 4px;
        }

        .room-list-header h3 {
          font-family: 'Outfit', sans-serif;
          font-size: 20px;
          font-weight: 800;
          color: var(--foreground, #0F172A);
          margin: 0;
        }

        .room-total-count {
          font-size: 13.5px;
          font-weight: 600;
          color: var(--primary, #1D4ED8);
        }
      `}</style>

      <section className="room-list-container">
        <div className="room-list-header">
          <h3>객실 목록</h3>
          <span className="room-total-count">총 {rooms.length}개 객실</span>
        </div>

        {rooms.map((room) => (
          <AccommodationRoomCard key={room.roomId} room={room} />
        ))}
      </section>
    </>
  );
};

export default RoomList;