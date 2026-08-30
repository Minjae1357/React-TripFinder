import React, { useState, useEffect } from 'react'
import { Button, Container, ListGroup, Nav, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { getBoardList } from '../api';

const BoardListPage = () => {
    const [category, setCategory] = useState(null); // null=전체, 'NOTICE , 'REVIEW
    const [boards,setBoards] = useState([]);
    const [loading , setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        getBoardList(category)
            .then((res) => setBoards(res.data))
            .catch(() => setBoards([]))
            .finally(() => setLoading(false));
    }, [category]) //category 바뀔 떄마다 다시 조회
  return (
      <Container style={{maxWidth : '720px', marginTop: '40px'}}>
        <div className="d-flex justify-content-between align-items-center mb-3">
            <h3>게시판</h3>
            <Link to="/board/write">
                <Button variant='primary'>글쓰기</Button>
            </Link>
        </div>

        {/* 카테고리 탭 */}
        <Nav variant='tabs' className='mb-3'>
            <Nav.Item>
                <Nav.Link active={category === null} onClick={() => setCategory(null)}>
                    전체
                </Nav.Link>
            </Nav.Item>
            <Nav.Item>
                <Nav.Link active={category === 'NOTICE'} onClick={() => setCategory('NOTICE')}>
                    공지
                </Nav.Link>
            </Nav.Item>
            <Nav.Item>
                <Nav.Link active={category === 'REVIEW'} onClick={() => setCategory('REVIEW')}>
                    후기
                </Nav.Link>
            </Nav.Item>
        </Nav>

          {loading ? (
                <Spinner animation="border" />
            ) : (
                <ListGroup>
                    {boards.length === 0 && <ListGroup.Item>게시글이 없습니다.</ListGroup.Item>}
                    {boards.map((board) => (
                        <ListGroup.Item key={board.id} as={Link} to={`/board/${board.id}`} action>
                            {board.category === 'NOTICE' && <span className="badge bg-danger me-2">공지</span>}
                            {board.title}
                            <span className="text-muted ms-2" style={{ fontSize: '0.85em' }}>
                                조회 {board.hit}
                            </span>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            )}
      </Container>
  )
}

export default BoardListPage