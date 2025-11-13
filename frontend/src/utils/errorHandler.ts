// src/utils/errorHandler.ts
import { useToast } from '../contexts/ToastContext';

export type AppError = {
  code: string;
  message: string;
  details?: string;
};

export class ErrorHandler {
  static handleSupabaseError(error: any): AppError {
    // 本番環境以外でのみコンソールログを出力
    if (import.meta.env.MODE !== 'production') {
      console.error('Supabase error:', error);
    }

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
    if (import.meta.env.MODE !== 'production') {
      console.error('Network error:', error);
    }
    return {
      code: 'NETWORK_ERROR',
      message: 'ネットワークエラーが発生しました。接続を確認してください。',
      details: error?.message
    };
  }
}

/**
 * エラーハンドリングとToast通知を統合したカスタムフック
 */
export const useErrorHandler = () => {
  const { showToast } = useToast();

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

    // Toast通知でエラーを表示
    showToast('error', appError.message);

    return appError;
  };

  const showSuccess = (message: string) => {
    showToast('success', message);
  };

  const showInfo = (message: string) => {
    showToast('info', message);
  };

  const showWarning = (message: string) => {
    showToast('warning', message);
  };

  return { handleError, showSuccess, showInfo, showWarning };
};