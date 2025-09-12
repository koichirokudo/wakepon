import { useAuth } from "../contexts/AuthContext";

export default function Header() {
  const { user } = useAuth();
  return (
    <header>
    </header>
  );

}