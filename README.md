# ✈️ TripFinder (Frontend)

여행 추천 커뮤니티 **TripFinder**의 React 프론트엔드입니다.  
2026.08 ~ 2026.09 · 팀 프로젝트 · 백엔드: [TripFinder](https://github.com/Minjae1357/TripFinder)

`React 19` `Vite` `React Router` `Zustand` `Axios`

<br>

## 화면 구성

| 영역 | 경로 |
|---|---|
| 로그인·회원가입 | `/login`, `/signup`, `/oauth2/success` (소셜 로그인 완료) |
| 커뮤니티 게시판 | `/board`, `/board/write`, `/board/:boardId`, `/board/:boardId/edit` |
| 숙소·리뷰 | `/accommodation/:accommodationId`, 리뷰 작성·수정 |
| 장바구니·예약 | `/cart`, `/bookings`, `/bookings/:bookingId` |
| 장소·추천·일정 | `/place`, `/placeinfo/:id`, `/recommend`, `/planner` |
| 마이페이지 | `/mypage` |

<br>

## 내 담당: 로그인·회원가입·게시판 화면과 공통 인증

- **공통 인증 구조**
  - `store/authStore.js`: Zustand로 로그인 상태와 Access Token 관리
  - `api/axiosInstance.js`: 요청마다 `Authorization: Bearer` 헤더를 자동으로 붙이는 공통 axios 인스턴스
  - `routes/AppRouter.jsx`: 라우터 구성
- **로그인·회원가입** (`features/auth`)
  - 이메일 인증번호 발송·확인을 거치는 회원가입
  - 이메일 로그인, 카카오·구글·네이버 소셜 로그인 후 토큰을 받아 오는 `OAuthSuccessPage`
- **게시판** (`features/community`)
  - 목록·상세·작성·수정 화면, 이미지 첨부
  - 댓글·대댓글(`CommentSection`), 좋아요

숙소·리뷰·장바구니·예약·장소·추천 화면은 팀원이 맡았습니다.

<br>

## 폴더 구조

```
src/
├─ api/          axiosInstance.js (공통 요청 설정)
├─ store/        authStore.js (로그인 상태)
├─ routes/       AppRouter.jsx
└─ features/     도메인별로 api · hooks · pages · components
   ├─ auth/        로그인·회원가입·마이페이지
   ├─ community/   게시판·홈
   ├─ accommodation/
   ├─ place/  map/  recommend/
```

<br>

## 실행 방법

```bash
npm install
npm run dev
```

백엔드([TripFinder](https://github.com/Minjae1357/TripFinder))가 실행 중이어야 합니다.
