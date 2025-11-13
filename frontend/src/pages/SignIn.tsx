// src/pages/SignIn.tsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { SigninInput } from '../types';
import { validationRules } from '../utils/validation';
import Card, { CardBody, CardFooter, CardHeader } from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import opon from '../assets/opon6.png';

export default function SignIn() {
  const { signin } = useAuth();
  const { register, handleSubmit, formState: { errors } } = useForm<SigninInput>({
    defaultValues: { email: "" }
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inviteCode = searchParams.get('invite_code');

  const onSignin = async (data: SigninInput) => {
    setIsLoading(true);
    setErrorMessage("");
    const email = data.email;

    try {
      const { error } = await signin(email);

      if (error) {
        setErrorMessage(`エラー: ${error.message}`);
        console.error('サインインエラー:', error);
      } else {
        if (inviteCode) {
          navigate(`/verify-otp?invite_code=${inviteCode}`, { state: { email } });
        } else {
          navigate(`/verify-otp`, { state: { email } });
        }
      }

    } catch (error) {
      console.error('予期しないエラー:', error);
      setErrorMessage('予期しないエラーが発生しました。もう一度お試しください。');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signin">
      <Card>
        <CardHeader>ログイン</CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit(onSignin)}>
            {errorMessage && (
              <div style={{
                backgroundColor: '#fee',
                border: '1px solid #fcc',
                padding: '10px',
                borderRadius: '4px',
                marginBottom: '15px',
                color: '#c00'
              }}>
                {errorMessage}
              </div>
            )}
            <Input
              label="メールアドレス"
              error={errors.email?.message}
              {...register("email", validationRules.email)}
            />
            <Button size="bg" type="submit">
              {isLoading ? "ログイン中..." : "ログインする"}
            </Button>
          </form>
        </CardBody>
        <CardFooter>
          <img src={opon} className="opon6" />
          <p style={{ color: 'black', marginTop: '5px', fontWeight: 'bold', fontSize: '12px' }}>クリックすると招待メールが送信されます。</p>
          <p style={{ color: 'black', marginTop: '5px', fontWeight: 'bold', fontSize: '12px' }}>ログインできない場合</p>
        </CardFooter>
      </Card>
    </div >
  );
}