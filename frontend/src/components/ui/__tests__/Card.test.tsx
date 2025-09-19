import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Card, { CardHeader, CardBody, CardFooter } from '../Card';

describe('Card', () => {
  it('基本的なCardコンポーネントをレンダリングできる', () => {
    render(
      <Card>
        <p>テストコンテンツ</p>
      </Card>
    );

    expect(screen.getByText('テストコンテンツ')).toBeInTheDocument();
  });

  it('適切なクラス名が設定される', () => {
    const { container } = render(
      <Card>
        <p>テスト</p>
      </Card>
    );

    expect(container.firstChild).toHaveClass('card');
  });

  it('複数の子要素をレンダリングできる', () => {
    render(
      <Card>
        <p>最初の要素</p>
        <p>二番目の要素</p>
      </Card>
    );

    expect(screen.getByText('最初の要素')).toBeInTheDocument();
    expect(screen.getByText('二番目の要素')).toBeInTheDocument();
  });
});

describe('CardHeader', () => {
  it('CardHeaderコンポーネントをレンダリングできる', () => {
    render(
      <CardHeader>
        <h2>ヘッダータイトル</h2>
      </CardHeader>
    );

    expect(screen.getByText('ヘッダータイトル')).toBeInTheDocument();
  });

  it('適切なクラス名が設定される', () => {
    const { container } = render(
      <CardHeader>
        <h2>テスト</h2>
      </CardHeader>
    );

    expect(container.firstChild).toHaveClass('card-header');
  });
});

describe('CardBody', () => {
  it('CardBodyコンポーネントをレンダリングできる', () => {
    render(
      <CardBody>
        <p>ボディコンテンツ</p>
      </CardBody>
    );

    expect(screen.getByText('ボディコンテンツ')).toBeInTheDocument();
  });

  it('適切なクラス名が設定される', () => {
    const { container } = render(
      <CardBody>
        <p>テスト</p>
      </CardBody>
    );

    expect(container.firstChild).toHaveClass('card-body');
  });
});

describe('CardFooter', () => {
  it('CardFooterコンポーネントをレンダリングできる', () => {
    render(
      <CardFooter>
        <button>フッターボタン</button>
      </CardFooter>
    );

    expect(screen.getByText('フッターボタン')).toBeInTheDocument();
  });

  it('適切なクラス名が設定される', () => {
    const { container } = render(
      <CardFooter>
        <button>テスト</button>
      </CardFooter>
    );

    expect(container.firstChild).toHaveClass('card-footer');
  });
});

describe('Card組み合わせテスト', () => {
  it('Card、CardHeader、CardBody、CardFooterを組み合わせて使用できる', () => {
    render(
      <Card>
        <CardHeader>
          <h2>カードタイトル</h2>
        </CardHeader>
        <CardBody>
          <p>カードの内容です</p>
        </CardBody>
        <CardFooter>
          <button>アクション</button>
        </CardFooter>
      </Card>
    );

    expect(screen.getByText('カードタイトル')).toBeInTheDocument();
    expect(screen.getByText('カードの内容です')).toBeInTheDocument();
    expect(screen.getByText('アクション')).toBeInTheDocument();
  });
});