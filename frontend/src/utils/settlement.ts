// src/utils/settlement.ts
import type { Settlement } from '../types';

/**
 * ユーザー間の精算額を計算する
 *
 * @param paidByUser - ユーザー別の支払額 { "ユーザー名": 金額 }
 * @returns 精算情報の配列 { from: 借りた人, to: 貸した人, amount: 金額 }
 *
 * @example
 * const paidByUser = { "太郎": 3000, "花子": 1000 };
 * const result = calculateSettlements(paidByUser);
 * // => [{ from: "花子", to: "太郎", amount: 1000 }]
 */
export function calculateSettlements(paidByUser: Record<string, number>): Settlement[] {
  const users = Object.keys(paidByUser);

  // ユーザーが0人または1人の場合は精算不要
  if (users.length <= 1) {
    return [];
  }

  // 総支払額を計算
  const total = Object.values(paidByUser).reduce((sum, amount) => sum + amount, 0);

  // 一人当たりの負担額
  const perUserShare = total / users.length;

  // 借りている人（支払いが足りない人）のリストを作成
  const borrowers = users
    .map((user) => ({
      user,
      diff: perUserShare - (paidByUser[user] || 0),
    }))
    .filter((u) => u.diff > 0);

  // 貸している人（多く支払った人）のリストを作成
  const lenders = users
    .map((user) => ({
      user,
      diff: (paidByUser[user] || 0) - perUserShare,
    }))
    .filter((u) => u.diff > 0);

  // 精算リストを作成（借りている人から貸している人への送金）
  const settlements: Settlement[] = [];
  let i = 0; // borrowersのインデックス
  let j = 0; // lendersのインデックス

  while (i < borrowers.length && j < lenders.length) {
    const borrower = borrowers[i];
    const lender = lenders[j];

    // 借りている金額と貸している金額の小さい方を精算額とする
    const amount = Math.min(borrower.diff, lender.diff);

    settlements.push({
      from: borrower.user,
      to: lender.user,
      amount,
    });

    // 精算後の残額を更新
    borrower.diff -= amount;
    lender.diff -= amount;

    // 精算が完了した人は次の人に進む
    if (borrower.diff === 0) i++;
    if (lender.diff === 0) j++;
  }

  return settlements;
}

/**
 * ユーザー別の支払額マップを作成する
 *
 * @param expenses - 支出データの配列
 * @returns ユーザー別の支払額 { "ユーザー名": 金額 }
 */
export function calculatePaidByUser<T extends { users?: { name: string } | null; amount: number }>(
  expenses: T[]
): Record<string, number> {
  const map: Record<string, number> = {};

  expenses.forEach((expense) => {
    const name = expense.users?.name ?? '不明';
    map[name] = (map[name] || 0) + expense.amount;
  });

  return map;
}
