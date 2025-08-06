// src/pages/SignIn.tsx
import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

type User = {
  email: string;
  password: string;
};

export default function SignIn() {
  const [user, setUser] = useState<User>({ email: '', password: '' });
  const [message, setMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSignIn = async () => {
    setIsLoading(true);
    setMessage('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: user.password,
      });

      if (error) {
        setMessage('ログインに失敗しました: ' + error.message);
      } else if (data && data.user) {
        setMessage('ログインに成功しました');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1>ログイン</h1>
      <form onSubmit={(e) => e.preventDefault()}>
        <input type="email" placeholder="メールアドレス" value={user.email} onChange={(e) => setUser({ ...user, email: e.target.value })} required />
        <input type="password" placeholder="パスワード" value={user.password} onChange={(e) => setUser({ ...user, password: e.target.value })} required />
        <input type="button" value="ログインする" onClick={handleSignIn} />
        {isLoading && <p>ログイン中...</p>}
        {message && <p>{message}</p>}
      </form>
    </div>
  );
}