// src/pages/Expenses.tsx
import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import type { Expense, ExpenseInput, Settlement } from '../types';
import ExpenseList from '../components/ExpenseList';
import ExpenseForm from '../components/ExpenseForm';
import ExpenseSummary from '../components/ExpenseSummary';

export default function Expenses() {
  const { householdId, userId, userName } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [expensesCache, setExpensesCache] = useState<Record<string, Expense[]>>({})
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [date, setDate] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [paymentMethodId, setPaymentMethodId] = useState<string>('');
  const [memo, setMemo] = useState<string>('');
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<{ id: string; name: string }[]>([]);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  // 月の総支出額
  const totalAmount = useMemo(
    () => expenses.reduce((sum, exp) => sum + exp.amount, 0),
    [expenses]
  );

  // ユーザー別支払額集計 (名前をキーに)
  const paidByUser = useMemo(() => {
    const map: Record<string, number> = {};
    expenses.forEach(exp => {
      const name = exp.users?.name ?? '不明';
      map[name] = (map[name] || 0) + exp.amount;
    });
    return map;
  }, [expenses]);

  function calculateSettlements(paidByUser: Record<string, number>): Settlement[] {
    const users = Object.keys(paidByUser);
    const total = Object.values(paidByUser).reduce((a, b) => a + b, 0);
    const perUserShare = total / users.length;

    // 借り手と貸し手に分ける
    const borrowers = users
      .map(user => ({ user, diff: perUserShare - (paidByUser[user] || 0) }))
      .filter(({ diff }) => diff > 0) // 足りない人

    const lenders = users
      .map(user => ({ user, diff: (paidByUser[user] || 0) - perUserShare }))
      .filter(({ diff }) => diff > 0) // 多く払った人

    const settlements: Settlement[] = [];

    let i = 0, j = 0;
    while (i < borrowers.length && j < lenders.length) {
      const borrower = borrowers[i];
      const lender = lenders[j];
      const amount = Math.min(borrower.diff, lender.diff);

      settlements.push({
        from: borrower.user,
        to: lender.user,
        amount,
      });

      borrower.diff -= amount;
      lender.diff -= amount;

      if (borrower.diff === 0) i++;
      if (lender.diff === 0) j++;
    }

    return settlements;
  }

  // 過去1年分の年月を配列で生成
  const getPastYearMonths = (): string[] => {
    const months = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      months.push(`${y}-${m}`);
    }
    return months;
  };

  // 支出一覧を取得
  useEffect(() => {
    if (!selectedMonth) return;

    // キャッシュにあれば取得せずにキャッシュからセットする
    if (expensesCache[selectedMonth]) {
      setExpenses(expensesCache[selectedMonth]);
      setIsLoading(false);
      return;
    }

    const fetchExpenses = async () => {
      setIsLoading(true);

      // selectedMonthのYYYY-MMから開始日と終了日を計算
      const startDate = `${selectedMonth}-01`;

      // 月の翌月の1日を計算（終了日の次の日）
      const [year, month] = selectedMonth.split('-').map(Number);
      const endDateObj = new Date(year, month, 1);
      const endDate = endDateObj.toISOString().slice(0, 10); // yyyy-mm-dd

      // クエリでdateの範囲指定
      const { data, error } = await supabase
        .from('expenses')
        .select(`id, date, amount, memo, users(name), categories(id, name), payment_methods(id, name)`)
        .gte('date', startDate)
        .lt('date', endDate)
        .order('date', { ascending: false });

      if (error) {
        console.error('費用の取得に失敗しました:', error.message);
      } else {
        const mapped = (data || []).map((item: any) => ({
          id: item.id,
          date: item.date,
          amount: item.amount,
          memo: item.memo,
          users: item.users,
          category: item.categories,
          paymentMethod: item.payment_methods,
        }));

        // キャッシュに保存
        setExpensesCache(prev => ({ ...prev, [selectedMonth]: mapped }));
        setExpenses(mapped);
      }
      setIsLoading(false);
    };

    fetchExpenses();
  }, [selectedMonth]);

  // カテゴリの選択肢を取得
  useEffect(() => {
    // householdId がない場合は何もしない
    if (!householdId) return;

    const fetchCategories = async () => {
      // household_id または is_custom = false のカテゴリを取得
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .or(`household_id.eq.${householdId},is_custom.eq.false`);

      if (error) {
        console.error('カテゴリの取得に失敗しました:', error.message);
      } else {
        setCategories(data || []);
      }
    };

    fetchCategories();
  }, [householdId]);

  // 支払い方法の選択肢を取得
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*');
      if (error) {
        console.error('支払い方法の取得に失敗しました:', error.message);
      } else {
        setPaymentMethods(data || []);
      }
    };
    fetchPaymentMethods();
  }, []);

  // 編集用の関数
  const startEditExpense = (expense: Expense) => {
    setEditingExpenseId(expense.id);
    setDate(expense.date.slice(0, 10)); // yyyy-mm-dd形式にしてセット
    setAmount(expense.amount.toString());
    setCategoryId(expense.category.id);
    setPaymentMethodId(expense.paymentMethod.id);
    setMemo(expense.memo || '');
  };

  // 編集キャンセル用の関数
  const cancelEdit = () => {
    setEditingExpenseId(null);
    setDate('');
    setAmount('');
    setCategoryId('');
    setPaymentMethodId('');
    setMemo('');
  };

  // 支出の追加
  const handleAddExpense = async (expense: ExpenseInput) => {
    const { data, error } = await supabase
      .from('expenses')
      .insert({
        household_id: householdId,
        user_id: userId,
        amount: parseFloat(expense.amount),
        date: expense.date,
        category_id: expense.categoryId,
        payment_method_id: expense.paymentMethodId,
        memo: expense.memo
      })
      .select(`id, date, amount, memo, categories(id, name), payment_methods(id, name)`)
      .single();
    if (error) {
      console.error('支出の追加に失敗しました:', error.message);
    } else if (data) {
      // 新しい支出をリストに追加
      setExpenses((prev) => {
        const newExpense = [
          ...prev,
          {
            id: data.id,
            date: data.date,
            amount: data.amount,
            memo: data.memo,
            users: { id: userId, name: userName ?? '不明' },
            category: Array.isArray(data.categories) ? data.categories[0] : data.categories,
            paymentMethod: Array.isArray(data.payment_methods) ? data.payment_methods[0] : data.payment_methods,
          },
        ];
        // 日付で降順ソート
        newExpense.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        return newExpense;
      });
    }
  };

  // 支出の更新
  const handleUpdateExpense = async () => {
    if (!editingExpenseId) return;

    const { data, error } = await supabase
      .from('expenses')
      .update({
        date,
        amount: parseFloat(amount),
        category_id: categoryId,
        payment_method_id: paymentMethodId,
        memo,
      })
      .eq('id', editingExpenseId)
      .select(`id, date, amount, memo, categories(id, name), payment_methods(id, name)`)
      .single();

    if (error) {
      console.error('支出の更新に失敗しました:', error.message);
    } else if (data) {
      // 更新された支出をリストに反映
      setExpenses((prev) =>
        prev.map((expense) =>
          expense.id === editingExpenseId
            ? {
              id: data.id,
              date: data.date,
              amount: data.amount,
              memo: data.memo,
              users: expense.users,
              category: Array.isArray(data.categories) ? data.categories[0] : data.categories,
              paymentMethod: Array.isArray(data.payment_methods) ? data.payment_methods[0] : data.payment_methods,
            }
            : expense
        )
      );
      cancelEdit();
    }
  };

  // 支出の削除
  const handleDeleteExpense = async (id: string) => {
    if (!confirm('本当に削除しますか？')) return;

    const { error } = await supabase.from('expenses').delete().eq('id', id);

    if (error) {
      console.error('支出の削除に失敗しました:', error.message);
    } else {
      setExpenses((prev) => prev.filter((expense) => expense.id !== id));
    }
  };

  const settlements = calculateSettlements(paidByUser);

  return (
    <>
      <div>
        <h1>支出入力</h1>
        <ExpenseForm
          categories={categories}
          paymentMethods={paymentMethods}
          values={{ date, amount, categoryId, paymentMethodId, memo }}
          editing={!!editingExpenseId}
          onSubmit={editingExpenseId ? handleUpdateExpense : () => handleAddExpense({
            date,
            amount,
            categoryId,
            paymentMethodId,
            memo,
          })}
          onChange={({ date, amount, categoryId, paymentMethodId, memo }) => {
            setDate(date);
            setAmount(amount);
            setCategoryId(categoryId);
            setPaymentMethodId(paymentMethodId);
            setMemo(memo ?? '');
          }}
          onCancel={cancelEdit}
        />
      </div>
      <div>
        <h1>支出一覧</h1>
        {/* 月選択プルダウン */}
        <label htmlFor="month-select">月を選択:</label>
        <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
          {getPastYearMonths().map((ym) => (
            <option key={ym} value={ym}>
              {ym}
            </option>
          ))}
        </select>
        <br /><br />
        {/* 支出一覧 */}
        {isLoading ? (
          <p>読み込み中...</p>
        ) : (
          <ExpenseList expenses={expenses} onEdit={startEditExpense} onDelete={handleDeleteExpense} />
        )}
      </div>
      <div>
        <h1>支出集計</h1>
        <ExpenseSummary selectedMonth={selectedMonth} totalAmount={totalAmount} paidByUser={paidByUser} settlements={settlements} />
      </div>
    </>
  );
}
