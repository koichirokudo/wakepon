// src/contexts/AuthContext.tsx
import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { AuthError, AuthOtpResponse, Session } from '@supabase/supabase-js';
import type { Member, User } from '../types';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  member: Member | null;
  isLoading: boolean;
  signin: (email: string) => Promise<AuthOtpResponse>;
  signout: () => Promise<{ error: AuthError | null; }>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [member, setMember] = useState<Member | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const signin = async (email: string) => {
    return await supabase.auth.signInWithOtp({
      email: email,
    });
  }

  const signout = async () => {
    // サインアウト前に状態をクリア
    setUser(null);
    setMember(null);
    setSession(null);
    
    const result = await supabase.auth.signOut();
    
    // サインアウト後も確実に状態をクリア
    setIsLoading(false);
    
    return result;
  }

  // セッションの読み取り onAuthStateChange で常に最新状態を保つ
  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          setSession(null);
          setUser(null);
          setMember(null);
          setIsLoading(false);
          return;
        }

        setSession(session);
        
        if (session?.user) {
          try {
            const [userRes, memberRes] = await Promise.all([
              supabase.from("users").select().eq("id", session.user.id).single(),
              supabase.from("household_members").select().eq("user_id", session.user.id).single()
            ]);

            if (userRes.data) {
              setUser(userRes.data);
            }
            if (memberRes.data) {
              setMember(memberRes.data);
            }
          } catch (error) {
            console.error("Error fetching user or member:", error);
            setUser(null);
            setMember(null);
          }
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        setSession(null);
        setUser(null);
        setMember(null);
      } finally {
        setIsLoading(false);
      }
    }

    // 初回取得
    initialize();

    // 認証状態が変化したときに自動で再取得
    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session);
      
      if (event === 'SIGNED_OUT' || !session) {
        // サインアウト時は即座に状態をクリア
        setSession(null);
        setUser(null);
        setMember(null);
        setIsLoading(false);
      } else if (event === 'SIGNED_IN' && session?.user) {
        // サインイン時は初期化処理を実行
        setIsLoading(true);
        setSession(session);
        
        try {
          const [userRes, memberRes] = await Promise.all([
            supabase.from("users").select().eq("id", session.user.id).single(),
            supabase.from("household_members").select().eq("user_id", session.user.id).single()
          ]);

          if (userRes.data) {
            setUser(userRes.data);
          }
          if (memberRes.data) {
            setMember(memberRes.data);
          }
        } catch (error) {
          console.error("Error fetching user or member:", error);
          setUser(null);
          setMember(null);
        } finally {
          setIsLoading(false);
        }
      } else if (event === 'TOKEN_REFRESHED' && session) {
        // トークン更新時はセッションのみ更新
        setSession(session);
      }
    });

    return () => {
      // クリーンアップ
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
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
