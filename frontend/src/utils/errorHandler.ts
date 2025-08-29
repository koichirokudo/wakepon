// src/utils/errorHandler.ts
import { useState } from "react";

export type AppError = {
  code: string;
  message: string;
  details?: string;
};

export class ErrorHandler {
  static handleSupabaseError(error: any): AppError {
    console.error('Supabase error:', error);
    
    // Supabase エラーコードに基づく分類
    switch (error?.code) {
      case 'PGRST116':
        return {
          code: 'NOT_FOUND',
          message: 'データが見つかりませんでした',
          details: error.message
        };
      case '23505': // unique_violation
        return {
          code: 'DUPLICATE',
          message: '同じデータが既に存在します',
          details: error.message
        };
      case '23503': // foreign_key_violation
        return {
          code: 'INVALID_REFERENCE',
          message: '参照データが無効です',
          details: error.message
        };
      default:
        return {
          code: 'DATABASE_ERROR',
          message: 'データベースエラーが発生しました',
          details: error?.message || 'Unknown error'
        };
    }
  }

  static handleValidationError(field: string, message: string): AppError {
    return {
      code: 'VALIDATION_ERROR',
      message: `${field}: ${message}`
    };
  }

  static handleNetworkError(error: any): AppError {
    console.error('Network error:', error);
    return {
      code: 'NETWORK_ERROR',
      message: 'ネットワークエラーが発生しました。接続を確認してください。',
      details: error?.message
    };
  }
}

// カスタムフック
export const useErrorHandler = () => {
  const [error, setError] = useState<AppError | null>(null);

  const handleError = (error: any, context?: string) => {
    let appError: AppError;
    
    if (error?.message?.includes('fetch')) {
      appError = ErrorHandler.handleNetworkError(error);
    } else {
      appError = ErrorHandler.handleSupabaseError(error);
    }
    
    if (context) {
      appError.message = `${context}: ${appError.message}`;
    }
    
    setError(appError);
  };

  const clearError = () => setError(null);

  return { error, handleError, clearError };
};