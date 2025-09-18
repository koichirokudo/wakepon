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
      navigate('/signin', { replace: true });
    }
  }, [session, isLoading, navigate]);

  // ページ表示イベントの監視（ブラウザバック対策）
  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      // ページがキャッシュから表示された場合（ブラウザバック等）
      if (event.persisted || (window.performance?.navigation?.type === 2)) {
        // セッションが無効な場合は強制的にサインインページに遷移
        if (!session && !isLoading) {
          console.log('Cached page accessed without session, redirecting to signin');
          navigate('/signin', { replace: true });
        }
      }
    };

    // ページの可視性変更の監視
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // ページが再表示された時にセッションチェック
        if (!session && !isLoading) {
          navigate('/signin', { replace: true });
        }
      }
    };

    // popstate イベントの監視（ブラウザの戻る/進むボタン）
    const handlePopState = () => {
      if (!session && !isLoading) {
        navigate('/signin', { replace: true });
      }
    };

    window.addEventListener('pageshow', handlePageShow);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('pageshow', handlePageShow);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [session, isLoading, navigate]);

  // キャッシュ制御のためのメタタグを動的に追加
  useEffect(() => {
    if (!isLoading && session) {
      // 認証済みページにキャッシュ無効化のメタタグを追加
      const metaTags = [
        { name: 'cache-control', content: 'no-cache, no-store, must-revalidate' },
        { name: 'pragma', content: 'no-cache' },
        { name: 'expires', content: '0' }
      ];

      const addedMetas: HTMLMetaElement[] = [];

      metaTags.forEach(({ name, content }) => {
        let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
        if (!meta) {
          meta = document.createElement('meta');
          meta.name = name;
          meta.content = content;
          document.head.appendChild(meta);
          addedMetas.push(meta);
        } else {
          meta.content = content;
        }
      });

      // クリーンアップ関数で追加したメタタグを削除
      return () => {
        addedMetas.forEach(meta => {
          if (meta.parentNode) {
            meta.parentNode.removeChild(meta);
          }
        });
      };
    }
  }, [session, isLoading]);

  // ローディング中は読み込み表示
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // セッションがない場合は何も表示しない（useEffectでリダイレクトされる）
  if (!session) {
    return null;
  }

  // ログイン済みならそのまま表示
  return <>{children}</>;
}
