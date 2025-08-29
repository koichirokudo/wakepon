// src/pages/SignIn.tsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { SigninInput } from '../types';
import { validationRules } from '../utils/validation';

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
    <div>
      <h1>ログイン</h1>
      <form onSubmit={handleSubmit(onSignin)}>
        <input
          {...register("email", validationRules.email)}
          placeholder="メールアドレス"
        /><br />
        <button type="submit">ログインする</button>
        {isLoading && <p>ログイン中...</p>}
        {errors.email && <p style={{ color: 'red' }}>{errors.email.message}</p>}
      </form>
    </div>
  );
}