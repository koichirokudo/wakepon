// src/pages/SignIn.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSearchParams } from 'react-router-dom';

export default function SignIn() {
  const { signin } = useAuth();
  const [email, setEmail] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inviteCode = searchParams.get('invite_code');

  const handleSignIn = async () => {
    setIsLoading(true);
    setMessage('');

    try {
      const { error } = await signin(email);

      if (!error) {
        navigate(`/verify-otp?invite_code=${inviteCode}`, { state: { email } });
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
        {isLoading && <p>ログイン中...</p>}
        {message && <p>{message}</p>}
      </form>
    </div>
  );
}