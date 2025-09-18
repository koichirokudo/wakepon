// src/components/CategoryList.tsx
import type { Category } from "../types";

type CategoryListProps = {
  categories: Category[];
}

export default function CategoryList({ categories }: CategoryListProps) {
  return (
    <div className="category-list">
      {categories.length > 0 ? (
        <div className="category-grid">
          {categories.map((cat) => (
            <div key={cat.id} className="category-item">
              <span className="category-name">{cat.name}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p className="empty-message">カテゴリを選択してください</p>
          <div className="empty-icon">📂</div>
        </div>
      )}
    </div>
  );
}
