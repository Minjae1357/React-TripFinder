export const getDistanceInMeters = (lat1, lon1, lat2, lon2) => {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// 위도, 경도를 받아와서 두 지점 사이의 거리를 계산
//  단순하게 피타고라스의 정리를 사용하는 것이 아님
// 지구가 ‘구’ 형태임을 감안하여 ‘하버사인’이라는 공식을 이용해서 거리를 계산하여 반환