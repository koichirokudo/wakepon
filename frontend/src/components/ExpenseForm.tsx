// src/components/ExpenseForm.tsx
import { useForm } from 'react-hook-form';
import type { Expense, ExpenseInput } from '../types';
import { useEffect } from 'react';

type ExpenseFormProps = {
  expenseToEdit?: Expense;
  categories: { id: string; name: string }[];
  paymentMethods: { id: string; name: string }[];
  editing?: boolean;
  onSubmit: (data: ExpenseInput) => void;
  onCancel?: () => void;
};

export default function ExpenseForm({ expenseToEdit, categories, paymentMethods, editing = false, onSubmit, onCancel }: ExpenseFormProps) {
  const defaultCategory = categories?.find((c) => c.name === "食費");
  const defaultPaymentMethod = paymentMethods?.find((p) => p.name === "現金");

  console.log(defaultCategory);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ExpenseInput>({
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      amount: "",
      categoryId: "",
      paymentMethodId: "",
      memo: "",
    }
  });

  // 非同期処理で取得したデータを初期値にセット
  useEffect(() => {
    if (defaultCategory && defaultPaymentMethod) {
      reset({
        date: new Date().toISOString().split("T")[0],
        amount: "",
        categoryId: defaultCategory.id,
        paymentMethodId: defaultPaymentMethod.id,
        memo: ""
      });
    }
  }, [defaultCategory, defaultPaymentMethod, reset]);

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
      setValue("paymentMethodId", expenseToEdit.paymentMethod.id || "");
      setValue("memo", expenseToEdit.memo || "");
    }
  })

  const handleCancel = () => {
    reset();
    onCancel?.();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* 日付 */}
      <input type="date"
        {...register("date", {
          required: "日付を入力してください",
          valueAsDate: true,
        })}
        placeholder="日付"
      /><br />
      {errors.date && <p style={{ color: 'red' }}>{errors.date.message}</p>}
      {/* 金額 */}
      <input type="number"
        {...register("amount", {
          required: "金額を入力してください",
          min: {
            value: 0,
            message: "0以上の数値を入力してください"
          },
          maxLength: {
            value: 10,
            message: "10桁以下の数値を入力してください"
          },
        })}
        placeholder="金額"
      /><br />
      {errors.amount && <p style={{ color: 'red' }}>{errors.amount.message}</p>}
      {/* カテゴリ */}
      <select {...register("categoryId")}>
        <option value="">カテゴリを選択</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id}>{cat.name}</option>
        ))}
      </select><br />
      {errors.categoryId && <p style={{ color: 'red' }}>{errors.categoryId.message}</p>}
      {/* 支払方法 */}
      <select {...register("paymentMethodId")}>
        <option value="">支払い方法を選択</option>
        {paymentMethods.map((pm) => (
          <option key={pm.id} value={pm.id}>{pm.name}</option>
        ))}
      </select><br />
      {errors.paymentMethodId && <p style={{ color: 'red' }}>{errors.paymentMethodId.message}</p>}
      {/* メモ */}
      <input {
        ...register("memo", {
          maxLength: {
            value: 10,
            message: "最大10文字まで入力できます"
          }
        })}
        placeholder="メモ" /><br />
      {errors.memo && <p style={{ color: 'red' }}>{errors.memo.message}</p>}
      {editing ? (
        <>
          <button type="submit">保存</button>
          <button type="button" onClick={handleCancel}>キャンセル</button>
        </>
      ) : (
        <button type="submit">追加</button>
      )}
      <br />
    </form>
  );
}