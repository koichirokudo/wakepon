// src/components/ui/__tests__/Button.test.tsx
import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Button from '../Button'
import { vi } from 'vitest'

describe('Button Component', () => {
  it('基本的なレンダリングができる', () => {
    render(<Button>テストボタン</Button>)
    const button = screen.getByText('テストボタン')
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass('button-base button-primary button-md')
  })

  it('variant と size が反映される', () => {
    render(<Button variant='danger' size='lg'>削除</Button>)
    const button = screen.getByText('削除')
    expect(button).toHaveClass('button-danger button-lg')
  })

  it('disabled が効く', () => {
    render(<Button disabled>押せない</Button>)
    expect(screen.getByText('押せない')).toBeDisabled()
  })

  it('クリックイベントが動作する', async () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>クリック</Button>)

    const button = screen.getByText('クリック')
    await userEvent.click(button)

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('ref が正しく転送される', () => {
    const ref = React.createRef<HTMLButtonElement>()
    render(<Button ref={ref}>ref</Button>)

    expect(ref.current).toBeInstanceOf(HTMLButtonElement)
  })

})
