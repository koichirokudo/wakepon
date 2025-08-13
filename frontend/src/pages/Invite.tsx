// src/pages/Invite.tsx
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { nanoid } from 'nanoid';

type Invite = {
  email: string;
};

export default function Invite() {
  const { householdId, userName } = useAuth();
  const [invite, setInvite] = useState<Invite>({ email: '' });
  const [message, setMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const appOrigin = import.meta.env.VITE_APP_ORIGIN || 'http://localhost:5173';

  useEffect(() => {
    if (!householdId || !userName) {
      setMessage('ログイン情報が正しく取得できません。');
    } else {
      setMessage('');
    }
  }, [householdId, userName]);

  // 招待コードの生成関数
  // - nanoidを使ってランダムな12文字のコードを生成
  // - Math.random().toString(36).substring(...) に比べて安全性・一意性が高く、暗号学的により信頼できる
  // - 招待リンクなどで使われるため、ある程度短く・読みやすく・衝突しにくいことが求められる
  // - 12文字にすれば約2^72通りのユニーク性があり、一般的な使用規模での衝突リスクはほぼ無視できる
  //   参考: https://github.com/ai/nanoid#security
  const generateInviteCode = () => {
    return nanoid(12);
  }

  const handleInvite = async () => {
    setIsLoading(true);
    setMessage('');

    // 招待コードの生成と保存
    const code = generateInviteCode();
    await supabase.from('invite_codes').insert({
      email: invite.email,
      household_id: householdId,
      code: code,
      expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24時間後に期限切れ
    });

    try {
      // 招待メールの送信
      // ローカル環境でのテスト http://localhost:5173/signup?invite_code={code}
      const { data, error } = await supabase.functions.invoke('send-invite', {
        body: JSON.stringify({
          to: invite.email,
          subject: `【わけわけ】${userName}さんがあなたを招待しました`,
          html: `<p>こんにちは！共有家計簿アプリのわけわけです。</p>
          <p>あなたを${userName}さんがグループに招待しています。以下のリンクから参加してください。</p>
          <p><a href="${appOrigin}/signup?invite_code=${code}">招待リンク</a></p>`
        }),
      });

      if (error) {
        setMessage(error.message);
      } else if (data) {
        setMessage('招待メールを送信しました');
      }
    } catch (error) {
      console.error(error);
      setMessage('招待メールの送信に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1>ユーザー招待</h1>
      <form onSubmit={(e) => e.preventDefault()}>
        <input type="email" placeholder="招待するメールアドレス" value={invite.email} onChange={(e) => setInvite({ ...invite, email: e.target.value })} required />
        <input type="button" value="招待する" onClick={handleInvite} />
        {isLoading && <p>招待中...</p>}
        {message && <p>{message}</p>}
      </form>
    </div>
  );
}