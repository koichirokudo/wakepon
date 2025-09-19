import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Drawer from '../Drawer';

// React Router DOMのモック
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// AuthContextのモック
const mockSignout = vi.fn();
vi.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => ({
    signout: mockSignout,
  }),
}));

// 画像ファイルのモック
vi.mock('../../../assets/humberger.png', () => ({ default: 'hamburger-icon.png' }));
vi.mock('../../../assets/home.png', () => ({ default: 'home-icon.png' }));
vi.mock('../../../assets/category.png', () => ({ default: 'category-icon.png' }));
vi.mock('../../../assets/user_invite.png', () => ({ default: 'user-invite-icon.png' }));
vi.mock('../../../assets/profile.png', () => ({ default: 'profile-icon.png' }));
vi.mock('../../../assets/logout.png', () => ({ default: 'logout-icon.png' }));
vi.mock('../../../assets/privacy-policy.png', () => ({ default: 'privacy-policy-icon.png' }));

// グローバルオブジェクトのモック
Object.defineProperty(window, 'location', {
  value: {
    reload: vi.fn(),
  },
  writable: true,
});

const MockedDrawer = ({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (open: boolean) => void }) => (
  <BrowserRouter>
    <Drawer isOpen={isOpen} setIsOpen={setIsOpen} />
  </BrowserRouter>
);

