import axiosInstance from '@/api/axiosInstance';
import axios from 'axios';

export const SERVER_BASE_URL = 'http://localhost:8080';

// 게시글 목록 조회 (category: 'NOTICE | 'REVIEW | null(전체보기)) 
export const getBoardList = (category) => {
    return axiosInstance.get('/board',{params : category ? {category} : {}});
};

// 게시글 상세 조회
export const getBoard = (boardId) => {
    return axiosInstance.get(`/board/${boardId}`);
};

// 게시글 작성
export const createBoard = (data) => {
    // data : {category,title,contents,imgUrls}
    return axiosInstance.post('/board',data);
};

// 게시글 수정
export const updateBoard = (boardId, data) =>{
    // data : { title , contents }
    return axiosInstance.put(`/board/${boardId}`,data);
};

// 게시글 삭제
export const deleteBoard = (boardId) => {
    return axiosInstance.delete(`/board/${boardId}`);
};

// 좋아요 토글
export const toggleLike = (boardId) => {
    return axiosInstance.post(`/board/${boardId}/like`);
};

// 좋아요 개수 + 내가 눌렀는지 여부
export const getLikeInfo = (boardId) => {
    return axiosInstance.get(`/board/${boardId}/like`);
};

// 댓글 목록 조회
export const getComments = (boardId) => {
    return axiosInstance.get(`/board/${boardId}/comments`);
};

// 댓글/대댓글 작성(parentId 없으면 일반 댓글)
export const createComment = (boardId,data) => {
    return axiosInstance.post(`/board/${boardId}/comments`,data);
};

// 댓글 수정 
export const updateComment = (commentId, data) => {
    return axiosInstance.put(`/board/comments/${commentId}`,data);
};

// 댓글 삭제
export const deleteComment = (commentId) => {
    return axiosInstance.delete(`/board/comments/${commentId}`);
};

// 이미지 업로드 (파일 여러 개 - FormData 사용)
export const uploadImages = (files) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files',file));
    return axiosInstance.post('/board/upload',formData,{
        headers: {'Content-Type' : 'multipart/form-data'},
    });
}