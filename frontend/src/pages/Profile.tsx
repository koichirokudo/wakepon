// src/pages/Profile.tsx
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import Card, { CardBody, CardFooter, CardHeader } from '../components/ui/Card';
import Input from '../components/ui/Input';
import { useForm } from 'react-hook-form';
import type { ProfileInput } from '../types';
import { validationRules } from '../utils/validation';
import IconButton from '../components/ui/IconButton';
import edit from '../assets/edit.png';
import cancel from '../assets/cancel.png';
import save from '../assets/save.png';

// メッセージの型定義
type MessageType = 'success' | 'error' | 'info';

interface Message {
  type: MessageType;
  content: string;
}
export default function Profile() {
  const { user, session, setUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

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
                    style={{ border: 'none' }}
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
                    style={{ border: 'none' }}
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