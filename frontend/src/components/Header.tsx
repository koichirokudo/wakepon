import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Header() {
  const { user, signout } = useAuth();
  const navigate = useNavigate()

  const handleSignOut = () => {
    signout();
    navigate("/signin");
  }

  return (
    <header style={{ background: "#eee", padding: "1rem" }}>
      {user?.id ? (
        <div>
          <nav>
            <Link to="/">ホーム</Link>
            <Link to="/categories">カテゴリ一覧</Link>
            <Link to="/invite">ユーザー招待</Link>
            <Link to="/profile">プロフィール</Link>
          </nav>
          <p>ログイン中: {user?.name} </p>
          <button onClick={handleSignOut}>ログアウト</button>
        </div>
      ) : (
        <nav>
          <Link to="/signin">ログイン</Link>
        </nav>
      )}
    </header>
  );

}