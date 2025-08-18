export type User = {
  name: string;
  email: string;
  password: string;
};

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

