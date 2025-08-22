export type User = {
  id: string;
  name: string;
  created_at: Date;
  updated_at: Date;
};

export type Member = {
  id: string;
  household_id: string;
  user_id: string;
  created_at: Date;
  updated_at: Date;
}

export type Expense = {
  id: string;
  date: string;
  amount: number;
  users: { name: string };
  category: { id: string; name: string };
  paymentMethod: { id: string; name: string };
  memo?: string;
};

export type ExpenseInput = {
  date: string;
  amount: string;
  categoryId: string;
  paymentMethodId: string;
  memo?: string;
};

export type Settlement = {
  from: string;
  to: string;
  amount: number;
};

export type Category = {
  id: string;
  name: string;
  is_custom: boolean;
};


export type Invite = {
  email: string;
};

