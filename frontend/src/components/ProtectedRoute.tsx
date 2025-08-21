// src/components/ProtectedRoute.tsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import type { ReactNode } from "react";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { userName, isLoading } = useAuth();

  // 読み込み中は何も表示せず待つ（またはローディング表示）
  if (isLoading) {
    return <div>Loading...</div>
  }

  // 未ログインなら /signin に飛ばす
  if (!userName) {
    return <Navigate to="/signin" replace />;
  }

  // ログイン済みならそのまま表示
  return children;
}
