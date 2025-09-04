// src/pages/VerifyOtp.tsx
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useSearchParams } from 'react-router-dom';
import Card from '../components/ui/Card';
import { CardBody, CardFooter, CardHeader } from '../components/ui/Card';
import Button from '../components/ui/Button';
import opon from '../assets/opon3.png';
import { OTPInput } from '../components/ui/OtpInput';

// メインのVerifyOtpコンポーネント
export default function VerifyOtp() {
  const location = useLocation();
  const email = location.state?.email || '';
  const navigate = useNavigate();
  const [message, setMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchParams] = useSearchParams();
  const inviteCode = searchParams.get('invite_code');

  const handleOtpComplete = async (otp: string) => {
    if (otp.length !== 6) return;

    setIsLoading(true);
    setMessage('');

    try {
      const { data: authData, error: authError } = await supabase.auth.verifyOtp({
        email: email,
        token: otp,
        type: 'email',
      });

      if (authError) {
        setMessage(`認証に失敗しました: ${authError.message}`);
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
        if (inviteCode) {
          const { error } = await supabase.rpc('use_invite_code', {
            p_user_id: authData.user.id,
            p_invite_code: inviteCode,
          });
          if (error) {
            setMessage(`ユーザー登録処理に失敗しました: ${error.message}`);
            return;
          }
        } else {
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
  };

  const handleResendCode = async () => {
    if (!email) return;

    setIsLoading(true);
    setMessage('');

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email,
      });

      if (error) {
        setMessage(`認証コードの再送信に失敗しました: ${error.message}`);
      } else {
        setMessage('認証コードを再送信しました。');
      }
    } catch (error) {
      setMessage('エラーが発生しました。');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="verify-otp">
      <Card>
        <CardHeader>認証コード入力</CardHeader>
        <CardBody>
          <div className="otp-content">
            <p className="otp-description">
              {email} に送信された<br />
              6桁の認証コードを入力してください
            </p>

            <OTPInput
              length={6}
              onComplete={handleOtpComplete}
              disabled={isLoading}
            />

            {message && (
              <div className={`message ${message.includes('失敗') || message.includes('エラー') ? 'error' : 'success'}`}>
                {message}
              </div>
            )}

            {isLoading && (
              <div className="loading">
                <div className="spinner" />
                認証中...
              </div>
            )}
          </div>
        </CardBody>
        <CardFooter>
          <img src={opon} className="opon3" alt="キャラクター" />

          <div className="resend-section">
            <p className="resend-text">認証コードが届かない場合</p>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleResendCode}
              disabled={isLoading}
            >
              認証コードを再送信
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}