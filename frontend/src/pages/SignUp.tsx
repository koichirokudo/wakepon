// src/pages/SignUp.tsx
import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

type User = {
  name: string;
  email: string;
  password: string;
};

export default function SignUp() {
  const [user, setUser] = useState<User>({ name: '', email: '', password: '' });
  const [message, setMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSignUp = async () => {
    setIsLoading(true);
    setMessage('');

    try {
      const { data, error } = await supabase.auth.signUp({
        email: user.email,
        password: user.password,
        options: {
          data: {
            name: user.name,
          },
        },
      });

      if (error) {
        setMessage(error.message);
      }    

      if (data && data.user) {
        setMessage('ユーザー登録が完了しました');
      } else {
        setMessage('ユーザー登録に失敗しました');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }

  };

  return (
    <div>
      <h1>ユーザー登録</h1>
      <form onSubmit={handleSignUp}>
        <input type="text" placeholder="名前" value={user.name} onChange={(e) => setUser({ ...user, name: e.target.value })} required />
        <input type="email" placeholder="メールアドレス" value={user.email} onChange={(e) => setUser({ ...user, email: e.target.value })} required  />
        <input type="password" placeholder="パスワード" value={user.password} onChange={(e) => setUser({ ...user, password: e.target.value })} required  />
        <input type="button" value="登録する" onClick={handleSignUp} />
        {isLoading && <p>登録中...</p>}
        {message && <p>{message}</p>}
      </form>
    </div>
  )
}