// src/components/ProtectedRoute.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import type { ReactNode } from "react";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { session, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // ローディングが完了してからユーザーをチェック
    if (!isLoading && !session) {
      navigate('/signin');
    }
  }, [session, isLoading, navigate]);

  // ローディング中は読み込み表示
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // セッションがない場合は何も表示しない（useEffectでリダイレクトされる）
  if (!session) {
    return null;
  }

  // ログイン済みならそのまま表示
  return children;
}
