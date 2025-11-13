// src/pages/Profile.tsx
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { useErrorHandler } from '../utils/errorHandler';
import Card, { CardBody, CardHeader } from '../components/ui/Card';
import ProfileImageUpload from '../components/ProfileImageUpload';
import ProfileEditableField from '../components/ProfileEditableField';
import { validationRules } from '../utils/validation';

export default function Profile() {
  const { user, session, setUser } = useAuth();
  const { handleError, showSuccess } = useErrorHandler();

  if (!user || !session) {
    return <div>ログインしてください</div>;
  }

  // 名前の保存処理
  const handleSaveName = async (newName: string) => {
    const { error } = await supabase
      .from('users')
      .update({ name: newName })
      .eq('id', user.id);

    if (error) {
      handleError(error, 'ユーザー名の更新に失敗しました');
      throw error;
    }

    // ローカルの状態を更新
    setUser((prev) => (prev ? { ...prev, name: newName } : null));
    showSuccess('ユーザー名を更新しました');
  };

  // メールアドレスの保存処理
  const handleSaveEmail = async (newEmail: string) => {
    const { error } = await supabase.auth.updateUser({ email: newEmail });

    if (error) {
      handleError(error, 'メールアドレスの更新に失敗しました');
      throw error;
    }

    showSuccess('メールアドレスを更新しました。確認メールをご確認ください。');
  };

  // 画像アップロード成功時の処理
  const handleImageUploadSuccess = (newAvatarUrl: string) => {
    setUser((prev) => (prev ? { ...prev, avatar_url: newAvatarUrl } : null));
  };

  return (
    <div className="profile">
      <div className="container">
        <Card>
          <CardHeader>プロフィール</CardHeader>
          <CardBody>
            {/* プロフィール画像 */}
            <div style={{ marginBottom: '2rem' }}>
              <ProfileImageUpload
                userId={user.id}
                currentAvatarUrl={user.avatar_url}
                onUploadSuccess={handleImageUploadSuccess}
              />
            </div>

            {/* ユーザー名 */}
            <div style={{ marginBottom: '1.5rem' }}>
              <ProfileEditableField
                label="ユーザー名"
                fieldName="name"
                currentValue={user.name || ''}
                validation={validationRules.name}
                onSave={handleSaveName}
                type="text"
              />
            </div>

            {/* メールアドレス */}
            <div style={{ marginBottom: '1.5rem' }}>
              <ProfileEditableField
                label="メールアドレス"
                fieldName="email"
                currentValue={session.user.email || ''}
                validation={validationRules.email}
                onSave={handleSaveEmail}
                type="email"
              />
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
