import type { ButtonHTMLAttributes } from "react";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  src: string;       // 画像のパス
  alt: string;       // アクセシビリティ用テキスト
  size?: number;     // アイコンサイズ
}

export default function IconButton({ src, alt, size = 18, ...props }: IconButtonProps) {
  return (
    <button
      {...props}
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
