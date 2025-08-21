// src/contexts/AuthContext.tsx
import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { AuthError, AuthOtpResponse } from '@supabase/supabase-js';

type AuthContextType = {
  userId: string | null;
  email: string | null;
  householdId: string | null;
  userName: string | null;
  isLoading: boolean;
  signin: (email: string) => Promise<AuthOtpResponse>;
  signout: () => Promise<{ error: AuthError | null; }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [householdId, setHouseholdId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
    let mounted = true;

    const loadSession = async () => {
      setIsLoading(true);
      const { data } = await supabase.auth.getSession();
      const uid = data.session?.user.id ?? null;
      const mail = data.session?.user.email ?? null;
      if (!mounted) return;

      if (uid) {
        setUserId(uid);
        setEmail(mail);

        try {
          // household_id と userName を取得
          const { data: members } = await supabase
            .from('household_members')
            .select('household_id')
            .eq('user_id', uid)
            .limit(1)
            .maybeSingle();
          if (members) setHouseholdId(members.household_id);

          const { data: userData } = await supabase
            .from('users')
            .select('name')
            .eq('id', uid)
            .limit(1)
            .maybeSingle();
          if (userData) setUserName(userData.name);
        } catch (err) {
          console.error('Error during session loading:', err);
        }
      } else {
        setUserId(null);
        setEmail(null);
        setHouseholdId(null);
        setUserName(null);
      }
      if (mounted) {
        setIsLoading(false);
      }
    };

    loadSession();

    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      const uid = session?.user.id ?? null;
      const mail = session?.user.email ?? null;
      if (uid) {
        setUserId(uid);
        setEmail(mail);
        try {
          const { data: member, error: memberError } = await supabase
            .from('household_members')
            .select('household_id')
            .eq('user_id', uid)
            .maybeSingle();


          if (member?.household_id) setHouseholdId(member.household_id);
          else setHouseholdId(null);

          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('name')
            .eq('id', uid)
            .maybeSingle();


          if (userData) setUserName(userData.name);
          else setUserName(null);
        } catch (err) {
          console.error('Error in fetching member or user:', err);
        }
      } else {
        setUserId(null);
        setEmail(null);
        setHouseholdId(null);
        setUserName(null);
      }
      setIsLoading(false);
    });

    return () => {
      mounted = false;
      listener?.subscription.unsubscribe();
    };

  }, []);

  return (
    <AuthContext.Provider value={{ userId, email, householdId, userName, isLoading, signin, signout }}>
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