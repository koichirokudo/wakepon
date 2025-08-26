// src/components/CategoryForm.tsx
import type { CategoryInput } from '../types';

type CategoryFormProps = {
  values: CategoryInput;
  editing?: boolean;
  onChange: (values: CategoryInput) => void;
  onSubmit: () => void;
  onCancel?: () => void;
}

export default function CategoryForm({ values, editing = false, onChange, onSubmit, onCancel }: CategoryFormProps) {
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
      <input type="text" value={values.name} placeholder="カテゴリ名" maxLength={10} onChange={(e) => onChange({ ...values, name: e.target.value })} required /><br /><br />
      {editing ? (
        <>
          <button type="submit">保存</button>
          <button type="button" onClick={onCancel}>キャンセル</button>
        </>
      ) : (
        <button type="submit">追加</button>
      )}
    </form>
  );
}