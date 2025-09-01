// src/components/CategoryList.tsx
import type { Category } from "../types";

type CategoryListProps = {
  categories: Category[];
}

export default function CategoryList({ categories }: CategoryListProps) {
  return categories.length > 0 ? (
    <ul>
      {categories.map((cat) => (
        <li key={cat.id}>
          {cat.name}
        </li>
      ))}
    </ul>
  ) : (
    <p style={{ color: 'red' }}> カテゴリを選択してください</p >
  )
}