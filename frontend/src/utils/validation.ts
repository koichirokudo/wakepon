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
      value: 10,
      message: "メモは10文字以内で入力してください"
    }
  },

  token: {
    maxLength: {
      value: 6,
      message: "認証コードは6桁の数値を入力してください"
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

  username: {
    minLength: {
      value: 1,
      message: "ユーザー名は1文字以上入力してください"
    },
    maxLength: {
      value: 20,
      message: "ユーザー名は20文字以内で入力してください"
    },
    pattern: {
      value: /^[a-zA-Z0-9あ-んア-ヶー\s]*$/,
      message: "ユーザー名に使用できない文字が含まれています"
    }
  },

  name: {
    minLength: {
      value: 1,
      message: "名前は1文字以上入力してください"
    },
    maxLength: {
      value: 20,
      message: "名前は20文字以内で入力してください"
    },
    pattern: {
      value: /^[a-zA-Z0-9あ-んア-ヶー\s]*$/,
      message: "名前に使用できない文字が含まれています"
    }
  },

  image: {
    validate: {
      fileSize: (files: FileList) => {
        if (files && files[0]) {
          const file = files[0];
          const maxSize = 5 * 1024 * 1024;
          return file.size <= maxSize || 'ファイルサイズは5MB以下にしてください';
        }
        return true;
      },
      fileType: (files: FileList) => {
        if (files && files[0]) {
          const file = files[0];
          const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
          return allowedTypes.includes(file.type) || 'JPEG、PNG、GIF、WebP形式のみ対応しています';
        }
        return true;
      }
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