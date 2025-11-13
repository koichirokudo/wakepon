// src/pages/Categories.tsx
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { Category } from '../types';
import { useAuth } from '../contexts/AuthContext';
import CategoryList from '../components/CategoryList';
import SelectCategoryForm from '../components/SelectCategoryForm';
import Card, { CardHeader, CardBody } from '../components/ui/Card';

export default function Categories() {
  const { member } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]); // 全カテゴリ
  const [enableCategoryIds, setEnableCategoryIds] = useState<string[]>([]); // 使用中カテゴリ
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>("");

  // 共通エラー処理
  const handleError = (msg: string, error: any) => {
    console.error(`${msg}:`, error?.message ?? error);
    setErrorMessage(`${msg}: ${error?.message ?? 'エラーが発生しました'}`);
    setIsLoading(false);
  };

  // カテゴリ取得
  const fetchCategories = async () => {
    if (!member) {
      setErrorMessage("世帯情報が見つかりません。プロフィールページから世帯を作成してください。");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      // 全カテゴリ取得（共通 + カスタム)
      const { data: catData, error: catError } = await supabase
        .from('categories')
        .select();
      if (catError) {
        handleError("カテゴリ取得失敗", catError);
        return;
      }

      setCategories(catData || []);

      // 世帯ごとのカテゴリ情報を取得
      const { data: hcData, error: hcError } = await supabase
        .from('household_categories')
        .select('category_id')
        .eq('household_id', member.household_id);
      if (hcError) {
        handleError("世帯カテゴリ取得失敗", hcError);
        return;
      }

      setEnableCategoryIds(hcData?.map((hc: { category_id: string }) => hc.category_id) || []);
      setIsLoading(false);
    } catch (err) {
      handleError("予期しないエラー", err);
    }
  }

  useEffect(() => {
    fetchCategories();
  }, [member]);

  // カテゴリ選択による追加と削除の処理
  const handleSelectCategory = async (toAdd: string[], toRemove: string[]) => {
    if (!member) return;

    setIsLoading(true);

    // 追加
    if (toAdd.length > 0) {
      const { error } = await supabase
        .from('household_categories')
        .insert(
          toAdd.map(category_id => ({
            household_id: member.household_id,
            category_id,
          }))
        );
      if (error) handleError("カテゴリ追加失敗", error);
    }

    // 削除
    if (toRemove.length > 0) {
      const { error } = await supabase
        .from('household_categories')
        .delete()
        .eq('household_id', member.household_id)
        .in('category_id', toRemove);
      if (error) handleError("カテゴリ削除失敗", error);
    }

    // データを最新に更新
    await fetchCategories();
  }

  if (isLoading) {
    return (
      <div className="categories">
        <Card>
          <CardBody>
            <div className="loading">
              <div className="spinner"></div>
              読み込み中...
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="categories">
        <Card>
          <CardHeader>エラー</CardHeader>
          <CardBody>
            <div style={{
              backgroundColor: '#fee',
              border: '1px solid #fcc',
              padding: '15px',
              borderRadius: '4px',
              color: '#c00'
            }}>
              {errorMessage}
            </div>
            <button
              onClick={fetchCategories}
              style={{
                marginTop: '15px',
                padding: '10px 20px',
                backgroundColor: '#4A90E2',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              再読み込み
            </button>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="categories">
      <Card>
        <CardHeader>使用中のカテゴリ</CardHeader>
        <CardBody>
          <CategoryList categories={categories.filter(c => enableCategoryIds.includes(c.id))} />
        </CardBody>
      </Card>

      <Card>
        <CardHeader>カテゴリを選択</CardHeader>
        <CardBody>
          <SelectCategoryForm
            categories={categories}
            enableCategoryIds={enableCategoryIds}
            onSubmit={handleSelectCategory}
          />
        </CardBody>
      </Card>
    </div>
  );
}
