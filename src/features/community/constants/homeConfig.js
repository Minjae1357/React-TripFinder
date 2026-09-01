import mapIcon from '../../../assets/icons/mapIcon.png';
import hotelIcon from '../../../assets/icons/hotelIcon.jpeg';
import plannerIcon from '../../../assets/icons/plannerIcon.png';

export const HOME_CONFIG = {
  // 1. Hero 배너 데이터
  hero: {
    badge: '나만의 스마트 여행 메이트',
    titleMain: '나만의 완벽한',
    titleSub: '여행을 찾아드립니다',
    description: '여행지 탐색부터 숙소 예약, 일정 계획까지 한 번에 완성하세요.',
    bgImages: [
      'https://i.namu.wiki/i/cKWJsISk8DcyOUKqvvEve3SfwsKYVbMHDTRRJCbLrbOZV__Rc2Dgpt8rY-yeBAGxBMA3dDvfvPfTyfWrcxrtjuc4V1HXmkNTIyPBSaqpic7a5h3OTZlIyXwb2ct4BjlITej_seMirapfOHzJP8WQXg.webp', // 홍대거리
      'https://i.namu.wiki/i/iOSbtnO6O2AHiFLCEcMJphZP2MO1rOhOPDg-Pi0mKyMkEC19_UJADpb-nKvj0wSC8tmd1b6X_OaPfZyNvYp-DCahbRMW2IPi9mBgcVdNzl-Fthw2unK2o0a18IVqRdoimNiLqKbRh9_aOOfQwDIbBg.webp', // 청계광장
      'https://i.namu.wiki/i/zqI99ZvcXJ5-V62SthiwpvF6rfZjDOIPY1IdlqVUwsytO5S1EAzB-fppZ2QuCMcCP0lT4lVm52QqBWSOGopqWQ.bmp', // 석촌호수
      'https://i.namu.wiki/i/4SBPJ5Nmav4_shDlhIyrWNrP42DmrNyVXibEILsqrjp2JYs4Hckq7IaKDWmdtxpJiAv5lSQh794VU_KrZupCt5cAgMnrMbW6kJTmaOEwGpfl-7MfyPUjWrsdPrMF9dC8bEmo-24bwKqIhhUoCxt-mg.webp', // 설악산
      'https://i.namu.wiki/i/rLxP1D1y9cqczNF0OyZxvjeePyaHdZ0VnsJazJ6331li8ZjThvs43Dum2mj3RXSoH1lD0hYwyiiFtzvf7H04__BQoP6BWWOWz9pkW_MDC2Gkcc57Y6rwg7vu-a-lM7JDka0-JQJKhDhrOGs-lEIcZg.webp', // 해미읍성
      'https://i.namu.wiki/i/uC53eTtffI1uaZm2wJMmwtSaG2pvhJbOa07ZPLLyejhJ36c_gY9hRqI2-rSNfB4bQELs1nDMyRjaAk_V3QfvFgbch0dLTyNRPE8hoUyQJCVc41jyXCjAW7YbkB4CRLHuoJ7dVAD1adhKZo2og_B9vg.webp', // 한옥마을
      'https://i.namu.wiki/i/YB51ICmyWKAViHxI0UXLxjnsYFAo2cQ-CE3cfw2jkqkeOYAem9Bqgs60J1wddR8Oo7ZEP5U-xPQEr5I7I9AIS2OBuSJMqhcUIkbfkj5Acxs5JbA7H9o8Q1aK2XpXAhxjUls4dMu9PhEq5G9xVrybcw.webp', // 불국사 다보탑
      'https://i.namu.wiki/i/FZctCJFyJ2WJXL-tdnS7lt3D-QBnC284YTmK0fjkJuzJCzSZwNeZtNIMuK0KRo0DRVRVdZ3jBkh-3sq8rx9JRkYoL1XqF164elOjn5mjSf0DdkaFfcRZgNeST-Chj67kWBMChEexKQMell-HB8jqyA.webp', // 자갈치 시장
      'https://i.namu.wiki/i/huwboK99iP2DGZkDsU4mNMGJQuMGeXDK5PRrJRzQvhfuYmPaxjvBGTn1Gycn7U4w8kMXnRzI1S9a9zq7cLxPVeKtp_ZNTAY8FIjQLo5BI1vaMqAzfLBe3fJH5YXXhnniREKiGzNlXGujeYA0gXy45g.webp', // 성산일출봉
      'https://i.namu.wiki/i/CDqEXXRAeu8Libsxs1jR7jal1k3h6R7bnepqwUHi-sS3fE6GOfIssJUbI2o5-ol0zpefQlTP4U6jnCW-JI1ATuGirrxRqegVP3cNXhcFpgew69yaw3kdqgzdKczwLcc5IGHq4FAUHbxZhHBUZ-pwtQ.webp', // 경복궁
    ],
    ctaPrimary: { label: '장소 탐색 시작', path: '/place' },
    ctaSecondary: { label: '숙소 추천 받기', path: '/recommend' },
  },

  // 2. 핵심 기능 리스트 (이미지 import 연결)
  featuresSection: {
    label: 'TripFinder 핵심 기능',
    title: '여행의 모든 순간을 스마트하게',
    items: [
      {
        icon: mapIcon,
        title: '스마트 장소 탐색',
        desc: '취향과 동선에 맞는 맞춤 장소를 한눈에 탐색합니다',
        link: '/place',
      },
      {
        icon: hotelIcon,
        title: '최적 숙소 추천',
        desc: '위치·가격·평점을 바탕으로 딱 맞는 숙소를 찾아드립니다',
        link: '/recommend',
      },
      {
        icon: plannerIcon,
        title: '맞춤 일정 플래너',
        desc: '최적 경로와 경비를 분석해 여행 일정을 자동 완성합니다',
        link: '/planner',
      },
    ],
  },

  // 3. 인기 여행지 큐레이션
  placesSection: {
    label: '인기 여행지',
    title: '지금 뜨는 장소',
    items: [
      {
        id: 1,
        name: '경복궁',
        city: '서울',
        img: 'https://i.namu.wiki/i/CDqEXXRAeu8Libsxs1jR7jal1k3h6R7bnepqwUHi-sS3fE6GOfIssJUbI2o5-ol0zpefQlTP4U6jnCW-JI1ATuGirrxRqegVP3cNXhcFpgew69yaw3kdqgzdKczwLcc5IGHq4FAUHbxZhHBUZ-pwtQ.webp',
        tag: '역사',
      },
      {
        id: 2,
        name: '성산일출봉',
        city: '제주',
        img: 'https://i.namu.wiki/i/huwboK99iP2DGZkDsU4mNMGJQuMGeXDK5PRrJRzQvhfuYmPaxjvBGTn1Gycn7U4w8kMXnRzI1S9a9zq7cLxPVeKtp_ZNTAY8FIjQLo5BI1vaMqAzfLBe3fJH5YXXhnniREKiGzNlXGujeYA0gXy45g.webp',
        tag: '자연',
      },
      {
        id: 3,
        name: '해운대 해수욕장',
        city: '부산',
        img: 'https://i.namu.wiki/i/8eX2zcnPo5Qps2tSnncPpFx4X5fuBBAUkavri5iGts4Rgqykr7BmpVupfK7As27FRzV_BjO7Chgy79bRHDyF0n_Z5AdaP-3lkN1tFbCdfrNBqx0edQhnF8Nc5t0LajgfWeJejpMLEEyOwDK4Gk_ffA.webp',
        tag: '해변',
      },
    ],
  },

  // 4. 커뮤니티 최신 게시글
  communitySection: {
    label: '커뮤니티',
    title: '여행자들의 이야기',
    items: [
      {
        id: 1,
        title: '제주도 3박 4일 완벽 코스 공유합니다',
        author: '여행왕김',
        date: '2026.08.28',
        views: 1240,
        likes: 88,
      },
      {
        id: 2,
        title: '서울 핫플 카페 투어 5곳 추천',
        author: '카페러버',
        date: '2026.08.27',
        views: 890,
        likes: 64,
      },
      {
        id: 3,
        title: '부산 당일치기 여행기 - 해운대부터 광안리까지',
        author: '부산소년',
        date: '2026.08.26',
        views: 752,
        likes: 51,
      },
    ],
  },

  // 5. 하단 CTA 배너
  ctaBanner: {
    title: '지금 바로 여행을 계획해보세요',
    description: 'TripFinder와 함께라면 어디든 완벽한 여행지가 됩니다',
    btnLabel: '숙소 추천 받기 →',
    btnPath: '/recommend',
  },
};