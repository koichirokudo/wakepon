// src/contexts/AuthContext.tsx
import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { AuthError, AuthOtpResponse, Session } from '@supabase/supabase-js';
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

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [member, setMember] = useState<Member | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const signin = async (email: string) => {
    return await supabase.auth.signInWithOtp({ email });
  };

  const signout = async () => {
    setUser(null);
    setMember(null);
    setSession(null);
    const result = await supabase.auth.signOut();
    setIsLoading(false);
    return result;
  };

  // ユーザーとメンバーデータを取得する共通関数
  const fetchUserAndMember = async (userId: string) => {
    logger.log('[Auth] ユーザーID:', userId);
    const [userRes, memberRes] = await Promise.all([
      supabase.from("users").select().eq("id", userId).single(),
      supabase.from("household_members").select().eq("user_id", userId).single()
    ]);

    logger.log('[Auth] データベースクエリ完了:', {
      hasUser: !!userRes.data,
      hasMember: !!memberRes.data,
      userError: userRes.error,
      memberError: memberRes.error
    });

    return { user: userRes.data || null, member: memberRes.data || null };
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
          setUser(null);
          setMember(null);
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

          setUser(userData);
          setMember(memberData);
          logger.log('[Auth] ユーザーとメンバー情報設定完了');
        }
      } catch (err) {
        if (!isMounted) return;
        logger.error("[Auth] エラー:", err);
        setSession(null);
        setUser(null);
        setMember(null);
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

    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      logger.log('[Auth] onAuthStateChange:', { event, hasSession: !!session, isMounted, isInitialEvent });

      if (!isMounted) return;

      // 初回のSIGNED_INイベントは無視（初期化useEffectで処理済み）
      if (isInitialEvent && event === 'SIGNED_IN') {
        logger.log('[Auth] 初回SIGNED_INイベントをスキップ');
        isInitialEvent = false;
        return;
      }
      isInitialEvent = false;

      if (event === 'SIGNED_OUT' || !session) {
        logger.log('[Auth] SIGNED_OUT または セッションなし');
        setSession(null);
        setUser(null);
        setMember(null);
        setIsLoading(false);
      } else if (event === 'SIGNED_IN' && session?.user) {
        logger.log('[Auth] SIGNED_IN イベント、データ取得開始');
        setIsLoading(true);
        setSession(session);

        try {
          const { user: userData, member: memberData } = await fetchUserAndMember(session.user.id);

          if (!isMounted) return;

          setUser(userData);
          setMember(memberData);
        } catch (err) {
          logger.error("[Auth] SIGNED_IN データ取得エラー:", err);
          setUser(null);
          setMember(null);
        } finally {
          if (isMounted) {
            logger.log('[Auth] SIGNED_IN 処理完了、ローディング終了');
            setIsLoading(false);
          }
        }
      } else if (event === 'TOKEN_REFRESHED' && session) {
        logger.log('[Auth] TOKEN_REFRESHED イベント');
        setSession(session);
      }
    });

    return () => {
      isMounted = false;
      listener?.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ session, user, member, isLoading, signin, signout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
