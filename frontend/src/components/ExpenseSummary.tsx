// src/components/ExpenseSummary.tsx
import type { Settlement } from '../types';

type ExpenseSummaryProps = {
  selectedMonth: string;
  totalAmount: number;
  paidByUser: Record<string, number>;
  settlements: Settlement[];
};

export default function ExpenseSummary({ selectedMonth, totalAmount, paidByUser, settlements }: ExpenseSummaryProps) {
  return (
    <div>
      <h2>{selectedMonth}の総支出額: {totalAmount.toLocaleString()}円</h2>
      <h3>ユーザー別支払額</h3>
      <ul>
        {Object.entries(paidByUser).map(([user, amount]) => (
          <li key={user}>{user}: {amount.toLocaleString()}円</li>
        ))}
      </ul>
      <h3>精算が必要な金額</h3>
      {settlements.length === 0 ? (
        <p>精算は不要です</p>
      ) : (
        <ul>
          {settlements.map(({ from, to, amount }, i) => (
            <li key={i}>{from} → {to}: {amount.toLocaleString()}円</li>
          ))}
        </ul>
      )}
    </div>
  );
}
