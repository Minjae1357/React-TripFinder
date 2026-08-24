import { useState } from 'react';
import { Form, Button, Container, Alert } from 'react-bootstrap';
import axios from 'axios';
import axiosInstance from '../../../api/axiosInstance';

function SignupPage() {
  const [form, setForm] = useState({
    loginEmail: '',
    loginPassword: '',
    nickname: '',
    location: '',
    ageGroup: '',
    gender: '',
  });
  const [error, setError] = useState('');

  ;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });  
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post('auth/signup', form);
      alert('회원가입 성공! 로그인해주세요.');
     
    } catch (err) {
      console.log(err);
      setError('회원가입에 실패했습니다.');
    }
  };

  return (
    <Container style={{ maxWidth: '480px', marginTop: '60px' }}>
      <h3 className="mb-4">회원가입</h3>
      {error && <Alert variant="danger">{error}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>이메일</Form.Label>
          <Form.Control
            type="email"
            name="loginEmail"
            value={form.loginEmail}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>비밀번호</Form.Label>
          <Form.Control
            type="password"
            name="loginPassword"
            value={form.loginPassword}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>닉네임</Form.Label>
          <Form.Control
            type="text"
            name="nickname"
            value={form.nickname}
            onChange={handleChange}
            required
          />
        </Form.Group>
        
        {/* 이부분은 우편 api받는걸로 */}
        <Form.Group className="mb-3">
          <Form.Label>거주 지역 (선택)</Form.Label>
          <Form.Control
            type="text"
            name="location"
            value={form.location}
            onChange={handleChange}
          />
        </Form.Group> 

        <Form.Group className="mb-3">
          <Form.Label>성별</Form.Label>
          <Form.Control
            as="select"
            name="gender"
            value={form.gender}
            onChange={handleChange}
            required
          >
            <option value="">선택</option>
            <option value="0">남성</option>
            <option value="1">여성</option>
          </Form.Control>
        </Form.Group>

        <Button type="submit" variant="primary" className="w-100">
          가입하기
        </Button>
      </Form>
    </Container>
  );
}

export default SignupPage;