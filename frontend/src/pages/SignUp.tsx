// src/pages/SignUp.tsx
import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useSearchParams } from 'react-router-dom';

type User = {
  name: string;
  email: string;
  password: string;
};

export default function SignUp() {
  const [user, setUser] = useState<User>({ name: '', email: '', password: '' });
  const [message, setMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchParams] = useSearchParams();
  const inviteCode = searchParams.get('invite_code');

  const handleSignUp = async () => {
    setIsLoading(true);
    setMessage('');

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: user.email,
        password: user.password,
        options: {
          data: {
            name: user.name,
          },
        },
      });

      if (authError) {
        setMessage(authError.message);
      }

      if (authData?.user) {
        // ユーザー登録後の処理
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
            body: JSON.stringify({ userId: authData.user.id, userName: user.name }),
          });

          if (error) {
            setMessage(`グループの作成に失敗しました: ${error.message}`);
            return;
          }
          if (!data.success) {
            setMessage(`グループの作成に失敗しました: ${data.error}`);
          }
        }

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
        <input type="text" placeholder="名前" value={user.name} onChange={(e) => setUser({ ...user, name: e.target.value })} required /><br />
        <input type="email" placeholder="メールアドレス" value={user.email} onChange={(e) => setUser({ ...user, email: e.target.value })} required /><br />
        <input type="password" placeholder="パスワード" value={user.password} onChange={(e) => setUser({ ...user, password: e.target.value })} required /><br />
        <br />
        <input type="button" value="登録する" onClick={handleSignUp} />
        {isLoading && <p>登録中...</p>}
        {message && <p>{message}</p>}
      </form>
    </div>
  )
}