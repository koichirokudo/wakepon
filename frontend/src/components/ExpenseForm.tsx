// src/components/ExpenseForm.tsx
import type { ExpenseInput } from '../types';

type ExpenseFormProps = {
  categories: { id: string; name: string }[];
  paymentMethods: { id: string; name: string }[];
  values: ExpenseInput;
  editing?: boolean;
  onChange: (values: ExpenseInput) => void;
  onSubmit: () => void;
  onCancel?: () => void;
};

export default function ExpenseForm({ categories, paymentMethods, values, editing = false, onChange, onSubmit, onCancel }: ExpenseFormProps) {
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
      <input type="date" value={values.date} onChange={(e) => onChange({ ...values, date: e.target.value })} required /><br />
      <input type="number" placeholder="金額" min={0} max={99999999} value={values.amount} onChange={(e) => onChange({ ...values, amount: e.target.value })} required /> <br />
      <select required value={values.categoryId} onChange={(e) => onChange({ ...values, categoryId: e.target.value })}>
        <option value="">カテゴリを選択</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id}>{cat.name}</option>
        ))}
      </select> <br />
      <select required value={values.paymentMethodId} onChange={(e) => onChange({ ...values, paymentMethodId: e.target.value })}>
        <option value="">支払い方法を選択</option>
        {paymentMethods.map((pm) => (
          <option key={pm.id} value={pm.id}>{pm.name}</option>
        ))}
      </select> <br />
      <input type="text" placeholder="メモ" value={values.memo} maxLength={10} onChange={(e) => onChange({ ...values, memo: e.target.value })} /> <br /><br />
      {editing ? (
        <>
          <button type="submit">保存</button>
          <button type="button" onClick={onCancel}>キャンセル</button>
        </>
      ) : (
        <button type="submit">追加</button>
      )}
      <br />
    </form>

  );
}