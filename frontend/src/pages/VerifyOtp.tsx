// src/pages/VerifyOtp.tsx
import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useSearchParams } from 'react-router-dom';

export default function VerifyOtp() {
  const location = useLocation();
  const email = location.state?.email || '';
  const navigate = useNavigate();
  const [otp, setOtp] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchParams] = useSearchParams();
  const inviteCode = searchParams.get('invite_code');

  const handleVerifyOtp = async () => {
    setIsLoading(true);
    setMessage('');

    try {
      const { data: authData, error: authError } = await supabase.auth.verifyOtp({
        email: email,
        token: otp,
        type: 'email',
      });

      if (authError) {
        setMessage(`ログインに失敗ました ${authError.message}`);
        return;
      }

      // 既存のユーザーか確認する
      const { data: existingUser } = await supabase
        .from('household_members')
        .select('user_id')
        .eq('user_id', authData.user?.id)
        .maybeSingle();

      const isNewUser = !existingUser;

      if (isNewUser && authData?.user) {
        // 新規ユーザー処理
        if (inviteCode) {
          // RPC を使用して招待コードを処理
          // 招待コードがある場合は、招待コードを使用してグループに参加
          const { error } = await supabase.rpc('use_invite_code', {
            p_user_id: authData.user.id,
            p_invite_code: inviteCode,
          });
          if (error) {
            setMessage(`ユーザー登録処理に失敗しました ${error.message}`);
            return;
          }
        } else {
          // 招待コードがない場合は新しいグループを作成
          const { data, error } = await supabase.functions.invoke('create-group', {
            body: JSON.stringify({ userId: authData.user.id }),
          });

          if (error) {
            setMessage(`グループの作成に失敗しました: ${error.message}`);
            return;
          }
          if (!data.success) {
            setMessage(`グループの作成に失敗しました: ${data.error}`);
            return;
          }
        }
      }
      navigate('/');
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