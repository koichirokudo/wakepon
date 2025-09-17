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
    <>
      <div className="summary-grid">
        <div className="summary-item">
          <div className="summary-label">
            {selectedMonth.replace('-', '/')}の総支出
          </div>
          <div className="summary-value">
            {totalAmount.toLocaleString()}円
          </div>
        </div>
        {Object.entries(paidByUser).map(([user, amount]) => (
          <div key={user} className="summary-item">
            <div className="summary-label">{user}の支払</div>
            <div className="summary-value">{amount.toLocaleString()}円</div>
          </div>
        ))}
      </div>

      {/* 精算 */}
      <div>
        <h3 style={{ fontWeight: 'bold', marginBottom: 'clamp(8px, 2vw, 12px)' }}>精算</h3>
        <div className="settlement-list">
          {settlements.length === 0 ? (
            <div className="settlement-item">
              <span className="settlement-text">精算は不要です</span>
            </div>
          ) : (
            settlements.map(({ from, to, amount}, i) => (
              <div key={i} className="settlement-item">
                <span className="settlement-text">{from} → {to}</span>
                <span className="settlement-amount">{amount.toLocaleString()}円</span>
              </div>
            ))
          )}
        </div>
      </div>
  </>
  );
}
