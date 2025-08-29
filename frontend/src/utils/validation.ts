// src/utils/validation.ts

export const validationRules = {
  email: {
    required: "メールアドレスを入力してください",
    pattern: {
      value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      message: "正しいメールアドレスを入力してください"
    }
  },
  
  categoryName: {
    required: "カテゴリ名を入力してください",
    maxLength: { 
      value: 10, 
      message: "10文字以内で入力してください" 
    },
    minLength: {
      value: 1,
      message: "1文字以上入力してください"
    }
  },
  
  expenseDate: {
    required: "日付を入力してください",
    validate: (value: string) => {
      const date = new Date(value);
      const now = new Date();
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(now.getFullYear() - 1);
      
      if (date > now) {
        return "未来の日付は入力できません";
      }
      if (date < oneYearAgo) {
        return "1年以上前の日付は入力できません";
      }
      return true;
    }
  },
  
  expenseAmount: {
    required: "金額を入力してください",
    min: {
      value: 1,
      message: "1円以上の金額を入力してください"
    },
    max: {
      value: 10000000,
      message: "1000万円以下の金額を入力してください"
    },
    validate: (value: string) => {
      const num = parseFloat(value);
      if (isNaN(num)) {
        return "有効な数値を入力してください";
      }
      if (num % 1 !== 0) {
        return "整数を入力してください";
      }
      return true;
    }
  },
  
  memo: {
    maxLength: {
      value: 100,
      message: "メモは100文字以内で入力してください"
    }
  }
};

// カスタムバリデーション関数
export const validateRequired = (fieldName: string) => (value: any) => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return `${fieldName}は必須です`;
  }
  return true;
};

export const validateEmail = (value: string) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(value)) {
    return "正しいメールアドレス形式で入力してください";
  }
  return true;
};

export const validatePositiveNumber = (value: string | number) => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num) || num <= 0) {
    return "0より大きい数値を入力してください";
  }
  return true;
};