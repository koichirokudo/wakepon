import type React from "react";
import { forwardRef } from "react";

// React.InputHTMLAttributes: React が提供している汎用的な型
// HTMLInputElement: ブラウザの組み込み型
// React.InputHTMLAttributes<HTMLInputElement>
// で自作コンポーネントでも input 本来の属性と型安全なイベントがそのまま使える
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

// forwardRef: 親から渡された ref を受け取れるようにする仕組み
// 受け取った ref を内部の DOM や他のコンポーネントに転送できる。
const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, ...props }, ref) => (
    <div>
      {label && <label className="label-base">{label}</label>}
      <input ref={ref} className="input-base" {...props} />
      {error && <p className="input-error">{error}</p>}
    </div>
  )
);

// React デバッグ用の名前付けデフォルトでは、ForwardRef で表示されるらしい
Input.displayName = "Input";
export default Input;