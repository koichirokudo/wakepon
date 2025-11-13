// src/components/ProfileImageUpload.tsx
import { useRef, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useErrorHandler } from '../utils/errorHandler';
import IconButton from './ui/IconButton';
import camera from '../assets/camera.png';
import defaultAvatar from '../assets/default-avatar.png';

type ProfileImageUploadProps = {
  userId: string;
  currentAvatarUrl: string | null;
  onUploadSuccess: (newAvatarUrl: string) => void;
};

export default function ProfileImageUpload({
  userId,
  currentAvatarUrl,
  onUploadSuccess,
}: ProfileImageUploadProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState(currentAvatarUrl || '');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { handleError, showSuccess } = useErrorHandler();

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) {
      handleError(new Error('画像を選択してください'), '画像アップロード');
      return;
    }

    setIsLoading(true);

    try {
      const file = files[0];

      // ファイル名を一意にする
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      // Supabase Storageにアップロード
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file);

      if (uploadError) {
        handleError(uploadError, 'ファイルアップロード失敗');
        return;
      }

      // 公開URLを取得
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(uploadData.path);

      const publicUrl = urlData.publicUrl;

      // ユーザー情報を更新
      const { error: updateError } = await supabase
        .from('users')
        .update({
          avatar_filename: fileName,
          avatar_url: publicUrl,
        })
        .eq('id', userId);

      if (updateError) {
        handleError(updateError, 'ユーザー情報更新失敗');
        return;
      }

      setUploadedImageUrl(publicUrl);
      onUploadSuccess(publicUrl);
      showSuccess('プロフィール画像を更新しました');
    } catch (error) {
      handleError(error, '画像アップロードエラー');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="profile-image-upload">
      <div className="profile-avatar-container">
        <img
          src={uploadedImageUrl || defaultAvatar}
          alt="プロフィール画像"
          className="profile-avatar-image"
        />
        <div className="profile-camera-button">
          <IconButton
            src={camera}
            alt="画像変更"
            onClick={handleAvatarClick}
            disabled={isLoading}
            type="button"
            size={20}
            className="profile-upload-btn"
          />
        </div>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => handleUpload(e.target.files)}
      />
      {isLoading && <p className="profile-upload-status">アップロード中...</p>}
    </div>
  );
}
