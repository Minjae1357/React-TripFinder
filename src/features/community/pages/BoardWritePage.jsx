import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {useAuthStore} from '@/store/authStore';
import { Button, Container, Form } from 'react-bootstrap';
import { createBoard, uploadImages } from '../api';
const BoardWritePage = () => {
    const navigate = useNavigate();
    const {user} = useAuthStore(); // 로그인한 유저 정보 (ROLE 확인용)
    const isAdmin = user?.role === 'ADMIN'; //관리자만 공지 카테고리선택가능

    const [category,setCategory] = useState('REVIEW'); //기본값
    const [title,setTtile] = useState('');
    const [contents,setContents] = useState('');
    const [files,setFiles] = useState([]); //선택된 임지 파일들
    const [submitting,setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if(!title.trim() || !contents.trim()){
            alert('제목과 내용을 입력해주세요.');
            return;
        }
        setSubmitting(true);

        try{
            let imgUrls =[];
            if(files.length > 0){
                const uploadRes = await uploadImages(files); //이미지 먼저 업로드
                imgUrls = uploadRes.data; //업로드된 url 목록
            }

            const res = await createBoard({category,title,contents,imgUrls});
            const newBoardId = res.data; // 백엔드가 생성된 게시글 id를 리턴받음
            navigate(`/board/${newBoardId}`); //작성완료후 상세페이지로 이동
        } catch(err){
            alert(err.response?.data?.message || '작성 중 오류가 발생했습니다.');
        }finally{
            setSubmitting(false);
        }
    }
    return (
       <Container style={{maxWidth : '720px',marginTop:'40px'}}>
            <h3 className='mb-4'>글쓰기</h3>
            <Form onSubmit={handleSubmit}>
                <Form.Group className='mb-3'>
                    <Form.Label>카테고리</Form.Label>
                    <Form.Select value={category} onChange={(e) => setCategory(e.target.value)}>
                        <option value="REVIEW">후기</option>
                        {isAdmin && <option value="NOTICE">공지</option>}
                    </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>제목</Form.Label>
                    <Form.Control 
                        type = "text"
                        value = {title}
                        onChange = {(e) => setTtile(e.target.value)}
                        placeholder="제목을 입력하세요"
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>내용</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows = {8}
                        value={contents}
                        onChange={(e) => setContents(e.target.value)}
                        placeholder = "내용을 입력해주세요"
                        style={{resize:'none'}} //크기조절을막음
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>사진 첨부</Form.Label>
                    <Form.Control
                        type="file"
                        multiple //여러장 선택가능하게만듬
                        accept="image/*"
                        onChange = {(e) => setFiles(Array.from(e.target.files))}
                    />
                </Form.Group>
                <Button type="submit" variant='primary' disabled={submitting}>
                    {submitting ? '등록 중 ...' : '등록'}
                </Button>
            </Form>
       </Container>
    );
};

export default BoardWritePage;