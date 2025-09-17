// src/pages/Expenses.tsx
import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabaseClient";
import type { Expense, ExpenseInput, Settlement } from "../types";
import ExpenseList from "../components/ExpenseList";
import ExpenseForm from "../components/ExpenseForm";
import ExpenseSummary from "../components/ExpenseSummary";
import "../components/css/Expense.css";

export default function Expenses() {
  const { user, member } = useAuth();

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [expensesCache, setExpensesCache] = useState<Record<string, Expense[]>>(
    {},
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    [],
  );
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);

  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  // 共通エラー処理
  const handleError = (msg: string, error: any) => {
    console.error(`${msg}:`, error?.message ?? error);
  };

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

  // 月の支出取得（キャッシュを活用）
  useEffect(() => {
    if (!selectedMonth) return;

    if (expensesCache[selectedMonth]) {
      setExpenses(expensesCache[selectedMonth]);
      setIsLoading(false);
      return;
    }

    const fetchExpenses = async () => {
      setIsLoading(true);

      const startDate = `${selectedMonth}-01`;
      const [year, month] = selectedMonth.split("-").map(Number);
      const endDateObj = new Date(year, month, 1);
      const endDate = endDateObj.toISOString().slice(0, 10);

      const { data, error } = await supabase
        .from("expenses")
        .select(`id, date, amount, memo, users(name), categories(id, name)`)
        .gte("date", startDate)
        .lt("date", endDate)
        .order("date", { ascending: false });

      if (error) {
        handleError("費用の取得に失敗しました", error);
      } else {
        const mapped: Expense[] = (data || []).map((item: any) => ({
          id: item.id,
          date: item.date,
          amount: item.amount,
          memo: item.memo,
          users: item.users,
          category: item.categories,
        }));

        setExpensesCache((prev) => ({ ...prev, [selectedMonth]: mapped }));
        setExpenses(mapped);
      }
      setIsLoading(false);
    };

    fetchExpenses();
  }, [selectedMonth, expensesCache]);

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
        handleError("カテゴリ取得失敗", error);
      } else {
        const cat = data?.flatMap((d) => d.categories);
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
  const paidByUser = useMemo(() => {
    const map: Record<string, number> = {};
    expenses.forEach((exp) => {
      const name = exp.users?.name ?? "不明";
      map[name] = (map[name] || 0) + exp.amount;
    });
    return map;
  }, [expenses]);

  // 精算額計算
  const settlements = useMemo(() => {
    const users = Object.keys(paidByUser);
    const total = Object.values(paidByUser).reduce((a, b) => a + b, 0);
    const perUserShare = total / users.length;

    const borrowers = users
      .map((user) => ({ user, diff: perUserShare - (paidByUser[user] || 0) }))
      .filter((u) => u.diff > 0);

    const lenders = users
      .map((user) => ({ user, diff: (paidByUser[user] || 0) - perUserShare }))
      .filter((u) => u.diff > 0);

    const result: Settlement[] = [];
    let i = 0,
      j = 0;
    while (i < borrowers.length && j < lenders.length) {
      const borrower = borrowers[i];
      const lender = lenders[j];
      const amount = Math.min(borrower.diff, lender.diff);

      result.push({ from: borrower.user, to: lender.user, amount });

      borrower.diff -= amount;
      lender.diff -= amount;

      if (borrower.diff === 0) i++;
      if (lender.diff === 0) j++;
    }
    return result;
  }, [paidByUser]);

  // 編集開始・キャンセル
  const startEditExpense = (expense: Expense) => {
    setEditingExpenseId(expense.id);
  };

  const cancelEdit = () => {
    setEditingExpenseId(null);
  };

  // 支出追加
  const handleAddExpense = async (expense: ExpenseInput) => {
    if (!user || !member) {
      handleError("グループIDまたはユーザーIDが設定されていません", null);
      return;
    }

    const amt = parseFloat(expense.amount);
    if (Number.isNaN(amt) || amt <= 0) {
      handleError("金額が不正です", null);
      return;
    }

    const { data, error } = await supabase
      .from("expenses")
      .insert({
        household_id: member?.household_id,
        user_id: user?.id,
        date: expense.date,
        amount: amt,
        category_id: expense.categoryId,
        memo: expense.memo,
      })
      .select(`id, date, amount, memo, categories(id, name)`)
      .single();

    if (error) handleError("支出追加失敗", error);
    else if (data) {
      const newExpense: Expense = {
        id: data.id,
        date: data.date,
        amount: data.amount,
        memo: data.memo,
        users: { name: user.name ?? "不明" },
        category: Array.isArray(data.categories)
          ? data.categories[0]
          : data.categories,
      };

      setExpenses((prev) => {
        const updated = [...prev, newExpense].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        );
        // キャッシュも更新
        setExpensesCache((cache) => ({ ...cache, [selectedMonth]: updated }));
        return updated;
      });
    }
  };

  // 支出更新
  const handleUpdateExpense = async (expense: ExpenseInput) => {
    if (!editingExpenseId) return;

    if (!user || !member) {
      handleError("グループIDまたはユーザーIDが設定されていません", null);
      return;
    }

    const amt = parseFloat(expense.amount);
    if (Number.isNaN(amt) || amt <= 0) {
      handleError("金額が不正です", null);
      return;
    }

    const { data, error } = await supabase
      .from("expenses")
      .update({
        date: expense.date,
        amount: amt,
        category_id: expense.categoryId,
        memo: expense.memo,
      })
      .eq("id", editingExpenseId)
      .select(`id, date, amount, memo, categories(id, name)`)
      .single();

    if (error) {
      handleError("支出更新失敗", error);
    } else if (data) {
      setExpenses((prev) => {
        const updated = prev.map((exp) =>
          exp.id === editingExpenseId
            ? {
                ...exp,
                date: data.date,
                amount: data.amount,
                memo: data.memo,
                category: Array.isArray(data.categories)
                  ? data.categories[0]
                  : data.categories,
              }
            : exp,
        );
        setExpensesCache((cache) => ({ ...cache, [selectedMonth]: updated }));
        return updated;
      });
      cancelEdit();
    }
  };

  // 支出削除
  const handleDeleteExpense = async (id: string) => {
    if (!confirm("本当に削除しますか？")) return;

    const { error } = await supabase.from("expenses").delete().eq("id", id);
    if (error) {
      handleError("支出削除失敗", error);
    } else {
      setExpenses((prev) => {
        const updated = prev.filter((e) => e.id !== id);
        setExpensesCache((cache) => ({ ...cache, [selectedMonth]: updated }));
        return updated;
      });
    }
  };

  const expenseToEdit = expenses.find((e) => e.id === editingExpenseId);

  return (
    <div className="expense">
      {/* 支出入力 */}
      <div className="container">
        <div className="expense-card" style={{ }}>
          <div className="expense-card-header">支出入力</div>
          <div className="expense-card-body">
            <ExpenseForm
              expenseToEdit={expenseToEdit}
              categories={categories}
              editing={!!editingExpenseId}
              onSubmit={(data) => {
                if (editingExpenseId) {
                  handleUpdateExpense(data);
                } else {
                  handleAddExpense(data);
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
                onEdit={startEditExpense}
                onDelete={handleDeleteExpense}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
