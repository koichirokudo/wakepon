// src/components/ui/__tests__/IconButton.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import IconButton from '../IconButton'
import edit from '../../../assets/edit.png';

describe('IconButton Component', () => {
  it('画像が正しく表示される', () => {
    render(<IconButton alt='テストアイコン' src={edit} />)
    const img = screen.getByAltText('テストアイコン')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', '/src/assets/edit.png')
    expect(img).toHaveAttribute('width', '18')
    expect(img).toHaveAttribute('height', '18')
  })


  it('クリックイベントが動作する', async () => {
    const handleClick = vi.fn()
    render(<IconButton src={edit} alt="アイコン" onClick={handleClick} />)

    const button = screen.getByRole('button')
    await userEvent.click(button)

    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
