// ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { ReactNode } from "react";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { userName } = useAuth();

  // 未ログインなら /login に飛ばす
  if (!userName) {
    return <Navigate to="/signin" replace />;
  }

  // ログイン済みならそのまま表示
  return children;
}
