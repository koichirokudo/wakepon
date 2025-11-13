export type User = {
  id: string;
  name: string;
  avatar_filename: string | null;
  avatar_url: string | null;
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
  date: string; // ISO日付文字列
  amount: number;
  users: { name: string } | null;
  category: { id: string; name: string };
  memo?: string;
};

export type ExpenseInput = {
  date: string;
  amount: string; // フォームでは文字列
  categoryId: string;
  memo?: string;
};

export type Settlement = {
  from: string;
  to: string;
  amount: number;
};

// Supabaseクエリ結果の型定義
export type ExpenseQueryResult = {
  id: string;
  date: string;
  amount: number;
  memo: string;
  users: { name: string } | null;
  categories: { id: string; name: string } | { id: string; name: string }[] | null;
};

export type ExpenseInsertResult = {
  id: string;
  date: string;
  amount: number;
  memo: string;
  categories: { id: string; name: string } | { id: string; name: string }[] | null;
};

export type Category = {
  id: string;
  name: string;
  is_custom: boolean;
  created_at: Date;
  updated_at: Date;
};

export type CategoryInsert = {
  id: string;
  name: string;
};
export type HouseHoldCategory = {
  id: string;
  household_id: string;
  category_id: string;
  is_custom: boolean;
};

export type HouseholdCategoryInsert = {
  household_id: string;
  category_id: string;
};

export type InviteInput = {
  email: string;
};

export type SigninInput = {
  email: string;
}

export type ProfileInput = {
  email: string;
  name: string;
}

export type VerifyOtpInput = {
  token: string;
}

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
}

// フォームバリデーション用の型
export type ValidationError = {
  field: string;
  message: string;
};