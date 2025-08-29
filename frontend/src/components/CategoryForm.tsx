// src/components/CategoryForm.tsx
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import type { Category, CategoryInput } from '../types';
import { validationRules } from '../utils/validation';

type CategoryFormProps = {
  categoryToEdit?: Category;
  editing?: boolean;
  onSubmit: (data: CategoryInput) => void;
  onCancel?: () => void;
}

export default function CategoryForm({ categoryToEdit, editing = false, onSubmit, onCancel }: CategoryFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CategoryInput>({
    defaultValues: { name: "" }
  });

  console.log(watch("name"));

  // 編集開始時にフォームに値をセット
  useEffect(() => {
    if (editing && categoryToEdit) {
      setValue('name', categoryToEdit.name || "");
    } else {
      reset();
    }
  }, [editing, categoryToEdit, setValue, reset]);

  const handleCancel = () => {
    reset();
    onCancel?.();
  };


  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        {...register("name", validationRules.categoryName)}
        placeholder="カテゴリ名"
      />
      {errors.name && <p style={{ color: 'red' }}>{errors.name.message}</p>}
      <br /><br />
      {editing ? (
        <>
          <button type="submit">保存</button>
          <button type="button" onClick={handleCancel}>キャンセル</button>
        </>
      ) : (
        <button type="submit">追加</button>
      )}
    </form>
  );
}