// src/pages/Profile.tsx
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

export default function Profile() {
    const { email } = useAuth();
    const [changedEmail, setChangedEmail] = useState<string>('');
    const [message, setMessage] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchUser = async () => {
            setIsLoading(true);
            setMessage('');

            try {
                const { data, error } = await supabase.auth.getUser();

                if (error) {
                    setMessage('ユーザー情報の取得に失敗しました: ' + error.message);
                } else {
                    const user = data.user;
                    setChangedEmail(user?.email || '');
                }
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUser();
    }, []);

    const handleUpdateProfile = async () => {
        setIsLoading(true);
        setMessage('');

        try {
            // passwordはオプションなので、空文字の場合は更新しない
            if (!changedEmail) {
                setMessage('メールアドレスを入力してください');
                setIsLoading(false);
                return;
            }
            if (changedEmail === email) {
                setMessage('メールアドレスに変更はありません');
                setIsLoading(false);
                return;
            }

            // ユーザー情報のTrimと更新
            setMessage('プロフィールを更新中...');
            setChangedEmail(changedEmail.trim());

            const { error } = await supabase.auth.updateUser({
                email: changedEmail,
            });

            if (error) {
                setMessage('プロフィールの更新に失敗しました: ' + error.message);
            } else {
                setMessage('現在のメールアドレスと新しいメールアドレスに確認メールを送信しました。');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <h1>プロフィール</h1>
            {isLoading ? (
                <p>読み込み中...</p>
            ) : (
                <form onSubmit={(e) => e.preventDefault()}>
                    <div>
                        現在のメールアドレス: {email || '未設定'}
                    </div>
                    <div>
                        <label>メールアドレス:</label>
                        <input
                            type="email"
                            placeholder="メールアドレス"
                            value={changedEmail}
                            onChange={(e) => setChangedEmail(e.target.value)}
                            required
                        />
                    </div>
                    <br />
                    <input type="button" value="メールアドレス変更" onClick={handleUpdateProfile} /><br />
                    {message && <p>{message}</p>}
                </form>
            )}
        </div>
    )
}