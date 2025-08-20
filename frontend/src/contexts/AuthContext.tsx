// src/contexts/AuthContext.tsx
import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { AuthError, AuthOtpResponse } from '@supabase/supabase-js';

type AuthContextType = {
  userId: string | null;
  email: string | null;
  householdId: string | null;
  userName: string | null;
  signin: (email: string) => Promise<AuthOtpResponse>;
  signout: () => Promise<{ error: AuthError | null; }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [householdId, setHouseholdId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  const signin = async (email: string) => {
    return await supabase.auth.signInWithOtp({
      email: email,
    });
  }

  const signout = async () => {
    return await supabase.auth.signOut();
  }

  useEffect(() => {
    // 認証情報の取得
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      const uid = data.session?.user.id ?? null;
      const mail = data.session?.user.email ?? null;
      if (uid) {
        setUserId(uid);
        setEmail(mail);

        // household_idの取得
        const { data: members } = await supabase
          .from('household_members')
          .select('household_id')
          .eq('user_id', uid)
          .limit(1)
          .maybeSingle();
        if (members) {
          setHouseholdId(members.household_id);
        }

        // ユーザー名の取得
        const { data: userData } = await supabase
          .from('users')
          .select('name')
          .eq('id', uid)
          .limit(1)
          .maybeSingle();
        if (userData) {
          setUserName(userData.name);
        }
      }
    };

    getSession();
  }, []);

  return (
    <AuthContext.Provider value={{ userId, email, householdId, userName, signin, signout }}>
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