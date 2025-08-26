// src/components/CategoryList.tsx
import type { Category } from "../types";

type CategoryListProps = {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
}

export default function CategoryList({ categories, onEdit, onDelete }: CategoryListProps) {
  return (
    <ul>
      {categories.map((cat) => (
        <li key={cat.id}>
          {cat.name} {cat.is_custom ? '(カスタム)' : '(共通)'}
          {cat.is_custom && (
            <>
              <button onClick={() => onEdit(cat)}>編集</button>
              <button onClick={() => onDelete(cat.id)}>削除</button>
            </>
          )}
        </li>
      ))}
    </ul>
  );
}