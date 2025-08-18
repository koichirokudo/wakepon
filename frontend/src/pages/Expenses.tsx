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
  const [expensesCache, setExpensesCache] = useState<Record<string, Expense[]>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [date, setDate] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [paymentMethodId, setPaymentMethodId] = useState('');
  const [memo, setMemo] = useState('');

  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<{ id: string; name: string }[]>([]);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);

  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
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
      months.push(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
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
      const [year, month] = selectedMonth.split('-').map(Number);
      const endDateObj = new Date(year, month, 1);
      const endDate = endDateObj.toISOString().slice(0, 10);

      const { data, error } = await supabase
        .from('expenses')
        .select(`id, date, amount, memo, users(name), categories(id, name), payment_methods(id, name)`)
        .gte('date', startDate)
        .lt('date', endDate)
        .order('date', { ascending: false });

      if (error) {
        handleError('費用の取得に失敗しました', error);
      } else {
        const mapped: Expense[] = (data || []).map((item: any) => ({
          id: item.id,
          date: item.date,
          amount: item.amount,
          memo: item.memo,
          users: item.users,
          category: item.categories,
          paymentMethod: item.payment_methods,
        }));

        setExpensesCache(prev => ({ ...prev, [selectedMonth]: mapped }));
        setExpenses(mapped);
      }
      setIsLoading(false);
    };

    fetchExpenses();
  }, [selectedMonth, expensesCache]);

  // カテゴリ取得
  useEffect(() => {
    if (!householdId) return;

    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .or(`household_id.eq.${householdId},is_custom.eq.false`);

      if (error) {
        handleError('カテゴリ取得失敗', error);
      } else {
        setCategories(data || []);
      }
    };
    fetchCategories();
  }, [householdId]);

  // 支払い方法取得
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      const { data, error } = await supabase.from('payment_methods').select('*');
      if (error) {
        handleError('支払い方法取得失敗', error);
      } else {
        setPaymentMethods(data || []);
      }
    };
    fetchPaymentMethods();
  }, []);

  // 月の総支出額
  const totalAmount = useMemo(() => expenses.reduce((sum, e) => sum + e.amount, 0), [expenses]);

  // ユーザー別支払額
  const paidByUser = useMemo(() => {
    const map: Record<string, number> = {};
    expenses.forEach(exp => {
      const name = exp.users?.name ?? '不明';
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
      .map(user => ({ user, diff: perUserShare - (paidByUser[user] || 0) }))
      .filter(u => u.diff > 0);

    const lenders = users
      .map(user => ({ user, diff: (paidByUser[user] || 0) - perUserShare }))
      .filter(u => u.diff > 0);

    const result: Settlement[] = [];
    let i = 0, j = 0;
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
    setDate(expense.date.slice(0, 10));
    setAmount(expense.amount.toString());
    setCategoryId(expense.category.id);
    setPaymentMethodId(expense.paymentMethod.id);
    setMemo(expense.memo || '');
  };
  const cancelEdit = () => {
    setEditingExpenseId(null);
    setDate('');
    setAmount('');
    setCategoryId('');
    setPaymentMethodId('');
    setMemo('');
  };

  // 支出追加
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

    if (error) handleError('支出追加失敗', error);
    else if (data) {
      const newExpense: Expense = {
        id: data.id,
        date: data.date,
        amount: data.amount,
        memo: data.memo,
        users: { name: userName ?? '不明' },
        category: Array.isArray(data.categories) ? data.categories[0] : data.categories,
        paymentMethod: Array.isArray(data.payment_methods) ? data.payment_methods[0] : data.payment_methods,
      };

      setExpenses(prev => {
        const updated = [...prev, newExpense].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        // キャッシュも更新
        setExpensesCache(cache => ({ ...cache, [selectedMonth]: updated }));
        return updated;
      });
    }
  };

  // 支出更新
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
      handleError('支出更新失敗', error);
    } else if (data) {
      setExpenses(prev => {
        const updated = prev.map(exp =>
          exp.id === editingExpenseId
            ? {
              ...exp,
              date: data.date,
              amount: data.amount,
              memo: data.memo,
              category: Array.isArray(data.categories) ? data.categories[0] : data.categories,
              paymentMethod: Array.isArray(data.payment_methods) ? data.payment_methods[0] : data.payment_methods
            }
            : exp
        );
        setExpensesCache(cache => ({ ...cache, [selectedMonth]: updated }));
        return updated;
      });
      cancelEdit();
    }
  };

  // 支出削除
  const handleDeleteExpense = async (id: string) => {
    if (!confirm('本当に削除しますか？')) return;

    const { error } = await supabase.from('expenses').delete().eq('id', id);
    if (error) {
      handleError('支出削除失敗', error);
    } else {
      setExpenses(prev => {
        const updated = prev.filter(e => e.id !== id);
        setExpensesCache(cache => ({ ...cache, [selectedMonth]: updated }));
        return updated;
      });
    }
  };

  return (
    <>
      <div>
        <h1>支出入力</h1>
        <ExpenseForm
          categories={categories}
          paymentMethods={paymentMethods}
          values={{ date, amount, categoryId, paymentMethodId, memo }}
          editing={!!editingExpenseId}
          onSubmit={editingExpenseId ? handleUpdateExpense : () => handleAddExpense({ date, amount, categoryId, paymentMethodId, memo })}
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
        <label htmlFor="month-select">月を選択:</label>
        <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}>
          {pastYearMonths.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <br /><br />
        {isLoading ? <p>読み込み中...</p> : <ExpenseList expenses={expenses} onEdit={startEditExpense} onDelete={handleDeleteExpense} />}
      </div>

      <div>
        <h1>支出集計</h1>
        <ExpenseSummary selectedMonth={selectedMonth} totalAmount={totalAmount} paidByUser={paidByUser} settlements={settlements} />
      </div>
    </>
  );
}
