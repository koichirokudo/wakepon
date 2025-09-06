// src/pages/Profile.tsx
import { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import Card, { CardBody, CardFooter, CardHeader } from '../components/ui/Card';
import Input from '../components/ui/Input';
import { useForm, Controller } from 'react-hook-form';
import type { ProfileInput } from '../types';
import { validationRules } from '../utils/validation';
import IconButton from '../components/ui/IconButton';
import edit from '../assets/edit.png';
import cancel from '../assets/cancel.png';
import save from '../assets/save.png';
import camera from '../assets/camera.png';
import defaultAvatar from '../assets/default-avatar.png';

// メッセージの型定義
type MessageType = 'success' | 'error' | 'info';

type ImageUploadForm = {
  image: FileList;
  description?: string;
};

interface Message {
  type: MessageType;
  content: string;
}

export default function Profile() {
  const { user, session, setUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // 画像アップロードフォーム
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>(user?.avatar_url || '');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const {
    register: registerImage,
    handleSubmit: handleSubmitImage,
    control,
    reset: resetImage,
    formState: { errors: imageError }
  } = useForm<ImageUploadForm>();

  // アイコンボタンからファイル選択を開く
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  }

  const handleUpload = async (files: FileList) => {
    // 既存の onUploadImage の処理を呼ぶ
    await onUploadImage({ image: files });
  };

  // ユーザー名フォーム
  const [isNameEditing, setIsNameEditing] = useState(false);
  const [isNameSaving, setIsNameSaving] = useState<boolean>(false);
  const {
    register: registerName,
    handleSubmit: handleSubmitName,
    reset: resetName,
    formState: { errors: nameErrors },
    watch: watchName,
    setValue: setValueName
  } = useForm<ProfileInput>({
    defaultValues: { name: user?.name || '' }
  });

  // メールフォーム
  const [isEmailEditing, setIsEmailEditing] = useState(false);
  const [isEmailSaving, setIsEmailSaving] = useState<boolean>(false);
  const {
    register: registerEmail,
    handleSubmit: handleSubmitEmail,
    reset: resetEmail,
    formState: { errors: emailErrors },
    watch: watchEmail,
    setValue: setValueEmail
  } = useForm<ProfileInput>({
    defaultValues: { email: session?.user.email || '' }
  });

  const watchedName = watchName('name');
  const watchedEmail = watchEmail('email');

  useEffect(() => {
    if (watchedName !== user?.name) {
      setIsNameSaving(true);
    }
    if (watchedEmail !== session?.user.email) {
      setIsEmailSaving(true);
    }
  }, [watchedName, watchedEmail])

  const addMessage = (type: MessageType, content: string) => {
    setMessages(prev => [...prev, { type, content }]);
  };

  const clearMessages = () => {
    setMessages([]);
  };

  // ユーザー名の編集モードの切り替え
  const toggleNameEdit = () => {
    if (isNameEditing) {
      // 編集キャンセル時は元の値に戻す
      resetName({ name: user?.name || "" });
      clearMessages();
    } else {
      // 編集開始時は現在の値をセット
      setValueName('name', user?.name || '');
    }
    setIsNameEditing(!isNameEditing);
  };

  // メールアドレスの編集モードの切り替え
  const toggleEmailEdit = () => {
    if (isEmailEditing) {
      // 編集キャンセル時は元の値に戻す
      resetEmail({ email: session?.user.email || "" });
      clearMessages();
    } else {
      // 編集開始時は現在の値をセット
      setValueEmail('email', session?.user.email || '');
    }
    setIsEmailEditing(!isEmailEditing);
  };

  const onUploadImage = async (data: ImageUploadForm) => {
    if (!data.image || data.image.length === 0) {
      addMessage('error', '画像を選択してください');
      return;
    }

    if (!user) {
      addMessage('error', 'ログインが必要です');
      return;
    }

    setIsLoading(true);
    clearMessages();

    try {
      const file = data.image[0];

      // ファイル名を一意にする（ユーザーID + タイムスタンプ + 元のファイル名）
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      // Supabase Storageにアップロード
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars') // バケット名（事前にSupabaseで作成が必要）
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false // 同じファイル名の場合は上書きしない
        });

      if (uploadError) {
        throw uploadError;
      }

      // アップロードされた画像のパブリックURLを取得
      const { data: urlData } = supabase.storage
        .from('images')
        .getPublicUrl(uploadData.path);

      setUploadedImageUrl(urlData.publicUrl);
      addMessage('success', '画像をアップロードしました！');

      // DBに画像情報を保存
      await saveImageToDatabase(uploadData.path, fileName);

      resetImage(); // フォームをリセット
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  // DBに画像情報を保存
  const saveImageToDatabase = async (fileName: string, imagePath: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          avatar_name: fileName,
          avatar_url: imagePath,
        })
        .eq('id', user?.id);
      if (error) {
        console.error('DB保存エラー:', error);
      }
    } catch (error) {
      console.error('DB保存エラー:', error);
    }
  };

  const onUpdateName = async (data: ProfileInput) => {
    if (!data.name?.trim() || data.name === user?.name) {
      addMessage('info', 'ユーザー名に変更はありません');
      return;
    }

    setIsLoading(true);
    clearMessages();

    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .update({ name: data.name.trim() })
        .eq('id', user?.id)
        .select()
        .single();

      if (userError) {
        addMessage('error', `ユーザー名の更新に失敗しました: ${userError.message}`);
      } else {
        addMessage('success', 'ユーザー名の更新が完了しました');
        resetName({ name: data.name.trim() });
        setUser(userData);
        setIsNameEditing(false);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const onUpdateEmail = async (data: ProfileInput) => {
    if (!data.email?.trim() || data.email === session?.user.email) {
      addMessage('info', 'メールアドレスに変更はありません');
      return;
    }

    setIsLoading(true);
    clearMessages();

    try {
      const { error } = await supabase.auth.updateUser({ email: data.email.trim() });
      if (error) {
        addMessage('error', `メールアドレスの更新に失敗しました: ${error.message}`);
      } else {
        addMessage('success', 'メールアドレスの更新が完了しました。新しいメールアドレスと古いメールアドレスに認証メールが送信されます。');
        resetEmail({ email: data.email.trim() });
        setIsEmailEditing(false);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }


  return (
    <div className="profile">
      <Card>
        <CardHeader>プロフィール</CardHeader>
        <CardBody>
          {/* プロフィール画像フォーム */}
          <div className="profile-image">
            <img src={uploadedImageUrl || defaultAvatar} alt="Avatar" className="avatar" />
            <IconButton
              type="button"
              className='avatar-change-btn'
              alt="アバター変更"
              src={camera}
              onClick={handleAvatarClick}
            />
            <Controller
              name="image"
              control={control}
              render={({ field }) => (
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  ref={(el) => {
                    field.ref(el);
                    fileInputRef.current = el;
                  }}
                  onChange={(e) => {
                    if (e.target.files) handleUpload(e.target.files);
                  }}
                />
              )}
            />
          </div>
          {/* ユーザー名フォーム */}
          {!isNameEditing && !isLoading ? (
            // 表示モード
            <div className="profile-display">
              <div className="profile-field">
                <div className="field-value">
                  <Input
                    label="ユーザー名"
                    readOnly
                    {...registerName("name")}
                    className="icon-input"
                    style={{ border: 'none', fontWeight: 'bold' }}
                  />
                  <IconButton
                    type="button"
                    alt="編集"
                    src={edit}
                    onClick={toggleNameEdit}
                    className="edit-toggle-btn"
                  />
                </div>
              </div>
            </div>
          ) : (
            // 編集モード
            <form onSubmit={handleSubmitName(onUpdateName)}>
              <div className="input-wrapper">
                <Input
                  label="ユーザー名"
                  error={nameErrors.name?.message}
                  autoFocus
                  {...registerName("name", validationRules.username)}
                  className="icon-input"
                  style={{ fontWeight: 'bold' }}
                />
                {isNameSaving ? (
                  <IconButton
                    type="submit"
                    alt="保存"
                    src={save}
                    className="edit-toggle-btn"
                  />
                ) : (
                  <IconButton
                    type="button"
                    alt="キャンセル"
                    src={cancel}
                    onClick={toggleNameEdit}
                    className="edit-toggle-btn"
                  />
                )}
              </div>
            </form>
          )}
          {/* メールアドレスフォーム */}
          {!isEmailEditing && !isLoading ? (
            // 表示モード
            <div className="profile-display">
              <div className="profile-field">
                <div className="field-value">
                  <Input
                    label="メールアドレス"
                    readOnly
                    {...registerEmail("email")}
                    className="icon-input"
                    style={{ border: 'none', fontWeight: 'bold' }}
                  />
                  <IconButton
                    type="button"
                    alt="編集"
                    src={edit}
                    onClick={toggleEmailEdit}
                    className="edit-toggle-btn"
                  />
                </div>
              </div>
            </div>
          ) : (
            // 編集モード
            <form onSubmit={handleSubmitEmail(onUpdateEmail)}>
              <div className="input-wrapper">
                <Input
                  label="メールアドレス"
                  error={emailErrors.email?.message}
                  autoFocus
                  {...registerEmail("email", {
                    ...validationRules.email,
                    required: false,
                  })}
                  className="icon-input"
                  style={{ fontWeight: 'bold' }}
                />
                {isEmailSaving ? (
                  <IconButton
                    type="submit"
                    alt="保存"
                    src={save}
                    className="edit-toggle-btn"
                  />
                ) : (
                  <IconButton
                    type="button"
                    alt="キャンセル"
                    src={cancel}
                    onClick={toggleEmailEdit}
                    className="edit-toggle-btn"
                  />
                )}
              </div>
            </form>
          )}
        </CardBody>
        <CardFooter>
          {messages.length > 0 && (
            <div className="messages">
              {messages.map((message, index) => (
                <div key={index} className={`message message-${message.type}`}>
                  {message.content}
                </div>
              ))}
            </div>
          )}
          <p style={{ color: 'black', marginTop: '5px', fontWeight: 'bold', fontSize: '10px' }}>
            メールアドレスを変更すると新しいメールアドレスと古いメールアドレスに認証メールが送信されます。
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}