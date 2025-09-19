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

  // リロード時に getSession を呼ぶ
  useEffect(() => {
    let isMounted = true;
    let timeoutId: number;

    const initialize = async () => {
      setIsLoading(true);
      try {
        console.log('getSession before');

        // タイムアウト付きでgetSessionを実行
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) => {
          timeoutId = window.setTimeout(() => {
            reject(new Error('getSession timeout'));
          }, 5000); // 5秒でタイムアウト
        });

        const { data: { session }, error } = await Promise.race([
          sessionPromise,
          timeoutPromise
        ]) as any;

        clearTimeout(timeoutId);
        console.log('getSession after');

        if (!isMounted) return;

        if (error || !session) {
          setSession(null);
          setUser(null);
          setMember(null);
          return;
        }

        setSession(session);

        if (session.user) {
          const [userRes, memberRes] = await Promise.all([
            supabase.from("users").select().eq("id", session.user.id).single(),
            supabase.from("household_members").select().eq("user_id", session.user.id).single()
          ]);
          if (!isMounted) return;

          setUser(userRes.data || null);
          setMember(memberRes.data || null);
        }
      } catch (err) {
        clearTimeout(timeoutId);
        if (!isMounted) return;
        console.error("Error initializing auth:", err);
        setSession(null);
        setUser(null);
        setMember(null);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    initialize();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, []);

  // サインイン・サインアウト・トークン更新
  useEffect(() => {
    let isMounted = true;

    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;

      if (event === 'SIGNED_OUT' || !session) {
        setSession(null);
        setUser(null);
        setMember(null);
        setIsLoading(false);
      } else if (event === 'SIGNED_IN' && session?.user) {
        setIsLoading(true);
        setSession(session);

        try {
          const [userRes, memberRes] = await Promise.all([
            supabase.from("users").select().eq("id", session.user.id).single(),
            supabase.from("household_members").select().eq("user_id", session.user.id).single()
          ]);

          if (!isMounted) return;

          setUser(userRes.data || null);
          setMember(memberRes.data || null);
        } catch (err) {
          console.error("Error fetching user or member:", err);
          setUser(null);
          setMember(null);
        } finally {
          if (isMounted) setIsLoading(false);
        }
      } else if (event === 'TOKEN_REFRESHED' && session) {
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
