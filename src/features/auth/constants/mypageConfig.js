export const MYPAGE_CONFIG = {
  // 디폴트 이미지
  defaultTripImg: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRsjoZjGWaHW5NPzC03S7GBwwZjzEa-b8EQrEzhHNokknqMav8Q7wviJn5N&s=10',

  // 기본 통계 더미 데이터
  defaultStats: {
    tripCount: 3,
    placeCount: 26,
    postCount: 5,
  },

  trips: [
    {
      id: 1,
      title: '제주 3박 4일 여행',
      date: '2026.08.10 ~ 08.13',
      img: 'https://i.namu.wiki/i/ojHqp__zShH8DrHiLD4u-6pWzPaRmZzxZq9irdz9E7nu5A-dlALcRKgP7vM5-o_smLj6x1zeaujT4uMw7Wuk8qkUBhHYnK5m8ZWBjHOdjds53_OgAI-CkYPr9VAcU1Eg-xqA7d-m_7nn400MNxCTGw.webp',
    },
    {
      id: 2,
      title: '부산 당일치기',
      date: '2026.07.22',
      img: 'https://i.namu.wiki/i/Z-oFu2D-bROKrk0JsWqgHmBFXzzsm7Qw7BPz7MM6grsADcXp_yWx9aOc-hZNF0-NZNa0y7qX8WdiPwRm_p4-yB52hbO9SQMlhufUUV35BMjZNB_grqxPvZKEGwGMn7Nf3kj9eufWR2Et9EN0lDvidA.webp',
    },
    {
      id: 3,
      title: '강릉 바다 여행',
      date: '2026.06.15 ~ 06.16',
      img: '',
    },
  ],

  // 가입 방식 뱃지 매핑
  providerBadge: {
    local: { label: '이메일 가입', className: 'badge-local' },
    kakao: { label: '카카오', className: 'badge-kakao' },
    naver: { label: '네이버', className: 'badge-naver' },
    google: { label: '구글', className: 'badge-google' },
  },

  // 연령대 라벨 매핑
  ageGroupLabel: {
    '10s': '10대',
    '20s': '20대',
    '30s': '30대',
    '40s': '40대',
    '50s': '50대 이상',
  },
};