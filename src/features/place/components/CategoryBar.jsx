import { CATEGORIES } from '../constants/mapConfig';

export default function CategoryBar({ activeCategory, onCategoryClick }) {
  return (
    <div className="category-container">
      {CATEGORIES.map((category) => {
        const isActive = activeCategory === category.id;
        return (
          <button
            key={category.id}
            onClick={() => onCategoryClick(category)}
            className={`category-btn ${isActive ? 'active' : ''}`}
          >
            <span className="category-icon">{category.icon}</span>
            <span>{category.label}</span>
          </button>
        );
      })}
    </div>
  );
}