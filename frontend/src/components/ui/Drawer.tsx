import { Link } from "react-router-dom";
import "./ui.css";
import HambergerIcon from "../../assets/humberger.png"
import HomeIcon from "../../assets/home.png";
import CategoriesIcon from "../../assets/category.png";
import UserInviteIcon from "../../assets/user_invite.png";
import ProfileIcon from "../../assets/profile.png";
import LogoutIcon from "../../assets/logout.png";
import PrivacyPolicyIcon from "../../assets/privacy-policy.png";

export default function Drawer({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: (open: boolean) => void }) {
  const toggleDrawer = () => setIsOpen(!isOpen);

  const menuItems = [
    { label: "ホーム", to: "/", icon: HomeIcon },
    { label: "カテゴリ一覧", to: "/categories", icon: CategoriesIcon },
    { label: "ユーザー招待", to: "/invite", icon: UserInviteIcon },
    { label: "プロフィール", to: "/profile", icon: ProfileIcon },
    { label: "プライバシーポリシー", to: "/", icon: PrivacyPolicyIcon },
    { label: "ログアウト", to: "/", icon: LogoutIcon },
  ];

  return (
    <>
      {/* ハンバーガーメニュー */}
      <button
        className="hamburger"
        onClick={toggleDrawer}
      >
        <img src={HambergerIcon} alt="メニュー" style={{ width: 30, height: 30 }} />
      </button>

      {/* サイドメニュー本体 */}
      <div className={`drawer ${isOpen ? "open" : ""}`}>
        <div className="drawer-top">Logo</div>
        <ul>
          {menuItems.map(item => (
            <li key={item.to}>
              <Link to={item.to} className="menu-link" onClick={toggleDrawer}>
                <img src={item.icon} alt={item.label} className="menu-icon" />
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* オーバーレイ */}
      {isOpen && <div className="overlay show" onClick={toggleDrawer}></div>}
    </>
  );
}
