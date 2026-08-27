import React from 'react';

const AccommodationInfo = ({ accommodation }) => {
    return (
        <div>
            <h2>{accommodation.name}</h2>
            <p>{accommodation.accommodationType} - {accommodation.rating}</p>
            <p>주소: {accommodation.address}</p>
        </div>
    );
};

export default AccommodationInfo;