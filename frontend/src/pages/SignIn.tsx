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
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inviteCode = searchParams.get('invite_code');

  const onSignin = async (data: SigninInput) => {
    setIsLoading(true);
    const email = data.email;

    try {
      const { error } = await signin(email);

      if (!error) {
        if (inviteCode) {
          navigate(`/verify-otp?invite_code=${inviteCode}`, { state: { email } });
        } else {
          navigate(`/verify-otp`, { state: { email } });
        }
      }

    } catch (error) {
      console.error(error);
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