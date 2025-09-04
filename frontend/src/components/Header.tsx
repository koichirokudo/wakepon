import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Button from "./ui/Button";

export default function Header() {
  const { user, signout } = useAuth();
  const navigate = useNavigate()

  const handleSignOut = () => {
    signout();
    navigate("/signin");
  }

  return (
    <header>
      {user?.id && (
        <>
          <p>ヘッダー： ログイン中 {user?.name}</p>
          <Button onClick={handleSignOut}>ログアウト</Button>
        </>
      )}
    </header>
  );

}