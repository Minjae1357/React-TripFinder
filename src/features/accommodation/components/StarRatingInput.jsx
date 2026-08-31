import React from 'react';

// 별점 입력 컴포넌트 - 재사용 가능성으로 컴포넌트 별도 구현
const StarRatingInput = ({ value, onChange }) => {
    return (
        <div>
            {[1, 2, 3, 4, 5].map((starNumber) => (
                <i
                    key={starNumber}
                    className={starNumber <= value ? 'bi bi-star-fill' : 'bi bi-star'}
                    style={{ fontSize:'28px', color: starNumber <= value ? '#ffc107' : '#ccc', cursor: 'pointer', marginRight: '4px' }}
                    onClick={() => onChange(starNumber)}
                />
            ))}
        </div>
    );
};


export default StarRatingInput;