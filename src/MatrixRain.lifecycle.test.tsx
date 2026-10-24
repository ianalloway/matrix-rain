import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import MatrixRain from './MatrixRain';
import type { MatrixRainProps } from './MatrixRain';

// Exercise the component's browser effect without a real canvas or timers.
const hooks = vi.hoisted(() => ({
  canvas: undefined as unknown,
  effect: undefined as undefined | (() => void | (() => void)),
}));

vi.mock('react', async (importOriginal) => ({
  ...await importOriginal<typeof import('react')>(),
  useRef: () => ({ current: hooks.canvas }),
  useEffect: (effect: () => void | (() => void)) => { hooks.effect = effect; },
}));

describe('MatrixRain animation lifecycle', () => {
  let documentState: EventTarget & { hidden: boolean };
  let media: EventTarget & { matches: boolean };
  let frames: Map<number, FrameRequestCallback>;
  let clearRect: ReturnType<typeof vi.fn>;
  let cleanup: void | (() => void);

  beforeEach(() => {
    documentState = Object.assign(new EventTarget(), { hidden: false });
    media = Object.assign(new EventTarget(), { matches: false });
    frames = new Map();
    let nextFrame = 0; // A request ID of zero must still be cancellable.
    clearRect = vi.fn();
    hooks.canvas = {
      style: {}, width: 0, height: 0,
      getContext: () => ({
        setTransform: vi.fn(), clearRect, fillRect: vi.fn(), fillText: vi.fn(),
      }),
    };
    vi.stubGlobal('document', documentState);
    vi.stubGlobal('window', Object.assign(new EventTarget(), {
      innerWidth: 800, innerHeight: 600, devicePixelRatio: 1,
      matchMedia: () => media,
    }));
    vi.stubGlobal('requestAnimationFrame', vi.fn((callback: FrameRequestCallback) => {
      const id = nextFrame++;
      frames.set(id, callback);
      return id;
    }));
    vi.stubGlobal('cancelAnimationFrame', vi.fn((id: number) => frames.delete(id)));
  });

  afterEach(() => {
    if (typeof cleanup === 'function') cleanup();
    cleanup = undefined;
    vi.unstubAllGlobals();
  });

  const mount = (props: MatrixRainProps = {}) => {
    MatrixRain(props);
    cleanup = hooks.effect?.();
  };

  it('waits for a tab that was hidden before mount to become visible', () => {
    documentState.hidden = true;
    mount();
    expect(frames.size).toBe(0);
    documentState.hidden = false;
    documentState.dispatchEvent(new Event('visibilitychange'));
    expect(frames.size).toBe(1);
  });

  it('stops and clears immediately when reduced motion is enabled', () => {
    mount();
    expect(frames.size).toBe(1);
    media.matches = true;
    media.dispatchEvent(new Event('change'));
    expect(frames.size).toBe(0);
    expect(clearRect).toHaveBeenCalledWith(0, 0, 800, 600);
    documentState.dispatchEvent(new Event('visibilitychange'));
    expect(frames.size).toBe(0);
  });

  it('resumes after reduced motion is disabled without duplicate loops', () => {
    media.matches = true;
    mount();
    expect(frames.size).toBe(0);
    media.matches = false;
    media.dispatchEvent(new Event('change'));
    media.dispatchEvent(new Event('change'));
    expect(frames.size).toBe(1);
  });

  it('keeps a hidden tab paused when reduced motion is disabled', () => {
    documentState.hidden = true;
    media.matches = true;
    mount();
    media.matches = false;
    media.dispatchEvent(new Event('change'));
    expect(frames.size).toBe(0);
  });

  it('supports opting out of the motion preference', () => {
    media.matches = true;
    mount({ respectReducedMotion: false });
    expect(frames.size).toBe(1);
    expect(clearRect).not.toHaveBeenCalled();
  });

  it('cancels frames and removes listeners on unmount', () => {
    mount();
    if (typeof cleanup === 'function') cleanup();
    cleanup = undefined;
    expect(frames.size).toBe(0);
    media.dispatchEvent(new Event('change'));
    documentState.dispatchEvent(new Event('visibilitychange'));
    expect(frames.size).toBe(0);
  });
});
