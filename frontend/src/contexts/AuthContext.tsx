// src/contexts/AuthContext.tsx
import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { AuthError, AuthOtpResponse, Session, AuthChangeEvent } from '@supabase/supabase-js';
import type { Member, User } from '../types';
import { logger } from '../utils/logger';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  member: Member | null;
  isLoading: boolean;
  signin: (email: string) => Promise<AuthOtpResponse>;
  signout: () => Promise<{ error: AuthError | null }>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// localStorageのキー
const USER_CACHE_KEY = 'wakepon_user_cache';
const MEMBER_CACHE_KEY = 'wakepon_member_cache';

// localStorageから復元
const getCachedUser = (): User | null => {
  try {
    const cached = localStorage.getItem(USER_CACHE_KEY);
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
};

const getCachedMember = (): Member | null => {
  try {
    const cached = localStorage.getItem(MEMBER_CACHE_KEY);
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  // 初期値をlocalStorageから復元
  const [user, setUser] = useState<User | null>(getCachedUser);
  const [member, setMember] = useState<Member | null>(getCachedMember);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // userを更新する関数（localStorageにも保存）
  const updateUser: React.Dispatch<React.SetStateAction<User | null>> = (action) => {
    setUser((prev) => {
      const newUser = typeof action === 'function' ? action(prev) : action;
      if (newUser) {
        localStorage.setItem(USER_CACHE_KEY, JSON.stringify(newUser));
      } else {
        localStorage.removeItem(USER_CACHE_KEY);
      }
      return newUser;
    });
  };

  // memberを更新する関数（localStorageにも保存）
  const updateMember: React.Dispatch<React.SetStateAction<Member | null>> = (action) => {
    setMember((prev) => {
      const newMember = typeof action === 'function' ? action(prev) : action;
      if (newMember) {
        localStorage.setItem(MEMBER_CACHE_KEY, JSON.stringify(newMember));
      } else {
        localStorage.removeItem(MEMBER_CACHE_KEY);
      }
      return newMember;
    });
  };

  const signin = async (email: string) => {
    return await supabase.auth.signInWithOtp({ email });
  };

  const signout = async () => {
    updateUser(null);
    updateMember(null);
    setSession(null);
    const result = await supabase.auth.signOut();
    setIsLoading(false);
    return result;
  };

  // タイムアウト付きPromiseヘルパー
  const withTimeout = <T,>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error(`タイムアウト: ${timeoutMs}ms経過`)), timeoutMs)
      ),
    ]);
  };

  // ユーザーとメンバーデータを取得する共通関数
  const fetchUserAndMember = async (userId: string) => {
    logger.log('[Auth] ユーザーID:', userId);

    try {
      logger.log('[Auth] データベースクエリ開始');

      // 3秒のタイムアウトを設定（タブ切り替えでは通常スキップされるので、これは念のため）
      const [userRes, memberRes] = await withTimeout(
        Promise.all([
          supabase.from("users").select().eq("id", userId).single(),
          supabase.from("household_members").select().eq("user_id", userId).single()
        ]),
        3000
      );

      logger.log('[Auth] データベースクエリ完了:', {
        hasUser: !!userRes.data,
        hasMember: !!memberRes.data,
        userError: userRes.error,
        memberError: memberRes.error
      });

      return { user: userRes.data || null, member: memberRes.data || null };
    } catch (error) {
      logger.error('[Auth] fetchUserAndMember エラー:', error);
      // タイムアウトやエラーの場合でもnullを返して続行
      return { user: null, member: null };
    }
  };

  // リロード時に getSession を呼ぶ
  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      setIsLoading(true);
      try {
        logger.log('[Auth] 初期化開始');

        const { data: { session }, error } = await supabase.auth.getSession();

        logger.log('[Auth] getSession完了:', { hasSession: !!session, error });

        if (!isMounted) {
          logger.log('[Auth] コンポーネントがアンマウントされました');
          return;
        }

        if (error || !session) {
          logger.log('[Auth] セッションなし、状態をクリア');
          setSession(null);
          updateUser(null);
          updateMember(null);
          return;
        }

        setSession(session);
        logger.log('[Auth] セッション設定完了、ユーザーデータ取得開始');

        if (session.user) {
          const { user: userData, member: memberData } = await fetchUserAndMember(session.user.id);

          if (!isMounted) {
            logger.log('[Auth] コンポーネントがアンマウントされました（クエリ後）');
            return;
          }

          updateUser(userData);
          updateMember(memberData);
          logger.log('[Auth] ユーザーとメンバー情報設定完了');
        }
      } catch (err) {
        if (!isMounted) return;
        logger.error("[Auth] エラー:", err);
        setSession(null);
        updateUser(null);
        updateMember(null);
      } finally {
        if (isMounted) {
          logger.log('[Auth] 初期化完了、ローディング終了');
          setIsLoading(false);
        }
      }
    };

    initialize();

    return () => {
      isMounted = false;
    };
  }, []);

  // サインイン・サインアウト・トークン更新
  useEffect(() => {
    let isMounted = true;
    let isInitialEvent = true; // 初回イベントかどうかのフラグ
    let isProcessingSIGNED_IN = false; // SIGNED_IN処理中フラグ

    const { data: listener } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
      logger.log('[Auth] onAuthStateChange:', { event, hasSession: !!session, isMounted, isInitialEvent, isProcessingSIGNED_IN });

      if (!isMounted) return;

      // 初回のINITIAL_SESSIONイベントは無視（初期化useEffectで処理済み）
      if (isInitialEvent) {
        logger.log('[Auth] 初回イベントをスキップ:', event);
        isInitialEvent = false;
        return;
      }

      // SIGNED_IN処理中の場合は重複イベントをスキップ
      if (event === 'SIGNED_IN' && isProcessingSIGNED_IN) {
        logger.log('[Auth] SIGNED_IN処理中のため重複イベントをスキップ');
        return;
      }

      if (event === 'SIGNED_OUT' || !session) {
        logger.log('[Auth] SIGNED_OUT または セッションなし');
        setSession(null);
        updateUser(null);
        updateMember(null);
        setIsLoading(false);
      } else if (event === 'SIGNED_IN' && session?.user) {
        logger.log('[Auth] SIGNED_IN イベント検出');

        setSession(session);

        // 既にユーザーデータがある場合は何もしない（タブ切り替え対策）
        if (user && member) {
          logger.log('[Auth] 既存データあり、データ取得をスキップ');
          setIsLoading(false);
          return;
        }

        // 初回ログイン時のみデータ取得
        logger.log('[Auth] 初回ログイン、データ取得開始');
        isProcessingSIGNED_IN = true; // 処理開始フラグをON
        setIsLoading(true);

        try {
          logger.log('[Auth] fetchUserAndMember 呼び出し前');
          const { user: userData, member: memberData } = await fetchUserAndMember(session.user.id);
          logger.log('[Auth] fetchUserAndMember 呼び出し後:', { hasUser: !!userData, hasMember: !!memberData });

          if (!isMounted) {
            logger.log('[Auth] コンポーネントアンマウント検出、処理中断');
            isProcessingSIGNED_IN = false;
            return;
          }

          logger.log('[Auth] ユーザー状態更新開始');
          updateUser(userData);
          updateMember(memberData);
          logger.log('[Auth] ユーザー状態更新完了');
        } catch (err) {
          logger.error("[Auth] 初回データ取得エラー:", err);
          updateUser(null);
          updateMember(null);
        } finally {
          if (isMounted) {
            logger.log('[Auth] SIGNED_IN 処理完了、ローディング終了');
            setIsLoading(false);
          }
          isProcessingSIGNED_IN = false; // 処理完了フラグをOFF
        }
      } else if (event === 'TOKEN_REFRESHED' && session) {
        logger.log('[Auth] TOKEN_REFRESHED イベント');
        setSession(session);
        // TOKEN_REFRESHEDの場合、ユーザーデータは変わらないのでisLoadingは触らない
      } else {
        // その他のイベント（USER_UPDATED、INITIAL_SESSIONなど）
        logger.log('[Auth] その他のイベント:', event);
        // セッションがあればそのまま継続、なければクリア
        if (session) {
          setSession(session);
        }
        // 念のため、isLoadingをfalseにする
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
      listener?.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ session, user, member, isLoading, signin, signout, setUser: updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
