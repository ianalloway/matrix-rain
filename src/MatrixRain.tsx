import { useEffect, useRef } from 'react';

const CHARS = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';

interface Column {
  y: number;
  speed: number;
  opacity: number;
  length: number;
  /** When set, this column draws the message as a highlighted glyph run. */
  message: string | null;
}

export interface MatrixRainProps {
  /**
   * Font size in CSS pixels. Default: 13
   */
  fontSize?: number;
  /**
   * Device pixel ratio cap. Default: 2 (prevents 3x/4x perf cost on retina)
   */
  maxDpr?: number;
  /**
   * Color of the lead character. Default: 'rgba(200, 255, 200, OPACITY)'
   */
  leadColor?: string;
  /**
   * Color of the trail characters. Default: 'rgba(0, 200, 70, OPACITY)'
   */
  trailColor?: string;
  /**
   * Color of the accent (3% chance per character). Default: 'rgba(0, 210, 210, OPACITY)'
   */
  accentColor?: string;
  /**
   * Trail fade per character (0..1). Default: 0.6
   */
  trailFade?: number;
  /**
   * Probability of accent color per character. Default: 0.03
   */
  accentProbability?: number;
  /**
   * Canvas CSS opacity. Default: 0.16
   */
  opacity?: number;
  /**
   * Custom CSS class for the canvas element. Default: 'matrix-rain'
   */
  className?: string;
  /**
   * Custom inline style for the canvas wrapper. Default: fixed inset-0 pointer-events-none z-0
   */
  style?: React.CSSProperties;
  /**
   * Respect prefers-reduced-motion. Default: true
   */
  respectReducedMotion?: boolean;
  /**
   * Target frames per second cap. Default: 35
   */
  maxFps?: number;
  /**
   * Global fall-speed multiplier. Default: 1
   */
  speed?: number;
  /**
   * Optional short strings that occasionally fall as highlighted glyph runs
   * amid the normal rain. Empty/omitted keeps classic random rain only.
   * Ignored when prefers-reduced-motion is honored (animation is skipped).
   *
   * @example messages={['SHIP IT', 'CLV', '0x']}
   */
  messages?: string[];
  /**
   * Chance (0..1) that a resetting column becomes a message column when
   * `messages` is non-empty. Default: 0.06
   */
  messageProbability?: number;
  /**
   * RGB triplet for message glyph runs. Default: same as `leadColor`
   */
  messageColor?: string;
}

const createColumn = (
  cssHeight: number,
  messages: string[] | undefined,
  messageProbability: number,
): Column => {
  const message =
    messages && messages.length > 0 && Math.random() < messageProbability
      ? messages[Math.floor(Math.random() * messages.length)]
      : null;

  const length = message
    ? Math.max(message.length, 8 + Math.floor(Math.random() * 8))
    : 8 + Math.floor(Math.random() * 20);

  return {
    y: Math.random() * -cssHeight,
    speed: 0.5 + Math.random() * 1.5,
    opacity: 0.4 + Math.random() * 0.6,
    length,
    message,
  };
};

/**
 * MatrixRain — A Matrix-style digital rain animation for React.
 *
 * Features:
 * - HiDPI/retina support (capped at 2x DPR for performance)
 * - Auto-pauses when tab is hidden (battery friendly)
 * - Respects prefers-reduced-motion
 * - Optional message rain (inject short strings as highlighted glyph runs)
 * - Frame-rate capped at 35fps by default
 * - Zero dependencies
 *
 * @example
 * ```tsx
 * import MatrixRain from '@ianalloway/matrix-rain';
 *
 * function App() {
 *   return (
 *     <div>
 *       <MatrixRain messages={['SHIP IT', 'CLV', '0x']} />
 *       <YourContent />
 *     </div>
 *   );
 * }
 * ```
 */
