import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "./ui.css";
import HambergerIcon from "../../assets/humberger.png"
import HomeIcon from "../../assets/home.png";
import CategoriesIcon from "../../assets/category.png";
import UserInviteIcon from "../../assets/user_invite.png";
import ProfileIcon from "../../assets/profile.png";
import LogoutIcon from "../../assets/logout.png";
import PrivacyPolicyIcon from "../../assets/privacy-policy.png";
import { useEffect } from "react";

export default function Drawer({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: (open: boolean) => void }) {
  const { signout } = useAuth();
  const toggleDrawer = () => setIsOpen(!isOpen);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      // ドロワーが開いているときはスクロールを無効化
      document.body.style.overflow = 'hidden';
      // ドロワーが開いているときはハンバーガーーメニューを非表示
      const hamburger = document.querySelector('.hamburger') as HTMLElement;
      if (hamburger) {
        hamburger.style.display = 'none';
      }
    } else {
      // ドロワーが閉じているときはスクロールを有効化
      document.body.style.overflow = 'auto';
      // ドロワーが閉じているときはハンバーガーメニューを表示
      const hamburger = document.querySelector('.hamburger') as HTMLElement;
      if (hamburger) {
        hamburger.style.display = 'block';
      }
    }
  }, [isOpen]);

  // ログアウト処理（ブラウザバック対策付き）
  const handleLogout = async () => {
    try {
      // 認証情報をクリア
      await signout();
      
      // ローカルストレージとセッションストレージをクリア
      localStorage.clear();
      sessionStorage.clear();
      
      // キャッシュをクリア
      if ('caches' in window) {
        try {
          const cacheNames = await caches.keys();
          await Promise.all(cacheNames.map(name => caches.delete(name)));
        } catch (error) {
          console.warn('Cache clearing failed:', error);
        }
      }
      
      // 履歴を操作してバックボタンを無効化
      // 現在のエントリを置き換える
      window.history.replaceState(null, '', '/signin');
      
      // サインインページに遷移（replace: trueで履歴を置き換え）
      navigate("/signin", { replace: true });
      
      // 念のためページをリロード（キャッシュされたデータを完全にクリア）
      setTimeout(() => {
        window.location.reload();
      }, 100);
      
    } catch (error) {
      console.error('Logout failed:', error);
      // エラーが発生してもサインインページに遷移
      navigate("/signin", { replace: true });
    }
  };

  const menuItems = [
    { label: "ホーム", to: "/", icon: HomeIcon },
    { label: "カテゴリ一覧", to: "/categories", icon: CategoriesIcon },
    { label: "ユーザー招待", to: "/invite", icon: UserInviteIcon },
    { label: "プロフィール", to: "/profile", icon: ProfileIcon },
    { label: "プライバシーポリシー", to: "/privacy-policy", icon: PrivacyPolicyIcon },
    { label: "ログアウト", icon: LogoutIcon },
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
            <li key={item.label}>
              {item.to ? (
                <Link to={item.to} className="menu-link" onClick={toggleDrawer}>
                  <img src={item.icon} alt={item.label} className="menu-icon" />
                  <span>{item.label}</span>
                </Link>
              ) : (
                <button
                  className="menu-button"
                  onClick={async () => {
                    if (item.label === "ログアウト") {
                      await handleLogout();
                    }
                    toggleDrawer();
                  }}
                >
                  <img src={item.icon} alt={item.label} className="menu-icon" />
                  <span>{item.label}</span>
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* オーバーレイ */}
      {isOpen && <div className="overlay show" onClick={toggleDrawer}></div>}
    </>
  );
}
