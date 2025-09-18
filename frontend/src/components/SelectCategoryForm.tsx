// src/components/SelectCategoryForm.tsx
import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import type { Category } from "../types";
import Button from "./ui/Button";

type FormValues = {
  selectedCategories: string[];
}

type SelectCategoryFormProps = {
  categories: Category[];
  enableCategoryIds: string[];
  onSubmit: (toAdd: string[], toRemove: string[]) => void;
}

export default function SelectCategoryForm({ categories, enableCategoryIds, onSubmit }: SelectCategoryFormProps) {
  const { control, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: {
      selectedCategories: enableCategoryIds,
    }
  });

  // enableCategoryIds が変わったらフォームの値も更新
  useEffect(() => {
    reset({ selectedCategories: enableCategoryIds });
  }, [enableCategoryIds, reset]);

  return (
    <div className="select-category-form">
      <form onSubmit={handleSubmit(data => {
        const toAdd = data.selectedCategories.filter(id => !enableCategoryIds.includes(id));
        const toRemove = enableCategoryIds.filter(id => !data.selectedCategories.includes(id));
        onSubmit(toAdd, toRemove);
      })}>
        <div className="category-checkbox-grid">
          {categories.map(cat => (
            <Controller
              key={cat.id}
              name="selectedCategories"
              control={control}
              render={({ field }) => (
                <label className="category-checkbox-item">
                  <input
                    type="checkbox"
                    value={cat.id}
                    checked={field.value.includes(cat.id)}
                    onChange={e => {
                      if (e.target.checked) {
                        field.onChange([...field.value, cat.id]);
                      } else {
                        field.onChange(field.value.filter(v => v !== cat.id));
                      }
                    }}
                    className="category-checkbox"
                  />
                  <span className="category-checkbox-label">{cat.name}</span>
                  <span className="category-checkbox-check">✓</span>
                </label>
              )}
            />
          ))}
        </div>
        <div className="form-actions">
          <Button type="submit" size="bg">
            選択を適用する
          </Button>
        </div>
      </form>
    </div>
  );
}
