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
    return await supabase.auth.signOut();
  }

  // セッションの読み取り onAuthStateChange で常に最新状態を保つ
  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        setSession(null);
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
      setIsLoading(false);
    }

    // 初回取得
    initialize();

    // 認証状態が変化したときに自動で再取得
    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        initialize();
      } else {
        setUser(null);
        setMember(null);
      }
    });

    return () => {
      // クリーンアップ
      listener?.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ session, user, member, isLoading, signin, signout }}>
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