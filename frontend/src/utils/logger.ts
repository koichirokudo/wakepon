// src/utils/logger.ts

/**
 * 環境別ロガー
 * デバッグのため一時的に本番環境でも有効化
 */
export const logger = {
  log: (...args: any[]) => {
    console.log(...args);
  },

  error: (...args: any[]) => {
    console.error(...args);
  },

  warn: (...args: any[]) => {
    console.warn(...args);
  },

  info: (...args: any[]) => {
    console.info(...args);
  },

  debug: (...args: any[]) => {
    console.debug(...args);
  },
};
