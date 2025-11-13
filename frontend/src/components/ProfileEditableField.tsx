// src/components/ProfileEditableField.tsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Input from './ui/Input';
import IconButton from './ui/IconButton';
import edit from '../assets/edit.png';
import cancel from '../assets/cancel.png';
import save from '../assets/save.png';

type ProfileEditableFieldProps = {
  label: string;
  fieldName: 'name' | 'email';
  currentValue: string;
  validation: any;
  onSave: (value: string) => Promise<void>;
  type?: 'text' | 'email';
};

export default function ProfileEditableField({
  label,
  fieldName,
  currentValue,
  validation,
  onSave,
  type = 'text',
}: ProfileEditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
  } = useForm<{ [key: string]: string }>({
    defaultValues: { [fieldName]: currentValue },
  });

  const toggleEdit = () => {
    if (isEditing) {
      // キャンセル時は元の値に戻す
      reset({ [fieldName]: currentValue });
    } else {
      // 編集開始時は現在の値をセット
      setValue(fieldName, currentValue);
    }
    setIsEditing(!isEditing);
  };

  const handleSave = async (data: { [key: string]: string }) => {
    setIsSaving(true);
    try {
      await onSave(data[fieldName]);
      setIsEditing(false);
    } catch (error) {
      // エラーは親コンポーネントで処理される
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleSave)} className="profile-editable-field">
      <div className="profile-field-container">
        <div className="profile-input-wrapper">
          <Input
            label={label}
            type={type}
            disabled={!isEditing}
            error={errors[fieldName]?.message}
            {...register(fieldName, validation)}
          />
        </div>
        <div className="profile-actions">
          {!isEditing ? (
            <IconButton
              src={edit}
              alt="編集"
              onClick={toggleEdit}
              type="button"
              size={20}
              className="profile-edit-btn"
            />
          ) : (
            <>
              <IconButton
                src={save}
                alt="保存"
                onClick={handleSubmit(handleSave)}
                disabled={isSaving}
                type="button"
                size={20}
                className="profile-save-btn"
              />
              <IconButton
                src={cancel}
                alt="キャンセル"
                onClick={toggleEdit}
                disabled={isSaving}
                type="button"
                size={20}
                className="profile-cancel-btn"
              />
            </>
          )}
        </div>
      </div>
    </form>
  );
}
