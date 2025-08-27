// src/components/CategoryForm.tsx
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import type { Category, CategoryInput } from '../types';

type CategoryFormProps = {
  categoryToEdit?: Category;            // 編集対象カテゴリ
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
      setValue('name', categoryToEdit.name || '');
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
        {...register("name", {
          required: "必須項目です",
          maxLength: { value: 10, message: "10文字以内で入力してください" }
        })}
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