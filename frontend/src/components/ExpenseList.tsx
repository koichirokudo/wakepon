// src/components/ExpenseList.tsx
import type { Expense } from '../types';

type ExpenseListProps = {
  expenses: Expense[];
  onEdit: (exp: Expense) => void;
  onDelete: (id: string) => void;
};

export default function ExpenseList({ expenses, onEdit, onDelete }: ExpenseListProps) {
  if (expenses.length === 0) return <p>データがありません</p>;

  return (
    <ul>
      {expenses.map(exp => (
        <li key={exp.id}>
          {new Date(exp.date).toLocaleDateString('ja-JP')}:
          {exp.category?.name} {exp.amount}円 - {exp.paymentMethod?.name} {exp.memo && `(${exp.memo})`} {exp.users.name}
          <button onClick={() => onEdit(exp)}>編集</button>
          <button onClick={() => onDelete(exp.id)}>削除</button>
        </li>
      ))}
    </ul>
  );
}