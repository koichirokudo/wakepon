// src/pages/VerifyOtp.tsx
import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useSearchParams } from 'react-router-dom';
import type { VerifyOtpInput } from '../types';
import Card from '../components/ui/Card';
import { CardBody, CardFooter, CardHeader } from '../components/ui/Card';
import { useForm } from 'react-hook-form';
import Button from '../components/ui/Button';
import opon from '../assets/opon3.png';
import Input from '../components/ui/Input';
import { validationRules } from '../utils/validation';

export default function VerifyOtp() {
  const location = useLocation();
  const email = location.state?.email || '';
  const navigate = useNavigate();
  const [message, setMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchParams] = useSearchParams();
  const inviteCode = searchParams.get('invite_code');
  const { register, handleSubmit, formState: { errors } } = useForm<VerifyOtpInput>({
    defaultValues: { token: "" }
  });

  const handleVerifyOtp = async (data: VerifyOtpInput) => {
    setIsLoading(true);
    setMessage('');

    try {
      const { data: authData, error: authError } = await supabase.auth.verifyOtp({
        email: email,
        token: data.token,
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
    <div className="verify-otp">
      <Card>
        <CardHeader>認証コード入力</CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit(handleVerifyOtp)}>
            <Input
              label="認証コード"
              error={errors.token?.message}
              {...register("token", validationRules.token)}
            />
            {message && <p>{message}</p>}
            <Button size="bg" type="submit">
              {isLoading ? "認証中" : "認証する"}
            </Button>
          </form>
        </CardBody>
        <CardFooter>
          <img src={opon} className="opon3" />
          <p style={{ color: 'black', marginTop: '5px', fontWeight: 'bold', fontSize: '10px' }}>認証メールを送信しました</p>
          <p style={{ color: 'black', marginTop: '5px', fontWeight: 'bold', fontSize: '10px' }}>メール内の認証コードを入力してください</p>
        </CardFooter>
      </Card>
    </div >
  );
}