import type { Expense } from "../types";

type ExpenseListProps = {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
};

export default function ExpenseList({ expenses, onEdit, onDelete }: ExpenseListProps) {
  return (
    <table border={1} style={{ borderCollapse: "collapse", width: "100%" }}>
      <thead>
        <tr>
          <th>日付</th>
          <th>カテゴリ</th>
          <th style={{ textAlign: "right" }}>金額</th>
          <th>メモ</th>
          <th>ユーザー</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        {expenses.map((expense) => (
          <tr key={expense.id}>
            <td>{new Date(expense.date).toLocaleDateString("ja-JP")}</td>
            <td>{expense.category?.name}</td>
            <td style={{ textAlign: "right" }}>{expense.amount.toLocaleString()}円</td>
            <td>{expense.memo}</td>
            <td>{expense.users?.name}</td>
            <td>
              <button onClick={() => onEdit(expense)}>編集</button>
              <button onClick={() => onDelete(expense.id)}>削除</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
