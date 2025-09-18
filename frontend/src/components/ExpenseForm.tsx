// src/components/ExpenseForm.tsx
import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import { validationRules } from '../utils/validation';
import type { Expense, ExpenseInput } from '../types';
import Input from './ui/Input';
import Select from './ui/Select';

type ExpenseFormProps = {
  expenseToEdit?: Expense;
  categories: { id: string; name: string }[];
  editing?: boolean;
  onSubmit: (data: ExpenseInput) => void;
  onCancel?: () => void;
};

export default function ExpenseForm({ expenseToEdit, categories, editing = false, onSubmit, onCancel }: ExpenseFormProps) {
  const defaultCategory = categories?.find((c) => c.name === "食費");
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ExpenseInput>({
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      amount: "",
      categoryId: "",
      memo: "",
    }
  });

  // 非同期処理で取得したデータを初期値にセット
  useEffect(() => {
    if (defaultCategory) {
      reset({
        date: new Date().toISOString().split("T")[0],
        amount: "",
        categoryId: defaultCategory.id,
        memo: ""
      });
    }
  }, [defaultCategory, reset]);

  // 編集開始時にフォームにセット
  useEffect(() => {
    if (editing && expenseToEdit) {
      // ISO形式からstringに変換
      const dateStr = expenseToEdit.date
        ? new Date(expenseToEdit.date).toISOString().split("T")[0]
        : "";
      setValue("date", dateStr)
      setValue("amount", expenseToEdit.amount.toString() || "");
      setValue("categoryId", expenseToEdit.category.id || "");
      setValue("memo", expenseToEdit.memo || "");
    }
  })

  const handleCancel = () => {
    reset();
    onCancel?.();
  }

  return (
    <form id="expense-form" onSubmit={handleSubmit(onSubmit)}>
      <Input
        type="date"
        label="日付"
        error={errors.date?.message}
        {...register("date", validationRules.expenseDate)}
      />
      <Input
        type="number"
        error={errors.amount?.message}
        label="金額"
        {...register("amount", validationRules.expenseAmount)}
      />
      <Select 
        label="カテゴリ"
        error={errors.categoryId?.message}
        values={categories}
      />
      {errors.categoryId && <p style={{ color: 'red' }}>{errors.categoryId.message}</p>}
      <Input
        label="メモ"
        error={errors.memo?.message}
        {...register("memo", validationRules.memo)}
      />
      {editing ? (
        <>
          <button type="submit" className="button button-sm button-secondary">保存</button>
          <button type="button" className="button button-sm button-danger" onClick={handleCancel}>キャンセル</button>
        </>
      ) : (
        <button type="submit" className="button button-primary">追加</button>
      )}
      <br />
    </form>
  );
}
