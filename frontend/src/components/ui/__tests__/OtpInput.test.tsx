// src/components/ui/__tests__/OtpInput.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { OTPInput } from '../OtpInput'
import { vi } from 'vitest'

describe('OtpInput Component', () => {
  it('基本的なレンダリングができる', () => {
    const { getAllByRole } = render(<OTPInput length={6} onComplete={vi.fn()}/>)
    expect(getAllByRole('textbox')).toHaveLength(6)
  })

  it('数字を入力したら値が更新され、フォーカスが次に移動する', async () => {
    const onComplete = vi.fn()
    const { getAllByRole } = render(<OTPInput length={6} onComplete={onComplete} />)
    const inputs = getAllByRole('textbox')

    await userEvent.type(inputs[0], '1')
    expect(inputs[0]).toHaveValue('1')
    expect(document.activeElement).toBe(inputs[1])
  })

  it('バックスペースで数字が削除できる', async () => {
    const onComplete = vi.fn()
    const { getAllByRole } = render(<OTPInput length={6} onComplete={onComplete} />)
    const inputs = getAllByRole('textbox')

    await userEvent.type(inputs[0], '1')
    await userEvent.keyboard('{Backspace}')
    expect(inputs[0]).toHaveValue('')
  })

  it('貼り付け操作で値が正しくセットされる', async () => {
    const onComplete = vi.fn()
    render(<OTPInput length={6} onComplete={onComplete} />)
    const inputs = screen.getAllByRole('textbox')

    inputs[0].focus();

    await userEvent.paste("123456");

    expect(inputs.map(i => (i as HTMLInputElement).value)).toEqual([
      "1", "2", "3", "4", "5", "6"
    ])
    expect(onComplete).toHaveBeenCalledWith("123456")
  })
})
