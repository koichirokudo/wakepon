// src/pages/Categories.tsx
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { Category } from '../types';

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    async function fetchCategories() {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, is_custom');
      if (error) console.error(error);
      else setCategories(data);
    }

    fetchCategories();
  }, []);

  return (
    <div>
      <h1>カテゴリ一覧</h1>
      <ul>
        {categories.map((cat) => (
          <li key={cat.id}>
            {cat.name} {cat.is_custom ? '(カスタム)' : '(共通)'}
          </li>
        ))}
      </ul>
    </div>
  );
}
