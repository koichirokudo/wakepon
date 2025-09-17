import type { Expense } from "../types";

type ExpenseListProps = {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
};

export default function ExpenseList({ expenses, onEdit, onDelete }: ExpenseListProps) {

  // 空の状態の処理
  if (expenses.length === 0) {
    return (
      <div className="expense-list-empty">
        <div className="expense-list-empty-icon">📝</div>
        <p>まだ支出が記録されていません</p>
      </div>
    );
  }

  return (
    <div id="expense-list">
      {expenses.map((expense) =>(
        <div key={expense.id} className="expense-item">
          <div className="expense-info">
            <div className="expense-date">{new Date(expense.date).toLocaleDateString("ja-JP")}</div>
            <div className="expense-amount">{expense.amount.toLocaleString()}円</div>
            <div className="expense-category">{expense.category?.name}</div>
            <div className="expense-memo">{expense?.memo}</div>
            <div className="expense-user">{expense.users?.name}</div>
          </div>
          <button className="button button-sm button-secondary" onClick={() => onEdit(expense)}>編集</button>
          <button className="button button-sm button-danger" onClick={() => onDelete(expense.id)}>削除</button>
        </div>
      ))}
    </div>
  );
}
