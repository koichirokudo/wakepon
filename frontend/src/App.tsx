// src/App.tsx
import { supabase } from './lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

function App() {
  const navigate = useNavigate();
  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('ログアウトに失敗しました:', error.message);
    } else {
      navigate('/signin', { state: { message: 'ログアウトしました。' } });
    }
  };
  return (
    <div>
      <h1>Hello WakeWake</h1>
      <p>これはわけわけのスタートです</p>
      <ul>
        <li>
          <a href="/signin">ログイン</a>
        </li>
        <li>
          <a href="/expenses">支出一覧</a>
        </li>
        <li>
          <a href="/categories">カテゴリ一覧</a>
        </li>
        <li>
          <a href="/invite">ユーザー招待</a>
        </li>
        <li>
          <a href="/profile">プロフィール</a>
        </li>
        <li>
          <a href="/rlstest">RLSポリシーテスト</a>
        </li>
      </ul>

      {/* ログイン時のみ表示したい */}
      <button onClick={handleSignOut}>ログアウト</button>
    </div>
  );
}

export default App;
