// src/pages/Categories.tsx
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { Category, CategoryInput } from '../types';
import { useAuth } from '../contexts/AuthContext';
import CategoryList from '../components/CategoryList';
import CategoryForm from '../components/CategoryForm';

export default function Categories() {
  const { user, member } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [name, setName] = useState<string>('');

  // 共通エラー処理
  const handleError = (msg: string, error: any) => {
    console.error(`${msg}:`, error?.message ?? error);
  };

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select()
      .or(`household_id.eq.${member?.household_id}, is_custom.eq.false`);
    if (error) {
      console.error(error);
    } else {
      setCategories(data);
    }
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  const startEditCategory = (category: Category) => {
    setEditingCategoryId(category.id);
    setName(category.name || '');
  };

  const cancelEdit = () => {
    setEditingCategoryId(null);
    setName('');
  }

  // カテゴリ追加
  const handleAddCategory = async (category: CategoryInput) => {
    if (!user || !member) {
      handleError('グループIDまたはユーザーIDが設定されていません', null);
      return;
    };

    const { data, error } = await supabase
      .from('categories')
      .insert({
        household_id: member?.household_id,
        name: category.name,
        is_custom: true,
      })
      .select();
    if (error) {
      handleError('カテゴリ追加失敗', error);
    } else if (data) {
      console.log('カテゴリ追加成功');
      fetchCategories()
    }
  }

  const handleUpdateCategory = async () => {
    if (!editingCategoryId) return;

    if (!user || !member) {
      handleError('グループIDまたはユーザーIDが設定されていません', null);
      return;
    };

    const { data, error } = await supabase
      .from('categories')
      .update({
        name: name
      })
      .eq('id', editingCategoryId)
      .select()
      .single();
    if (error) {
      handleError('カテゴリ更新失敗', error);
    } else if (data) {
      console.log('カテゴリ更新成功')
      setCategories(prev => {
        const updated = prev.map(cat => cat.id === editingCategoryId ? {
          ...cat,
          name: data.name,
        }
          : cat
        );
        return updated;
      })
    }
  }


  // カテゴリ削除
  const handleDeleteCategory = async (id: string) => {
    if (!confirm('本当に削除しますか？')) return;

    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) {
      handleError('カテゴリ削除失敗', error);
    } else {
      setCategories(prev => {
        const updated = prev.filter(c => c.id !== id);
        return updated;
      });
    }
  }

  return (
    <div>
      <h1>カテゴリ一覧</h1>
      <CategoryList categories={categories} onEdit={startEditCategory} onDelete={handleDeleteCategory} />
      <h1>カテゴリ編集</h1>
      <CategoryForm
        values={{ name }}
        editing={!!editingCategoryId}
        onSubmit={editingCategoryId ? handleUpdateCategory : () => handleAddCategory({ name })}
        onChange={({ name }) => {
          setName(name);
        }}
        onCancel={cancelEdit}
      />
    </div>
  );
}
