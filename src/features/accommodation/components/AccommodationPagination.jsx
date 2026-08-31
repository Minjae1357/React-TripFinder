import React from 'react';

// 숫자 페이징 컴포넌트 
const AccommodationPagination = ({ currentPage, totalPages, onPageChange }) => {
    if(totalPages <= 1) return null; // 페이지가 1개 이하이면 렌더링하지 않음
    return (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '16px' }}>
            {Array.from({ length: totalPages }, (_, i) => (
                <button
                    key={i}
                    onClick={() => onPageChange(i)}
                    style={{ fontWeight: i === currentPage ? 'bold' : 'normal' }}
                >
                    {i + 1}
                </button>
            ))}
        </div>
    );
};

export default AccommodationPagination;