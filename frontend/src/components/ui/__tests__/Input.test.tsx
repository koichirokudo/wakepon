// src/components/ui/__tests__/Input.test.tsx
import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Input from '../Input'
import { vi } from 'vitest'

describe('Input Component', () => {
  it('基本的なレンダリングができる', () => {
    render(<Input placeholder="テストプレースホルダー" />)
    expect(screen.getByPlaceholderText('テストプレースホルダー')).toBeInTheDocument()
  })

  it('ラベルが正しく表示される', () => {
    render(<Input label="テストラベル" />)
    expect(screen.getByText('テストラベル')).toBeInTheDocument()
  })

  it('エラーメッセージが表示される', () => {
    render(<Input error="エラーメッセージ" />)
    expect(screen.getByText('エラーメッセージ')).toBeInTheDocument()
  })

  it('ユーザーの入力を受け取る', async () => {
    const user = userEvent.setup()
    const mockOnChange = vi.fn()
    
    render(<Input onChange={mockOnChange} />)
    
    const input = screen.getByRole('textbox')
    await user.type(input, 'テスト入力')
    
    expect(mockOnChange).toHaveBeenCalled()
    expect(input).toHaveValue('テスト入力')
  })

  it('ref が正しく転送される', () => {
    const ref = React.createRef<HTMLInputElement>()
    render(<Input ref={ref} />)
    
    expect(ref.current).toBeInstanceOf(HTMLInputElement)
  })
})
