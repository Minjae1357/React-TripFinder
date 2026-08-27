import React from 'react';

const SORT_OPTIONS = [
    { value: 'recommend', label: '추천순' },
    { value: 'latest', label: '최신순' },
    { value: 'star_desc', label: '별점 높은순' },
    { value: 'star_asc', label: '별점 낮은순' },
];

const AccommodationReviewSortSelect = ({ value, onChange }) => {
    return (
        <select value={value} onChange={(e) => onChange(e.target.value)}>
            {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
    );
};

export default AccommodationReviewSortSelect;