// src/pages/Invite.tsx
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { nanoid } from 'nanoid';
import type { InviteInput } from '../types';
import Card from '../components/ui/Card';
import { CardHeader, CardBody, CardFooter } from '../components/ui/Card';
import { useForm } from 'react-hook-form';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import opon from '../assets/opon4.png';
import heart from '../assets/heart.png';
import { validationRules } from '../utils/validation';

export default function Invite() {
  const { user, member } = useAuth();
  const { register, handleSubmit, formState: { errors } } = useForm<InviteInput>({
    defaultValues: { email: "" }
  });
  const [message, setMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const appOrigin = import.meta.env.VITE_APP_ORIGIN || 'http://localhost:5173';

  useEffect(() => {
    if (!user || !member) {
      setMessage('ログイン情報が正しく取得できません。');
    } else {
      setMessage('');
    }
  }, [user, member]);

  // 招待コードの生成関数
  // - nanoidを使ってランダムな12文字のコードを生成
  // - Math.random().toString(36).substring(...) に比べて安全性・一意性が高く、暗号学的により信頼できる
  // - 招待リンクなどで使われるため、ある程度短く・読みやすく・衝突しにくいことが求められる
  // - 12文字にすれば約2^72通りのユニーク性があり、一般的な使用規模での衝突リスクはほぼ無視できる
  //   参考: https://github.com/ai/nanoid#security
  const generateInviteCode = () => {
    return nanoid(12);
  }

  const onInvite = async (data: InviteInput) => {
    setIsLoading(true);
    setMessage('');

    // 招待コードの生成と保存
    const code = generateInviteCode();
    await supabase.from('invite_codes').insert({
      email: data.email,
      household_id: member?.household_id,
      code: code,
      expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24時間後に期限切れ
    });

    try {
      // 招待メールの送信
      // ローカル環境でのテスト http://localhost:5173/signin?invite_code={code}
      const { data: inviteData, error: inviteError } = await supabase.functions.invoke('send-invite', {
        body: JSON.stringify({
          to: data.email,
          subject: `【わけぽん】${user?.name}さんがあなたを招待しました`,
          html: `<p>こんにちは！共有家計簿アプリのわけわけです。</p>
          <p>あなたを${user?.name}さんがグループに招待しています。以下のリンクから参加してください。</p>
          <p><a href="${appOrigin}/signin?invite_code=${code}">招待リンク</a></p>`
        }),
      });

      if (inviteError) {
        setMessage(inviteError.message);
      } else if (inviteData) {
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
    <div className="user-invite">
      <Card>
        <CardHeader>ユーザー招待</CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit(onInvite)}>
            <Input
              label="メールアドレス:"
              error={errors.email?.message}
              {...register("email", validationRules.email)}
            />
            {/* TODO: このあたりは通知toastに移行させる */}
            {message && <p>{message}</p>}
            <Button size="bg" type="submit">
              {isLoading ? "招待中..." : "招待する"}
            </Button>
          </form>
        </CardBody>
        <CardFooter>
          <img src={heart} className="heart" />
          <img src={opon} className="opon4" />
          <p style={{ color: 'black', marginTop: '5px', fontWeight: 'bold', fontSize: '10px' }}>クリックすると招待メールが送信されます。</p>
          <p style={{ color: 'black', marginTop: '5px', fontWeight: 'bold', fontSize: '10px' }}>招待できない場合</p>
        </CardFooter>
      </Card>
    </div>
  );
}