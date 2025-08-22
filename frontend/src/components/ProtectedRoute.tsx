// src/components/ProtectedRoute.tsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import type { ReactNode } from "react";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { session, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;
  if (!session) return <Navigate to="/signin" replace />;
  
  // ログイン済みならそのまま表示
  return children;
}
