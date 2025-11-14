// src/hooks/useExpenseManager.ts
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import type {
  Expense,
  ExpenseInput,
  ExpenseInsertResult,
  ExpenseQueryResult,
} from '../types';
import { useErrorHandler } from '../utils/errorHandler';
import { useAuth } from '../contexts/AuthContext';

type UseExpenseManagerProps = {
  userId?: string;
  householdId?: string;
  selectedMonth: string;
};

type UseExpenseManagerReturn = {
  expenses: Expense[];
  isLoading: boolean;
  editingExpenseId: string | null;
  startEdit: (expense: Expense) => void;
  cancelEdit: () => void;
  addExpense: (expense: ExpenseInput) => Promise<void>;
  updateExpense: (expense: ExpenseInput) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
};

/**
 * 支出管理のカスタムフック
 * 支出のCRUD操作とキャッシュ管理を担当
 */
const normalizeRelation = <T,>(value: T | T[] | null | undefined): T | null => {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }
  return value ?? null;
};

export function useExpenseManager({
  userId,
  householdId,
  selectedMonth,
}: UseExpenseManagerProps): UseExpenseManagerReturn {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [expensesCache, setExpensesCache] = useState<Record<string, Expense[]>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);

  const { handleError, showSuccess } = useErrorHandler();
  const { user } = useAuth();

  // 月の支出取得（キャッシュを活用）
  useEffect(() => {
    if (!selectedMonth) return;

    // キャッシュから取得
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
        .select(`id, date, amount, memo, users(name), categories(id, name)`)
        .gte('date', startDate)
        .lt('date', endDate)
        .order('date', { ascending: false });

      if (error) {
        handleError(error, '費用の取得に失敗しました');
      } else {
        const mapped: Expense[] = (data || []).map((item: ExpenseQueryResult) => {
          const user = normalizeRelation(item.users);
          const category = normalizeRelation(item.categories) ?? {
            id: '',
            name: '不明',
          };

          return {
            id: item.id,
            date: item.date,
            amount: item.amount,
            memo: item.memo,
            users: user,
            category,
          };
        });

        setExpensesCache((prev) => ({ ...prev, [selectedMonth]: mapped }));
        setExpenses(mapped);
      }
      setIsLoading(false);
    };

    fetchExpenses();
  }, [selectedMonth, householdId]); // expensesCacheを依存配列から除外

  // 編集開始
  const startEdit = useCallback((expense: Expense) => {
    setEditingExpenseId(expense.id);
  }, []);

  // 編集キャンセル
  const cancelEdit = useCallback(() => {
    setEditingExpenseId(null);
  }, []);

  // 支出追加
  const addExpense = useCallback(
    async (expense: ExpenseInput) => {
      if (!userId || !householdId) {
        handleError(
          new Error('グループIDまたはユーザーIDが設定されていません'),
          '支出追加エラー'
        );
        return;
      }

      const amt = parseFloat(expense.amount);
      if (Number.isNaN(amt) || amt <= 0) {
        handleError(new Error('金額が不正です'), '支出追加エラー');
        return;
      }

      const { data, error } = await supabase
        .from('expenses')
        .insert({
          household_id: householdId,
          user_id: userId,
          date: expense.date,
          amount: amt,
          category_id: expense.categoryId,
          memo: expense.memo,
        })
        .select(`id, date, amount, memo, categories(id, name)`)
        .single();

      if (error) {
        handleError(error, '支出追加失敗');
      } else if (data) {
        const result = data as ExpenseInsertResult;
        const category = normalizeRelation(result.categories) ?? {
          id: '',
          name: '不明',
        };

        const newExpense: Expense = {
          id: result.id,
          date: result.date,
          amount: result.amount,
          memo: result.memo,
          users: user ? { name: user.name } : { name: '不明' },
          category,
        };

        setExpenses((prev) => {
          const updated = [...prev, newExpense].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          setExpensesCache((cache) => ({ ...cache, [selectedMonth]: updated }));
          return updated;
        });

        showSuccess('支出を追加しました');
      }
    },
    [userId, householdId, selectedMonth, handleError, showSuccess]
  );

  // 支出更新
  const updateExpense = useCallback(
    async (expense: ExpenseInput) => {
      if (!editingExpenseId) return;

      if (!userId || !householdId) {
        handleError(
          new Error('グループIDまたはユーザーIDが設定されていません'),
          '支出更新エラー'
        );
        return;
      }

      const amt = parseFloat(expense.amount);
      if (Number.isNaN(amt) || amt <= 0) {
        handleError(new Error('金額が不正です'), '支出更新エラー');
        return;
      }

      const { data, error } = await supabase
        .from('expenses')
        .update({
          date: expense.date,
          amount: amt,
          category_id: expense.categoryId,
          memo: expense.memo,
        })
        .eq('id', editingExpenseId)
        .select(`id, date, amount, memo, categories(id, name)`)
        .single();

      if (error) {
        handleError(error, '支出更新失敗');
      } else if (data) {
        const result = data as ExpenseInsertResult;
        setExpenses((prev) => {
          const category = normalizeRelation(result.categories) ?? {
            id: '',
            name: '不明',
          };

          const updated = prev.map((exp) =>
            exp.id === editingExpenseId
              ? {
                  ...exp,
                  date: result.date,
                  amount: result.amount,
                  memo: result.memo,
                  category,
                }
              : exp
          );
          setExpensesCache((cache) => ({ ...cache, [selectedMonth]: updated }));
          return updated;
        });
        showSuccess('支出を更新しました');
        cancelEdit();
      }
    },
    [editingExpenseId, userId, householdId, selectedMonth, handleError, showSuccess, cancelEdit]
  );

  // 支出削除
  const deleteExpense = useCallback(
    async (id: string) => {
      if (!confirm('本当に削除しますか？')) return;

      const { error } = await supabase.from('expenses').delete().eq('id', id);
      if (error) {
        handleError(error, '支出削除失敗');
      } else {
        setExpenses((prev) => {
          const updated = prev.filter((e) => e.id !== id);
          setExpensesCache((cache) => ({ ...cache, [selectedMonth]: updated }));
          return updated;
        });
        showSuccess('支出を削除しました');
      }
    },
    [selectedMonth, handleError, showSuccess]
  );

  return {
    expenses,
    isLoading,
    editingExpenseId,
    startEdit,
    cancelEdit,
    addExpense,
    updateExpense,
    deleteExpense,
  };
}
