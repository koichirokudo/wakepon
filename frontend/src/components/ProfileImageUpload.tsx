// src/components/ProfileImageUpload.tsx
import { useRef, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useErrorHandler } from '../utils/errorHandler';
import IconButton from './ui/IconButton';
import camera from '../assets/camera.png';
import defaultAvatar from '../assets/default-avatar.png';

type ProfileImageUploadProps = {
  userId: string;
  currentAvatarFilename: string | null;
  onUploadSuccess: (newAvatarFilename: string) => void;
};

export default function ProfileImageUpload({
  userId,
  currentAvatarFilename,
  onUploadSuccess,
}: ProfileImageUploadProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { handleError, showSuccess } = useErrorHandler();

  // avatar_filenameから署名付きURLを生成
  useEffect(() => {
    const loadAvatarUrl = async () => {
      if (!currentAvatarFilename) {
        setUploadedImageUrl('');
        return;
      }

      try {
        const { data, error } = await supabase.storage
          .from('avatars')
          .createSignedUrl(currentAvatarFilename, 3600);

        if (error) {
          console.error('署名付きURL生成エラー:', error);
          setUploadedImageUrl('');
          return;
        }

        setUploadedImageUrl(data.signedUrl);
      } catch (err) {
        console.error('画像URL読み込みエラー:', err);
        setUploadedImageUrl('');
      }
    };

    loadAvatarUrl();
  }, [currentAvatarFilename]);

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

      // 署名付きURLを取得（世帯内共有のため、1時間有効）
      const { data: urlData, error: urlError } = await supabase.storage
        .from('avatars')
        .createSignedUrl(uploadData.path, 3600);

      if (urlError) {
        handleError(urlError, '画像URL生成失敗');
        return;
      }

      const signedUrl = urlData.signedUrl;

      // ユーザー情報を更新（avatar_filenameのみ保存、URLは毎回生成）
      const { error: updateError } = await supabase
        .from('users')
        .update({
          avatar_filename: fileName,
        })
        .eq('id', userId);

      if (updateError) {
        handleError(updateError, 'ユーザー情報更新失敗');
        return;
      }

      setUploadedImageUrl(signedUrl);
      onUploadSuccess(fileName);
      showSuccess('プロフィール画像を更新しました');
    } catch (error) {
      handleError(error, '画像アップロードエラー');
    } finally {
      setIsLoading(false);
    }
  };

  // キャッシュバスティング用のURLを生成
  const getImageUrlWithCacheBuster = (url: string) => {
    if (!url) return defaultAvatar;
    const cacheBuster = `?t=${Date.now()}`;
    return url + cacheBuster;
  };

  return (
    <div className="profile-image-upload">
      <div className="profile-avatar-container">
        <img
          src={uploadedImageUrl ? getImageUrlWithCacheBuster(uploadedImageUrl) : defaultAvatar}
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
