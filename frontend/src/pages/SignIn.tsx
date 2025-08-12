// src/pages/SignIn.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export default function SignIn() {
  const [email, setEmail] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleSignIn = async () => {
    setIsLoading(true);
    setMessage('');

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email,
      });

      if (!error) {
        navigate('/verify-otp', { state: { email } });
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
        <input type="email" placeholder="メールアドレス" value={email} onChange={(e) => setEmail(e.target.value)} required /><br />
        <input type="button" value="ログインする" onClick={handleSignIn} /><br />
        <input type="button" value="新規登録はこちら" onClick={() => navigate('/signup')} /><br />
        {isLoading && <p>ログイン中...</p>}
        {message && <p>{message}</p>}
      </form>
    </div>
  );
}