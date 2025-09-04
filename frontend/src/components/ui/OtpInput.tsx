import React, { useState, useRef } from 'react';

// OTPInputコンポーネント
interface OTPInputProps {
  length: number;
  onComplete: (otp: string) => void;
  disabled?: boolean;
}

export const OTPInput: React.FC<OTPInputProps> = ({ length, onComplete, disabled }) => {
  const [otp, setOtp] = useState<string[]>(new Array(length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>(new Array(length).fill(null));

  const handleChange = (index: number, value: string) => {
    // 数字のみを許可
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];

    // 複数文字が貼り付けられた場合の処理
    if (value.length > 1) {
      const pastedValue = value.slice(0, length - index);
      for (let i = 0; i < pastedValue.length; i++) {
        if (index + i < length) {
          newOtp[index + i] = pastedValue[i];
        }
      }
      setOtp(newOtp);

      // 最後の入力欄または貼り付けた最後の文字の次の欄にフォーカス
      const nextIndex = Math.min(index + pastedValue.length, length - 1);
      inputRefs.current[nextIndex]?.focus();
    } else {
      newOtp[index] = value;
      setOtp(newOtp);

      // 次の入力欄にフォーカス
      if (value && index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    }

    // すべて入力されたらコールバックを実行
    // every: 渡されたコールバック関数を使って各要素をテストし論理値を返す
    // すべての要素が空文字でないかをテストしている
    // join: 配列の全要素を順に連結した新しい文字列を返す
    // ''なので配列を連結して文字列化["1", "2", "3"] => "123"
    if (newOtp.every(digit => digit !== '') && newOtp.join('').length === length) {
      onComplete(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace') {
      const newOtp = [...otp];

      if (otp[index] === '' && index > 0) {
        // 現在の欄が空で、前の欄に文字がある場合は前の欄を削除してフォーカス
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      } else {
        // 現在の欄の文字を削除
        newOtp[index] = '';
        setOtp(newOtp);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedValue = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    const newOtp = new Array(length).fill('');

    for (let i = 0; i < pastedValue.length; i++) {
      newOtp[i] = pastedValue[i];
    }

    setOtp(newOtp);

    // 最後に入力された欄または最後の欄にフォーカス
    const focusIndex = Math.min(pastedValue.length, length - 1);
    inputRefs.current[focusIndex]?.focus();

    // すべて入力されたらコールバックを実行
    if (pastedValue.length === length) {
      onComplete(pastedValue);
    }
  };

  return (
    <div className="otp-input-container">
      {otp.map((digit, index) => (
        <input
          key={index}
          ref={(ref) => {
            inputRefs.current[index] = ref;
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          disabled={disabled}
          className={`otp-input ${digit ? 'filled' : ''} ${disabled ? 'disabled' : ''}`}
        />
      ))}
    </div>
  );
};