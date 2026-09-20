import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import MatrixRain, { MatrixRain as NamedMatrixRain } from './MatrixRain';
import type { MatrixRainProps } from './MatrixRain';

describe('MatrixRain', () => {
  it('renders an accessible, hidden canvas with defaults', () => {
    const html = renderToStaticMarkup(<MatrixRain />);
    expect(html).toContain('<canvas');
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('class="matrix-rain"');
  });

  it('applies custom className and opacity', () => {
    const html = renderToStaticMarkup(<MatrixRain className="custom" opacity={0.5} />);
    expect(html).toContain('class="custom"');
    expect(html).toContain('opacity:0.5');
  });

  it('exports the same component as default and named', () => {
    expect(NamedMatrixRain).toBe(MatrixRain);
  });

  it('accepts optional message-rain props without changing markup', () => {
    const props: MatrixRainProps = {
      messages: ['SHIP IT', 'CLV', '0x'],
      messageProbability: 0.1,
      messageColor: '180, 255, 220',
      speed: 1.2,
    };
    const html = renderToStaticMarkup(<MatrixRain {...props} />);
    expect(html).toContain('<canvas');
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('class="matrix-rain"');
  });
});