const MatrixRain = ({
  fontSize = 13,
  maxDpr = 2,
  leadColor = '200, 255, 200',
  trailColor = '0, 200, 70',
  accentColor = '0, 210, 210',
  trailFade = 0.6,
  accentProbability = 0.03,
  opacity = 0.16,
  className = 'matrix-rain',
  style,
  respectReducedMotion = true,
  maxFps = 35,
  speed = 1,
  messages,
  messageProbability = 0.06,
  messageColor,
}: MatrixRainProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const msgColor = messageColor ?? leadColor;
  // Stable dep key so identity-changing arrays with the same content don't restart the loop.
  const messagesKey = messages ? JSON.stringify(messages) : '';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (respectReducedMotion && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const activeMessages = messagesKey
      ? (JSON.parse(messagesKey) as string[]).map((m) => m.trim()).filter(Boolean)
      : undefined;

    let columns: Column[] = [];
    let animId: number;
    let lastTime = 0;
    let cssWidth = window.innerWidth;
    let cssHeight = window.innerHeight;
    const speedMul = Math.max(0, speed);

    const spawnColumn = () => createColumn(cssHeight, activeMessages, messageProbability);

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
      cssWidth = window.innerWidth;
      cssHeight = window.innerHeight;
      canvas.width = Math.floor(cssWidth * dpr);
      canvas.height = Math.floor(cssHeight * dpr);
      canvas.style.width = `${cssWidth}px`;
      canvas.style.height = `${cssHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const cols = Math.floor(cssWidth / fontSize);
      columns = Array.from({ length: cols }, spawnColumn);
    };

    const onVisibilityChange = () => {
      if (document.hidden) {
        cancelAnimationFrame(animId);
        animId = 0;
      } else if (!animId) {
        lastTime = 0;
        animId = requestAnimationFrame(draw);
      }
    };

    const glyphFor = (col: Column, trailIndex: number): string => {
      if (col.message) {
        // Message reads top→bottom: trailIndex 0 is the lead (bottom / newest),
        // higher indices walk back toward the start of the string.
        const msg = col.message;
        if (trailIndex < msg.length) {
          return msg[msg.length - 1 - trailIndex];
        }
      }
      return CHARS[Math.floor(Math.random() * CHARS.length)];
    };

    const draw = (time: number) => {
      const minDelta = 1000 / maxFps;
      const delta = time - lastTime;
      if (delta < minDelta) {
        animId = requestAnimationFrame(draw);
        return;
      }
      lastTime = time;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.06)';
      ctx.fillRect(0, 0, cssWidth, cssHeight);

      columns.forEach((col, i) => {
        const x = i * fontSize;
        const isMessage = Boolean(col.message);
        const msgLen = col.message?.length ?? 0;

        // Lead character — bright (message leads use messageColor)
        if (col.y > 0 && col.y < cssHeight) {
          ctx.fillStyle = isMessage
            ? `rgba(${msgColor}, ${Math.min(1, col.opacity + 0.25)})`
            : `rgba(${leadColor}, ${col.opacity})`;
          ctx.font = `bold ${fontSize}px "Fira Code", monospace`;
          ctx.fillText(glyphFor(col, 0), x, col.y);
        }

        // Trail characters
        for (let t = 1; t < col.length; t++) {
          const ty = col.y - t * fontSize;
          if (ty < 0 || ty > cssHeight) continue;
          const fade = 1 - t / col.length;
          const inMessageRun = isMessage && t < msgLen;

          if (inMessageRun) {
            ctx.fillStyle = `rgba(${msgColor}, ${fade * col.opacity})`;
            ctx.font = `bold ${fontSize}px "Fira Code", monospace`;
          } else {
            const isAccent = Math.random() < accentProbability;
            if (isAccent) {
              ctx.fillStyle = `rgba(${accentColor}, ${fade * col.opacity * 0.7})`;
            } else {
              ctx.fillStyle = `rgba(${trailColor}, ${fade * col.opacity * trailFade})`;
            }
            ctx.font = `${fontSize}px "Fira Code", monospace`;
          }
          ctx.fillText(glyphFor(col, t), x, ty);
        }

        col.y += fontSize * col.speed * speedMul;
        if (col.y > cssHeight + col.length * fontSize && Math.random() > 0.97) {
          const next = createColumn(0, activeMessages, messageProbability);
          col.y = -next.length * fontSize;
          col.speed = next.speed;
          col.opacity = next.opacity;
          col.length = next.length;
          col.message = next.message;
        }
      });

      animId = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', onVisibilityChange);
    animId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [
    fontSize,
    maxDpr,
    leadColor,
    trailColor,
    accentColor,
    trailFade,
    accentProbability,
    respectReducedMotion,
    maxFps,
    speed,
    messagesKey,
    messageProbability,
    msgColor,
  ]);

  const defaultStyle: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    pointerEvents: 'none',
    zIndex: 0,
    opacity,
  };

  return <canvas ref={canvasRef} className={className} style={{ ...defaultStyle, ...style }} aria-hidden="true" />;
};

export default MatrixRain;
export { MatrixRain };
