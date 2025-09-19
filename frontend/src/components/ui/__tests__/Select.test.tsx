import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import userEvent from '@testing-library/user-event';
import Select from '../Select';

describe('Select', () => {
  const mockValues = [
    { id: '1', name: 'オプション1' },
    { id: '2', name: 'オプション2' },
    { id: '3', name: 'オプション3' }
  ];

  it('基本的なSelectコンポーネントをレンダリングできる', () => {
    render(<Select values={mockValues} />);

    const selectElement = screen.getByRole('combobox');
    expect(selectElement).toBeInTheDocument();
    expect(selectElement).toHaveClass('select-base');
  });

  it('ラベルが表示される', () => {
    render(<Select label="カテゴリを選択" values={mockValues} />);

    expect(screen.getByText('カテゴリを選択')).toBeInTheDocument();
    expect(screen.getByLabelText('カテゴリを選択')).toBeInTheDocument();
  });

  it('ラベルなしでもレンダリングできる', () => {
    render(<Select values={mockValues} />);

    const selectElement = screen.getByRole('combobox');
    expect(selectElement).toBeInTheDocument();
  });

  it('オプションが正しく表示される', () => {
    render(<Select values={mockValues} />);

    expect(screen.getByRole('option', { name: 'オプション1' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'オプション2' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'オプション3' })).toBeInTheDocument();
  });

  it('オプションの値が正しく設定される', () => {
    render(<Select values={mockValues} />);

    const option1 = screen.getByRole('option', { name: 'オプション1' }) as HTMLOptionElement;
    const option2 = screen.getByRole('option', { name: 'オプション2' }) as HTMLOptionElement;
    const option3 = screen.getByRole('option', { name: 'オプション3' }) as HTMLOptionElement;

    expect(option1.value).toBe('1');
    expect(option2.value).toBe('2');
    expect(option3.value).toBe('3');
  });

  it('エラーメッセージが表示される', () => {
    render(<Select values={mockValues} error="必須項目です" />);

    expect(screen.getByText('必須項目です')).toBeInTheDocument();
    expect(screen.getByText('必須項目です')).toHaveClass('input-error');
  });

  it('エラーメッセージなしでもレンダリングできる', () => {
    render(<Select values={mockValues} />);

    expect(screen.queryByText('必須項目です')).not.toBeInTheDocument();
  });

  it('値を選択できる', async () => {
    const user = userEvent.setup();
    render(<Select values={mockValues} />);

    const selectElement = screen.getByRole('combobox');
    await user.selectOptions(selectElement, '2');

    expect(selectElement).toHaveValue('2');
  });

  it('デフォルト値が設定される', () => {
    render(<Select values={mockValues} defaultValue="2" />);

    const selectElement = screen.getByRole('combobox');
    expect(selectElement).toHaveValue('2');
  });

  it('disabledプロパティが機能する', () => {
    render(<Select values={mockValues} disabled />);

    const selectElement = screen.getByRole('combobox');
    expect(selectElement).toBeDisabled();
  });

  it('nameプロパティが設定される', () => {
    render(<Select values={mockValues} name="category" />);

    const selectElement = screen.getByRole('combobox');
    expect(selectElement).toHaveAttribute('name', 'category');
  });

  it('空の配列でもレンダリングできる', () => {
    render(<Select values={[]} />);

    const selectElement = screen.getByRole('combobox');
    expect(selectElement).toBeInTheDocument();
    expect(selectElement.children).toHaveLength(0);
  });

  it('数値のidでも正しく動作する', () => {
    const numericValues = [
      { id: 1, name: 'オプション1' },
      { id: 2, name: 'オプション2' }
    ];

    render(<Select values={numericValues as any} />);

    const option1 = screen.getByRole('option', { name: 'オプション1' }) as HTMLOptionElement;
    const option2 = screen.getByRole('option', { name: 'オプション2' }) as HTMLOptionElement;

    expect(option1.value).toBe('1');
    expect(option2.value).toBe('2');
  });

  it('forwardRefが正しく動作する', () => {
    const ref = { current: null };
    render(<Select ref={ref} values={mockValues} />);

    expect(ref.current).toBeInstanceOf(HTMLSelectElement);
  });
});