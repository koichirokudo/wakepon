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
        setUser(null);
        setMember(null);
        setIsLoading(false);
      } else if (event === 'SIGNED_IN' && session?.user) {
        logger.log('[Auth] SIGNED_IN イベント、データ取得開始');
        isProcessingSIGNED_IN = true; // 処理開始フラグをON
        setIsLoading(true);
        setSession(session);

        try {
          const { user: userData, member: memberData } = await fetchUserAndMember(session.user.id);

          if (!isMounted) {
            isProcessingSIGNED_IN = false;
            return;
          }

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
