// src/pages/VerifyOtp.tsx
import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function VerifyOtp() {
  const location = useLocation();
  const email = location.state?.email || '';
  const navigate = useNavigate();
  const [otp, setOtp] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleVerifyOtp = async () => {
    setIsLoading(true);
    setMessage('');

    try {
      const { error } = await supabase.auth.verifyOtp({
        email: email,
        token: otp,
        type: 'email',
      });

      if (error) {
        setMessage(`ログインに失敗ました ${error.message}`);
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error(error);
      setMessage('エラーが発生しました。');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      <h1>認証コードの入力</h1>
      <form onSubmit={(e) => e.preventDefault()}>
        <input
          type="text"
          placeholder="認証コードを入力してください"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
        /><br />
        <input
          type="button"
          value="ログインする"
          onClick={handleVerifyOtp}
        /><br />
        {isLoading && <p>認証中..</p>}
        {message && <p>{message}</p>}
      </form>
    </div>
  );
}