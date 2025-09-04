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
    <header>
      {user?.id ? (
        <p>
          ヘッダー：
          ログイン中 {user?.name}
        </p>
      ) : (
        <nav>
          <Link to="/signin">ログイン</Link>
        </nav>
      )}
    </header>
  );

}