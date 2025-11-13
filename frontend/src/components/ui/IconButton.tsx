import type { ButtonHTMLAttributes } from "react";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  src: string;       // 画像のパス
  alt: string;       // アクセシビリティ用テキスト
  size?: number;     // アイコンサイズ
  className?: string; // 追加のCSSクラス
}

export default function IconButton({ src, alt, size = 18, className = '', ...props }: IconButtonProps) {
  return (
    <button
      {...props}
      className={`icon-button ${className}`.trim()}
      aria-label={alt}
    >
      <img
        src={src}
        alt={alt}
        width={size}
        height={size}
      />
    </button>
  );
}
