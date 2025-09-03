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
        <>
          ヘッダー：
          ログイン中 {user?.name}
        </>
      ) : (
        <nav>
          <Link to="/signin">ログイン</Link>
        </nav>
      )}
    </header>
  );

}