describe('Drawer', () => {
  const mockSetIsOpen = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // document.body.style をリセット
    document.body.style.overflow = 'auto';
    // DOM要素をクリア
    document.body.innerHTML = '';
  });

  afterEach(() => {
    document.body.style.overflow = 'auto';
  });

  it('ハンバーガーメニューがレンダリングされる', () => {
    render(<MockedDrawer isOpen={false} setIsOpen={mockSetIsOpen} />);

    const hamburgerButton = screen.getByRole('button', { name: 'メニュー' });
    expect(hamburgerButton).toHaveClass('hamburger');
    expect(screen.getByAltText('メニュー')).toBeInTheDocument();
  });

  it('ハンバーガーメニューをクリックするとDrawerが開く', async () => {
    const user = userEvent.setup();
    render(<MockedDrawer isOpen={false} setIsOpen={mockSetIsOpen} />);

    const hamburgerButton = screen.getByRole('button', { name: 'メニュー' });
    await user.click(hamburgerButton);

    expect(mockSetIsOpen).toHaveBeenCalledWith(true);
  });

  it('Drawerが閉じている状態でレンダリングされる', () => {
    render(<MockedDrawer isOpen={false} setIsOpen={mockSetIsOpen} />);

    const drawer = screen.getByText('Logo').closest('.drawer');
    expect(drawer).not.toHaveClass('open');
    expect(screen.queryByText('オーバーレイ')).not.toBeInTheDocument();
  });

  it('Drawerが開いている状態でレンダリングされる', () => {
    render(<MockedDrawer isOpen={true} setIsOpen={mockSetIsOpen} />);

    const drawer = screen.getByText('Logo').closest('.drawer');
    expect(drawer).toHaveClass('open');
    expect(document.querySelector('.overlay.show')).toBeInTheDocument();
  });

  it('メニューアイテムが正しく表示される', () => {
    render(<MockedDrawer isOpen={true} setIsOpen={mockSetIsOpen} />);

    expect(screen.getByText('ホーム')).toBeInTheDocument();
    expect(screen.getByText('カテゴリ一覧')).toBeInTheDocument();
    expect(screen.getByText('ユーザー招待')).toBeInTheDocument();
    expect(screen.getByText('プロフィール')).toBeInTheDocument();
    expect(screen.getByText('プライバシーポリシー')).toBeInTheDocument();
    expect(screen.getByText('ログアウト')).toBeInTheDocument();
  });

  it('メニューアイテムのリンクが正しく設定される', () => {
    render(<MockedDrawer isOpen={true} setIsOpen={mockSetIsOpen} />);

    expect(screen.getByText('ホーム').closest('a')).toHaveAttribute('href', '/');
    expect(screen.getByText('カテゴリ一覧').closest('a')).toHaveAttribute('href', '/categories');
    expect(screen.getByText('ユーザー招待').closest('a')).toHaveAttribute('href', '/invite');
    expect(screen.getByText('プロフィール').closest('a')).toHaveAttribute('href', '/profile');
    expect(screen.getByText('プライバシーポリシー').closest('a')).toHaveAttribute('href', '/privacy-policy');
  });

  it('メニューリンクをクリックするとDrawerが閉じる', async () => {
    const user = userEvent.setup();
    render(<MockedDrawer isOpen={true} setIsOpen={mockSetIsOpen} />);

    const homeLink = screen.getByText('ホーム');
    await user.click(homeLink);

    expect(mockSetIsOpen).toHaveBeenCalledWith(false);
  });

  it('オーバーレイをクリックするとDrawerが閉じる', async () => {
    const user = userEvent.setup();
    render(<MockedDrawer isOpen={true} setIsOpen={mockSetIsOpen} />);

    const overlay = document.querySelector('.overlay.show');
    expect(overlay).toBeInTheDocument();

    if (overlay) {
      await user.click(overlay);
      expect(mockSetIsOpen).toHaveBeenCalledWith(false);
    }
  });

  it('Drawerが開いているとき、スクロールが無効化される', () => {
    render(<MockedDrawer isOpen={true} setIsOpen={mockSetIsOpen} />);

    expect(document.body.style.overflow).toBe('hidden');
  });

  it('Drawerが閉じているとき、スクロールが有効化される', () => {
    const { rerender } = render(<MockedDrawer isOpen={true} setIsOpen={mockSetIsOpen} />);

    // 最初は開いている状態でスクロールが無効
    expect(document.body.style.overflow).toBe('hidden');

    // 閉じた状態に変更
    rerender(<MockedDrawer isOpen={false} setIsOpen={mockSetIsOpen} />);

    expect(document.body.style.overflow).toBe('auto');
  });

  it('ログアウトボタンをクリックするとログアウト処理が実行される', async () => {
    const user = userEvent.setup();

    // キャッシュAPIのモック
    const mockDelete = vi.fn().mockResolvedValue(true);
    const mockKeys = vi.fn().mockResolvedValue(['cache1', 'cache2']);
    Object.defineProperty(window, 'caches', {
      value: {
        keys: mockKeys,
        delete: mockDelete,
      },
      writable: true,
    });

    // localStorageとsessionStorageのモック
    const mockClear = vi.fn();
    Object.defineProperty(window, 'localStorage', {
      value: { clear: mockClear },
      writable: true,
    });
    Object.defineProperty(window, 'sessionStorage', {
      value: { clear: mockClear },
      writable: true,
    });

    // window.history のモック
    const mockReplaceState = vi.fn();
    Object.defineProperty(window, 'history', {
      value: { replaceState: mockReplaceState },
      writable: true,
    });

    render(<MockedDrawer isOpen={true} setIsOpen={mockSetIsOpen} />);

    const logoutButton = screen.getByRole('button', { name: /ログアウト/ });
    expect(logoutButton).toBeInTheDocument();

    await user.click(logoutButton);

    await waitFor(() => {
      expect(mockSignout).toHaveBeenCalled();
    });

    expect(mockClear).toHaveBeenCalledTimes(2); // localStorage と sessionStorage
    expect(mockKeys).toHaveBeenCalled();
    expect(mockDelete).toHaveBeenCalledWith('cache1');
    expect(mockDelete).toHaveBeenCalledWith('cache2');
    expect(mockReplaceState).toHaveBeenCalledWith(null, '', '/signin');
    expect(mockNavigate).toHaveBeenCalledWith('/signin', { replace: true });
  });

  it('メニューアイコンが正しく表示される', () => {
    render(<MockedDrawer isOpen={true} setIsOpen={mockSetIsOpen} />);

    expect(screen.getByAltText('ホーム')).toHaveAttribute('src', 'home-icon.png');
    expect(screen.getByAltText('カテゴリ一覧')).toHaveAttribute('src', 'category-icon.png');
    expect(screen.getByAltText('ユーザー招待')).toHaveAttribute('src', 'user-invite-icon.png');
    expect(screen.getByAltText('プロフィール')).toHaveAttribute('src', 'profile-icon.png');
    expect(screen.getByAltText('プライバシーポリシー')).toHaveAttribute('src', 'privacy-policy-icon.png');
    expect(screen.getByAltText('ログアウト')).toHaveAttribute('src', 'logout-icon.png');
  });
});