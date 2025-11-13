// src/pages/Expenses.tsx
import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabaseClient";
import ExpenseList from "../components/ExpenseList";
import ExpenseForm from "../components/ExpenseForm";
import ExpenseSummary from "../components/ExpenseSummary";
import { calculateSettlements, calculatePaidByUser } from "../utils/settlement";
import { useErrorHandler } from "../utils/errorHandler";
import { useExpenseManager } from "../hooks/useExpenseManager";

export default function Expenses() {
  const { user, member } = useAuth();
  const { handleError } = useErrorHandler();

  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    [],
  );

  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  // 支出管理フックを使用
  const {
    expenses,
    isLoading,
    editingExpenseId,
    startEdit,
    cancelEdit,
    addExpense,
    updateExpense,
    deleteExpense,
  } = useExpenseManager({
    userId: user?.id,
    householdId: member?.household_id,
    selectedMonth,
  });

  // 過去1年分の年月を配列で生成
  const pastYearMonths = useMemo(() => {
    const months: string[] = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(
        `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
      );
    }
    return months;
  }, []);

  // カテゴリ取得
  useEffect(() => {
    if (!member) return;

    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from("household_categories")
        .select(
          `
          categories (
            id,
            name
          )
        `,
        )
        .eq("household_id", member.household_id);
      if (error) {
        handleError(error, "カテゴリ取得失敗");
      } else {
        const cat = data?.flatMap((d: { categories: { id: string; name: string }[] }) => d.categories);
        setCategories(cat);
      }
    };
    fetchCategories();
  }, [member?.household_id]);

  // 月の総支出額
  const totalAmount = useMemo(
    () => expenses.reduce((sum, e) => sum + e.amount, 0),
    [expenses],
  );

  // ユーザー別支払額
  const paidByUser = useMemo(() => calculatePaidByUser(expenses), [expenses]);

  // 精算額計算
  const settlements = useMemo(() => calculateSettlements(paidByUser), [paidByUser]);

  const expenseToEdit = expenses.find((e) => e.id === editingExpenseId);

  return (
    <div className="expense">
      {/* 支出入力 */}
      <div className="container">
        <div className="expense-card">
          <div className="expense-card-header">支出入力</div>
          <div className="expense-card-body">
            <ExpenseForm
              expenseToEdit={expenseToEdit}
              categories={categories}
              editing={!!editingExpenseId}
              onSubmit={(data) => {
                if (editingExpenseId) {
                  updateExpense(data);
                } else {
                  addExpense(data);
                }
              }}
              onCancel={cancelEdit}
            />
          </div>
        </div>

        {/* 支出管理 */}
        <div className="expense-card">
          <div className="expense-card-header">支出管理</div>
          <div className="expense-card-body">
            {/* 月選択 */}
            <div className="month-selector">
              <label htmlFor="month-select">表示月:</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              >
                {pastYearMonths.map((m) => (
                  <option key={m} value={m}>
                    {m.replace('-', '/')}
                  </option>
                ))}
              </select>
            </div>

            {/* 集計サマリー*/}
            <ExpenseSummary
              selectedMonth={selectedMonth}
              totalAmount={totalAmount}
              paidByUser={paidByUser}
              settlements={settlements}
            />
          </div>

          {/* 支出一覧 */}
          <div style={{ marginTop: '10px' }}>
            <h3 style={{ fontWeight: 'bold', marginBottom: 'clamp(8px, 2vw, 12px)' }}>支出一覧</h3>
            {isLoading ? (
              <p>読み込み中...</p>
            ) : (
              <ExpenseList
                expenses={expenses}
                onEdit={startEdit}
                onDelete={deleteExpense}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
